import { Router } from "express";
import { z } from "zod";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import type { OrderDeduplicator } from "../lib/order-deduplicator";
import { strictWebhookRateLimiter } from "../middleware/rate-limiter";
import type { OrderMapper } from "../mappers/order.mapper";
import type { CloverService } from "../services/clover.service";
import type { LightspeedService } from "../services/lightspeed.service";
import type { OrderQueueService } from "../services/order-queue.service";
import { OrderProcessorService } from "../services/order-processor.service";
import type { OrderProcessorDependencies } from "../services/order-processor.service";
import type { RawBodyRequest } from "../types/express";

// Clover webhook event structure (nested in merchants object)
const CloverWebhookEventSchema = z.object({
  objectId: z.string(),
  type: z.string(),
  ts: z.number(),
  payload: z.record(z.string(), z.any()).optional(),
});

// Clover webhook payload structure
const CloverWebhookSchema = z.object({
  appId: z.string(),
  merchants: z.record(z.string(), z.array(CloverWebhookEventSchema)),
});

// Valid event types for order processing
const VALID_ORDER_EVENT_TYPES = ["ORDER_CREATED", "ORDER_UPDATED", "UPDATE", "CREATE", "ORDER"];

export interface WebhookRouterDependencies {
  cloverService: CloverService;
  lightspeedService: LightspeedService;
  orderMapper: OrderMapper;
  env: Env;
  deduplicator?: OrderDeduplicator;
  queueService?: OrderQueueService;
}

export const createWebhookRouter = ({
  cloverService,
  lightspeedService,
  orderMapper,
  env,
  deduplicator,
  queueService,
}: WebhookRouterDependencies) => {
  const router = Router();
  const processorDeps: OrderProcessorDependencies = {
    cloverService,
    lightspeedService,
    orderMapper,
    env,
    ...(deduplicator && { deduplicator }),
  };

  const processor = new OrderProcessorService(processorDeps);

  // Handle GET requests for webhook verification (Clover may send GET to verify endpoint)
  router.get("/clover/orders", (req, res) => {
    // Clover may send a verification challenge parameter
    const challenge = req.query.challenge || req.query.verify_token || req.query.hub_challenge;
    
    if (challenge) {
      // Echo back the challenge for verification
      logger.info({ challenge }, "Responding to Clover webhook verification challenge");
      return res.status(200).send(challenge);
    }
    
    // Default response for health checks with diagnostic information
    res.status(200).json({ 
      message: "Webhook endpoint is active",
      endpoint: "/webhooks/clover/orders",
      methods: ["GET", "POST"],
      configuration: {
        hasCloverMerchantId: !!env.CLOVER_MERCHANT_ID,
        hasCloverAccessToken: !!env.CLOVER_ACCESS_TOKEN,
        hasWebhookSecret: !!(env.CLOVER_WEBHOOK_SECRET || env.WEBHOOK_SIGNATURE_SECRET),
        hasLightspeedShopId: !!env.LIGHTSPEED_SHOP_ID,
        hasLightspeedDomain: !!env.LIGHTSPEED_DOMAIN,
        hasLightspeedToken: !!(env.LIGHTSPEED_PERSONAL_TOKEN || env.LIGHTSPEED_REFRESH_TOKEN),
        nodeEnv: env.NODE_ENV,
      },
      usage: {
        description: "POST orders here from Clover webhooks",
        headers: {
          "x-clover-auth": "Optional - webhook authentication token",
          "x-clover-signature": "Optional - HMAC signature",
        },
        body: {
          appId: "string",
          merchants: {
            "merchant-id": [
              {
                objectId: "order-id",
                type: "ORDER_CREATED | ORDER_UPDATED | etc",
                ts: 1234567890,
                payload: "optional order data"
              }
            ]
          }
        }
      }
    });
  });

  // POST endpoint for processing Clover order webhooks

  // Apply rate limiting to webhook endpoint
  router.post("/clover/orders", strictWebhookRateLimiter, async (req, res, next) => {
    const startTime = Date.now();
    try {
      const rawBody = (req as RawBodyRequest).rawBody ?? JSON.stringify(req.body);
      const signature =
        req.header("x-clover-signature") ?? req.header("X-Clover-Signature") ?? undefined;
      const cloverAuth = req.header("x-clover-auth") ?? req.header("X-Clover-Auth") ?? undefined;

      // Log all incoming requests for debugging with full headers
      logger.info({ 
        body: req.body,
        bodyKeys: req.body ? Object.keys(req.body) : [],
        headers: {
          "x-clover-signature": signature ? "present" : "missing",
          "x-clover-auth": cloverAuth ? "present" : "missing",
          "user-agent": req.header("user-agent"),
          "content-type": req.header("content-type"),
        },
        hasSignature: !!signature,
        hasCloverAuth: !!cloverAuth,
        eventType: req.body?.type,
        url: req.url,
        method: req.method,
      }, "Received webhook request");

      // Verify webhook authenticity
      // Clover may send either x-clover-signature (HMAC) or x-clover-auth (webhook secret)
      const isDevelopment = env.NODE_ENV === "development";
      const hasWebhookSecret = Boolean(env.CLOVER_WEBHOOK_SECRET || env.WEBHOOK_SIGNATURE_SECRET);
      
      if (cloverAuth) {
        // Verify using x-clover-auth header (matches webhook verification code)
        const isValid = cloverService.verifyWebhookAuth(cloverAuth);
        if (!isValid && hasWebhookSecret) {
          logger.warn({ 
            hasCloverAuth: true,
            webhookSecretConfigured: hasWebhookSecret,
            cloverAuthPrefix: cloverAuth.substring(0, 8) + "...",
          }, "Invalid x-clover-auth header - rejecting webhook");
          return res.status(401).json({ message: "Invalid Clover authentication" });
        }
        if (!isValid && !hasWebhookSecret && !isDevelopment) {
          logger.warn("Webhook secret not configured - authentication disabled (not recommended in production)");
        }
        logger.info("Webhook authenticated via x-clover-auth header");
      } else if (signature) {
        // Verify using x-clover-signature header (HMAC signature)
        const isValid = cloverService.verifySignature(signature, rawBody);
        if (!isValid && hasWebhookSecret) {
          logger.warn({ 
            hasSignature: true,
            webhookSecretConfigured: hasWebhookSecret,
            signaturePrefix: signature.substring(0, 8) + "...",
          }, "Invalid Clover HMAC signature - rejecting webhook");
          return res.status(401).json({ message: "Invalid Clover signature" });
        }
        if (!isValid && !hasWebhookSecret && !isDevelopment) {
          logger.warn("Webhook secret not configured - signature validation disabled (not recommended in production)");
        }
        logger.info("Webhook authenticated via x-clover-signature header");
      } else {
        // No authentication provided - might be initial verification
        if (!req.body || Object.keys(req.body).length === 0) {
          logger.info("Empty body, treating as verification request");
          return res.status(200).json({ message: "Webhook endpoint verified" });
        }
        
        // In development or if no webhook secret is configured, allow requests (with warning)
        if (isDevelopment || !hasWebhookSecret) {
          logger.warn({ 
            hasBody: !!req.body,
            bodyType: typeof req.body,
            bodyKeys: req.body ? Object.keys(req.body) : [],
            isDevelopment,
            hasWebhookSecret,
          }, "No authentication headers present - allowing in development/missing-secret mode");
        } else {
          logger.warn({ 
            headers: Object.keys(req.headers),
            hasBody: !!req.body,
          }, "No authentication headers present on non-empty request - rejecting");
          return res.status(401).json({ message: "Missing authentication" });
        }
      }

      // Validate webhook payload structure
      let webhook;
      try {
        webhook = CloverWebhookSchema.parse(req.body);
      } catch (parseError) {
        logger.error({
          error: parseError,
          body: req.body,
          bodyKeys: req.body ? Object.keys(req.body) : [],
          bodyType: typeof req.body,
        }, "Failed to parse webhook payload - invalid structure");
        
        // Return detailed error for debugging
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        return res.status(400).json({ 
          message: "Invalid webhook payload structure",
          error: errorMessage,
          expected: {
            appId: "string",
            merchants: "object with merchant IDs as keys, arrays of events as values"
          },
          received: req.body ? Object.keys(req.body) : "empty or null"
        });
      }

      logger.info({ 
        appId: webhook.appId, 
        merchantCount: Object.keys(webhook.merchants).length,
        merchantIds: Object.keys(webhook.merchants),
      }, "Processing Clover webhook");

      // Process events for each merchant
      const processedOrders: string[] = [];
      const failedOrders: Array<{ orderId: string; error: string }> = [];
      
      for (const [merchantId, events] of Object.entries(webhook.merchants)) {
        logger.info({ 
          merchantId, 
          eventCount: events.length,
          eventTypes: events.map(e => e.type),
        }, "Processing events for merchant");

        for (const event of events) {
          // Validate event type - only process order-related events
          if (!VALID_ORDER_EVENT_TYPES.includes(event.type)) {
            logger.debug(
              { eventType: event.type, orderId: event.objectId },
              "Skipping non-order event"
            );
            continue;
          }

          logger.info(
            { 
              eventType: event.type, 
              orderId: event.objectId, 
              timestamp: event.ts,
              hasPayload: !!event.payload,
              payloadKeys: event.payload ? Object.keys(event.payload as object) : [],
            },
            "Processing Clover order event"
          );

          // Small delay to handle Clover API race condition
          // Webhook can arrive before order is fully committed to API
          await new Promise(resolve => setTimeout(resolve, 500));

          let orderProcessed = false;

          // Check if webhook payload contains full order data (E-commerce API)
          // E-commerce API webhooks may include the full order in the payload
          if (event.payload && typeof event.payload === "object") {
            const payload = event.payload as Record<string, unknown>;
            
            // Check if payload looks like an order object
            if (payload.id || payload.lineItems || payload.total !== undefined) {
              logger.info({ 
                orderId: event.objectId,
                payloadHasId: !!payload.id,
                payloadHasLineItems: !!payload.lineItems,
                payloadHasTotal: payload.total !== undefined,
              }, "Webhook contains full order data, processing from payload");
              
              try {
                // Try to parse order from payload
                const order = cloverService.parseOrderFromPayload(payload);
                logger.info({ 
                  orderId: order.id,
                  itemCount: order.items?.length || 0,
                  orderTotal: order.total,
                }, "Parsed order from payload, processing");
                
                await processor.processOrderFromPayload(order);
                processedOrders.push(event.objectId);
                orderProcessed = true;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn({ 
                  error: errorMessage,
                  errorStack: error instanceof Error ? error.stack : undefined,
                  orderId: event.objectId,
                  payloadKeys: Object.keys(payload),
                }, "Failed to process order from payload, falling back to API fetch");
                // Fall through to API fetch
              }
            } else {
              logger.debug({ 
                orderId: event.objectId,
                payloadKeys: Object.keys(payload),
              }, "Payload exists but doesn't look like order data, will fetch from API");
            }
          }

          // Fallback: fetch order via API (for REST API accounts or if payload doesn't contain order)
          if (!orderProcessed) {
            try {
              logger.info({ orderId: event.objectId }, "Fetching order from Clover API");
              
              if (queueService) {
                logger.info({ orderId: event.objectId }, "Enqueuing order for async processing");
                await queueService.enqueue(event.objectId);
                processedOrders.push(event.objectId);
              } else {
                await processor.processByOrderId(event.objectId);
                processedOrders.push(event.objectId);
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              const errorStack = error instanceof Error ? error.stack : undefined;
              
              logger.error({ 
                error: errorMessage,
                errorStack,
                orderId: event.objectId,
                errorDetails: error instanceof Error ? {
                  name: error.name,
                  message: error.message,
                } : error,
              }, "Failed to process order");
              
              failedOrders.push({ 
                orderId: event.objectId, 
                error: errorMessage 
              });
              // Continue processing other orders even if one fails
            }
          }
        }
      }

      const processingTime = Date.now() - startTime;
      const response = {
        message: "Webhook processed",
        ordersProcessed: processedOrders.length,
        ordersFailed: failedOrders.length,
        orderIds: processedOrders,
        failedOrders: failedOrders.length > 0 ? failedOrders : undefined,
        processingTimeMs: processingTime,
      };

      if (failedOrders.length > 0) {
        logger.warn({
          processed: processedOrders.length,
          failed: failedOrders.length,
          failedOrders,
        }, "Webhook processing completed with some failures");
      } else {
        logger.info({
          processed: processedOrders.length,
          processingTimeMs: processingTime,
        }, "Webhook processing completed successfully");
      }

      return res.status(failedOrders.length > 0 ? 207 : 202).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error({
        error: errorMessage,
        errorStack,
        errorDetails: error,
        processingTimeMs: Date.now() - startTime,
      }, "Unhandled error processing webhook");
      
      return next(error);
    }
  });

  // Manual test endpoint for debugging (only in development or if explicitly enabled)
  if (env.NODE_ENV === "development" || process.env.ENABLE_MANUAL_TEST_ENDPOINT === "true") {
    router.post("/clover/orders/test/:orderId", async (req, res) => {
      const orderId = req.params.orderId;
      
      logger.info({ orderId, source: "manual-test-endpoint" }, "Manual order processing test");
      
      try {
        await processor.processByOrderId(orderId);
        
        res.json({
          success: true,
          message: `Order ${orderId} processed successfully`,
          orderId,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        logger.error({
          error: errorMessage,
          errorStack,
          orderId,
        }, "Manual order processing test failed");
        
        res.status(500).json({
          success: false,
          message: `Failed to process order ${orderId}`,
          error: errorMessage,
          orderId,
        });
      }
    });
  }

  return router;
};

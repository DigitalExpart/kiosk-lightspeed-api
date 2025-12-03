import { Router } from "express";
import { z } from "zod";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import type { OrderDeduplicator } from "../lib/order-deduplicator";
import { strictWebhookRateLimiter } from "../middleware/rate-limiter";
import type { OrderMapper } from "../mappers/order.mapper";
import { CloverService } from "../services/clover.service";
import type { LightspeedService } from "../services/lightspeed.service";
import type { OrderQueueService } from "../services/order-queue.service";
import { OrderProcessorService } from "../services/order-processor.service";
import type { OrderProcessorDependencies } from "../services/order-processor.service";
import type { RawBodyRequest } from "../types/express";

const CloverWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  objectId: z.string(),
  payload: z.record(z.string(), z.any()).optional(),
});

// Valid event types for order processing
const VALID_ORDER_EVENT_TYPES = ["ORDER_CREATED", "ORDER_UPDATED", "ORDER"];

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
    
    // Default response for health checks
    res.status(200).json({ message: "Webhook endpoint is active" });
  });

  // POST endpoint for processing Clover order webhooks

  // Apply rate limiting to webhook endpoint
  router.post("/clover/orders", strictWebhookRateLimiter, async (req, res, next) => {
    try {
      const rawBody = (req as RawBodyRequest).rawBody ?? JSON.stringify(req.body);
      const signature =
        req.header("x-clover-signature") ?? req.header("X-Clover-Signature") ?? undefined;
      const cloverAuth = req.header("x-clover-auth") ?? undefined;

      // Log all incoming requests for debugging
      logger.info({ 
        body: req.body, 
        hasSignature: !!signature,
        hasCloverAuth: !!cloverAuth,
        eventType: req.body?.type
      }, "Received webhook request");

      // Verify webhook authenticity
      // Clover may send either x-clover-signature (HMAC) or x-clover-auth (webhook secret)
      if (cloverAuth) {
        // Verify using x-clover-auth header (matches webhook verification code)
        if (!cloverService.verifyWebhookAuth(cloverAuth)) {
          logger.warn("Invalid x-clover-auth header");
          return res.status(401).json({ message: "Invalid Clover authentication" });
        }
        logger.info("Webhook authenticated via x-clover-auth header");
      } else if (signature) {
        // Verify using x-clover-signature header (HMAC signature)
        if (!cloverService.verifySignature(signature, rawBody)) {
          logger.warn("Invalid Clover HMAC signature");
          return res.status(401).json({ message: "Invalid Clover signature" });
        }
        logger.info("Webhook authenticated via x-clover-signature header");
      } else {
        // No authentication provided - might be initial verification
        if (!req.body || Object.keys(req.body).length === 0) {
          logger.info("Empty body, treating as verification request");
          return res.status(200).json({ message: "Webhook endpoint verified" });
        }
        logger.warn("No authentication headers present on non-empty request");
        return res.status(401).json({ message: "Missing authentication" });
      }

      const event = CloverWebhookSchema.parse(req.body);

      // Validate event type - only process order-related events
      if (!VALID_ORDER_EVENT_TYPES.includes(event.type)) {
        logger.info(
          { eventId: event.id, eventType: event.type, orderId: event.objectId },
          "Skipping non-order event"
        );
        return res.status(200).json({ message: "Event type not processed" });
      }

      logger.info(
        { eventId: event.id, eventType: event.type, orderId: event.objectId },
        "Processing Clover order event"
      );

      // Check if webhook payload contains full order data (E-commerce API)
      // E-commerce API webhooks may include the full order in the payload
      if (event.payload && typeof event.payload === "object") {
        const payload = event.payload as Record<string, unknown>;
        
        // Check if payload looks like an order object
        if (payload.id || payload.lineItems || payload.total !== undefined) {
          logger.info({ orderId: event.objectId }, "Webhook contains full order data, processing from payload");
          
          try {
            // Try to parse order from payload
            const order = cloverService.parseOrderFromPayload(payload);
            await processor.processOrderFromPayload(order);
            return res.status(202).json({ message: "Order accepted" });
          } catch (error) {
            logger.warn({ error, orderId: event.objectId }, "Failed to process order from payload, falling back to API fetch");
            // Fall through to API fetch
          }
        }
      }

      // Fallback: fetch order via API (for REST API accounts or if payload doesn't contain order)
      if (queueService) {
        await queueService.enqueue(event.objectId);
        return res.status(202).json({ message: "Order queued" });
      }

      await processor.processByOrderId(event.objectId);


      return res.status(202).json({ message: "Order accepted" });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};

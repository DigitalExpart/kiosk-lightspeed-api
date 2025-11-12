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

  // Apply rate limiting to webhook endpoint
  router.post("/clover/orders", strictWebhookRateLimiter, async (req, res, next) => {
    try {
      const rawBody = (req as RawBodyRequest).rawBody ?? JSON.stringify(req.body);
      const signature =
        req.header("x-clover-signature") ?? req.header("X-Clover-Signature") ?? undefined;

      if (!cloverService.verifySignature(signature, rawBody)) {
        return res.status(401).json({ message: "Invalid Clover signature" });
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

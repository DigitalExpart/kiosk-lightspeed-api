import { Router } from "express";
import { z } from "zod";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import type { OrderMapper } from "../mappers/order.mapper";
import type { CloverService } from "../services/clover.service";
import type { LightspeedService } from "../services/lightspeed.service";
import type { OrderQueueService } from "../services/order-queue.service";
import { OrderProcessorService } from "../services/order-processor.service";
import type { RawBodyRequest } from "../types/express";

const CloverWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  objectId: z.string(),
  payload: z.record(z.string(), z.any()).optional(),
});

export interface WebhookRouterDependencies {
  cloverService: CloverService;
  lightspeedService: LightspeedService;
  orderMapper: OrderMapper;
  env: Env;
  queueService?: OrderQueueService;
}

export const createWebhookRouter = ({
  cloverService,
  lightspeedService,
  orderMapper,
  env,
  queueService,
}: WebhookRouterDependencies) => {
  const router = Router();
  const processor = new OrderProcessorService({
    cloverService,
    lightspeedService,
    orderMapper,
    env,
  });

  router.post("/clover/orders", async (req, res, next) => {
    try {
      const rawBody = (req as RawBodyRequest).rawBody ?? JSON.stringify(req.body);
      const signature =
        req.header("x-clover-signature") ?? req.header("X-Clover-Signature") ?? undefined;

      if (!cloverService.verifySignature(signature, rawBody)) {
        return res.status(401).json({ message: "Invalid Clover signature" });
      }

      const event = CloverWebhookSchema.parse(req.body);

      logger.info({ eventId: event.id, orderId: event.objectId }, "Processing Clover order event");

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

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { OrderDeduplicator } from "./lib/order-deduplicator";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { createHealthRouter } from "./routes/health";
import { createWebhookRouter } from "./routes/webhooks";
import { CloverService } from "./services/clover.service";
import { LightspeedService } from "./services/lightspeed.service";
import { OrderMapper } from "./mappers/order.mapper";
import { OrderQueueService } from "./services/order-queue.service";

export const createServer = async () => {
  const app = express();

  app.disable("x-powered-by");
  
  // Trust Railway proxy headers
  app.set("trust proxy", true);
  
  app.use(helmet());
  app.use(cors());
  app.use(requestLogger);
  app.use(
    express.json({
      limit: "2mb",
      verify: (req: express.Request & { rawBody?: string }, _res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  const cloverService = new CloverService(env);
  const lightspeedService = new LightspeedService(env);
  const orderMapper = new OrderMapper();
  const deduplicator = new OrderDeduplicator();

  // Root route for basic service verification
  app.get("/", (_req, res) => {
    res.json({
      service: "Clover-Lightspeed Bridge",
      status: "running",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        webhooks: "/webhooks/clover/orders",
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/health", createHealthRouter());
  const queueService = env.USE_QUEUE ? new OrderQueueService(env) : undefined;

  const webhookDependencies: Parameters<typeof createWebhookRouter>[0] = {
    cloverService,
    lightspeedService,
    orderMapper,
    env,
    deduplicator,
  };

  if (queueService) {
    webhookDependencies.queueService = queueService;
  }


  app.use(
    "/webhooks",
    createWebhookRouter(webhookDependencies)
  );

  app.use(errorHandler);

  return app;
};

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { createHealthRouter } from "./routes/health";
import { createWebhookRouter } from "./routes/webhooks";
import { CloverService } from "./services/clover.service";
import { LightspeedService } from "./services/lightspeed.service";
import { OrderMapper } from "./mappers/order.mapper";
import { OrderQueueService } from "./services/order-queue.service";

export const createServer = async () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
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

  app.use("/health", createHealthRouter());
  const queueService = env.USE_QUEUE ? new OrderQueueService(env) : undefined;

  const webhookDependencies: Parameters<typeof createWebhookRouter>[0] = {
    cloverService,
    lightspeedService,
    orderMapper,
    env,
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

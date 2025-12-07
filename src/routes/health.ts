import { Router } from "express";

import { env } from "../config/env";
import { logger } from "../lib/logger";

export const createHealthRouter = () => {
  const router = Router();

  router.get("/", (_req, res) => {
    const health = {
      status: "ok" as const,
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      services: {
        clover: {
          configured: Boolean(env.CLOVER_MERCHANT_ID && env.CLOVER_ACCESS_TOKEN),
          hasMerchantId: !!env.CLOVER_MERCHANT_ID,
          hasAccessToken: !!env.CLOVER_ACCESS_TOKEN,
        },
        lightspeed: {
          configured: Boolean(
            (env.LIGHTSPEED_DOMAIN || env.LIGHTSPEED_ACCOUNT_ID) &&
            env.LIGHTSPEED_SHOP_ID &&
            (env.LIGHTSPEED_PERSONAL_TOKEN || env.LIGHTSPEED_REFRESH_TOKEN)
          ),
          hasDomain: !!env.LIGHTSPEED_DOMAIN,
          hasAccountId: !!env.LIGHTSPEED_ACCOUNT_ID,
          hasShopId: !!env.LIGHTSPEED_SHOP_ID,
          hasToken: !!(env.LIGHTSPEED_PERSONAL_TOKEN || env.LIGHTSPEED_REFRESH_TOKEN),
        },
        webhooks: {
          hasWebhookSecret: !!(env.CLOVER_WEBHOOK_SECRET || env.WEBHOOK_SIGNATURE_SECRET),
        },
        queue: {
          configured: Boolean(env.QUEUE_URL && env.AWS_REGION),
        },
      },
    };

    res.json(health);
  });

  router.get("/ready", async (_req, res) => {
    try {
      const checks: Record<string, boolean> = {
        clover: Boolean(env.CLOVER_MERCHANT_ID && env.CLOVER_ACCESS_TOKEN),
        lightspeed: Boolean(
          (env.LIGHTSPEED_DOMAIN || env.LIGHTSPEED_ACCOUNT_ID) &&
            env.LIGHTSPEED_SHOP_ID &&
            (env.LIGHTSPEED_PERSONAL_TOKEN || env.LIGHTSPEED_REFRESH_TOKEN)
        ),
      };

      const allReady = Object.values(checks).every((check) => check === true);

      if (allReady) {
        res.json({
          status: "ready",
          checks,
        });
      } else {
        res.status(503).json({
          status: "not ready",
          checks,
        });
      }
    } catch (error) {
      logger.error({ error }, "Health check failed");
      res.status(503).json({
        status: "error",
        message: "Health check failed",
      });
    }
  });

  return router;
};

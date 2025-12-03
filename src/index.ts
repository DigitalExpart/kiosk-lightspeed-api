import type { Server } from "http";
import { createServer } from "./server";
import { env } from "./config/env";
import { logger } from "./lib/logger";

let server: Server | null = null;

const start = async () => {
  try {
    const app = await createServer();
    const port = env.PORT;

    server = app.listen(port, () => {
      logger.info({ port }, "Clover-Lightspeed bridge listening");
    });

    // Graceful shutdown handling
    const shutdown = (signal: string) => {
      logger.info({ signal }, "Received shutdown signal, starting graceful shutdown");

      if (server) {
        server.close(() => {
          logger.info("HTTP server closed");
          process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
          logger.error("Forced shutdown after timeout");
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
      logger.fatal({ error }, "Uncaught exception");
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error({ reason, promise }, "Unhandled promise rejection");
      shutdown("unhandledRejection");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

void start();

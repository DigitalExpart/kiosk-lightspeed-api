import { createServer } from "./server";
import { env } from "./config/env";
import { logger } from "./lib/logger";

const start = async () => {
  try {
    const app = await createServer();
    const port = env.PORT;

    app.listen(port, () => {
      logger.info({ port }, "Clover-Lightspeed bridge listening");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

void start();

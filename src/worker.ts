import { ReceiveMessageCommand, DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

import { env } from "./config/env";
import { logger } from "./lib/logger";
import { OrderMapper } from "./mappers/order.mapper";
import { OrderProcessorService } from "./services/order-processor.service";
import type { QueueOrderPayload } from "./services/order-queue.service";
import { CloverService } from "./services/clover.service";
import { LightspeedService } from "./services/lightspeed.service";

const ensureQueueConfigured = () => {
  if (!env.QUEUE_URL || !env.AWS_REGION) {
    throw new Error("QUEUE_URL and AWS_REGION must be configured to run the worker");
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createSqsClient = () => new SQSClient({ region: env.AWS_REGION as string });

const start = async () => {
  ensureQueueConfigured();

  const sqsClient = createSqsClient();
  const cloverService = new CloverService(env);
  const lightspeedService = new LightspeedService(env);
  const orderMapper = new OrderMapper();
  const processor = new OrderProcessorService({
    cloverService,
    lightspeedService,
    orderMapper,
    env,
  });

  logger.info({ queueUrl: env.QUEUE_URL }, "Starting SQS order worker");

  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: env.QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 60,
      });

      const response = await sqsClient.send(command);
      const messages = response.Messages ?? [];

      if (messages.length === 0) {
        continue;
      }

      for (const message of messages) {
        if (!message.Body || !message.ReceiptHandle) {
          logger.warn({ messageId: message.MessageId }, "Skipping malformed SQS message");
          continue;
        }

        try {
          const payload = JSON.parse(message.Body) as QueueOrderPayload;

          if (!payload.orderId) {
            throw new Error("Queue payload missing orderId");
          }

          logger.info({ orderId: payload.orderId }, "Processing queued Clover order");

          await processor.processByOrderId(payload.orderId);

          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: env.QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
          );

          logger.info({ orderId: payload.orderId }, "Order processed and message deleted");
        } catch (error) {
          logger.error({ error, messageId: message.MessageId }, "Failed to process queued order");
          // Message will become visible again after visibility timeout for retry.
        }
      }
    } catch (error) {
      logger.error({ error }, "SQS poll failed");
      await sleep(5000);
    }
  }
};

void start().catch((error) => {
  logger.fatal({ error }, "Worker failed to start");
  process.exit(1);
});

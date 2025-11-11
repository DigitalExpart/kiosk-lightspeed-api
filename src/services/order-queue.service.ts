import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";

export interface QueueOrderPayload {
  orderId: string;
  receivedAt: string;
}

export class OrderQueueService {
  private readonly client: SQSClient;

  constructor(private readonly env: Env) {
    if (!env.QUEUE_URL) {
      throw new Error("QUEUE_URL must be configured for queue usage");
    }

    if (!env.AWS_REGION) {
      throw new Error("AWS_REGION must be set when QUEUE_URL is provided");
    }

    this.client = new SQSClient({
      region: env.AWS_REGION,
    });
  }

  async enqueue(orderId: string) {
    const payload: QueueOrderPayload = {
      orderId,
      receivedAt: new Date().toISOString(),
    };

    const message = JSON.stringify(payload);

    const command = new SendMessageCommand({
      QueueUrl: this.env.QUEUE_URL,
      MessageBody: message,
    });

    await this.client.send(command);
    logger.info({ orderId }, "Enqueued order for async processing");
  }
}

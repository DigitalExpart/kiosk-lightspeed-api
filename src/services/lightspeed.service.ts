import axios, { type AxiosInstance, type AxiosError } from "axios";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";
import type { LightspeedSalePayload } from "../types/lightspeed";

export class LightspeedService {
  private readonly client: AxiosInstance;

  constructor(private readonly env: Env) {
    if (!env.LIGHTSPEED_ACCOUNT_ID) {
      throw new Error("LIGHTSPEED_ACCOUNT_ID must be configured");
    }

    const token = env.LIGHTSPEED_PERSONAL_TOKEN;

    if (!token) {
      throw new Error("LIGHTSPEED_PERSONAL_TOKEN must be configured");
    }

    this.client = axios.create({
      baseURL: `https://api.lightspeedapp.com/API/Account/${env.LIGHTSPEED_ACCOUNT_ID}`,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  async createSale(payload: LightspeedSalePayload) {
    try {
      const response = await withRetry(
        async () => {
          return await this.client.post("/Sale.json", {
            Sale: payload,
          });
        },
        {
          maxAttempts: 3,
          initialDelayMs: 1000,
        }
      );

      logger.info(
        { saleId: response.data?.Sale?.saleID, referenceNumber: payload.referenceNumber },
        "Sale created successfully in Lightspeed"
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ httpCode?: number; httpMessage?: string; message?: string }>;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorData = axiosError.response.data;

        logger.error(
          {
            status,
            errorData,
            referenceNumber: payload.referenceNumber,
            url: axiosError.config?.url,
          },
          "Lightspeed API error"
        );

        const errorMessage =
          errorData?.message ||
          errorData?.httpMessage ||
          `Lightspeed API error: ${status} ${axiosError.response.statusText}`;

        throw new Error(errorMessage);
      }

      if (axiosError.request) {
        logger.error({ referenceNumber: payload.referenceNumber }, "No response from Lightspeed API");
        throw new Error("No response from Lightspeed API - network error");
      }

      logger.error({ error: axiosError, referenceNumber: payload.referenceNumber }, "Error creating sale in Lightspeed");
      throw error;
    }
  }
}

import axios, { type AxiosInstance, type AxiosError } from "axios";
import { createHmac, timingSafeEqual } from "crypto";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";
import type { CloverOrder } from "../types/clover";

export class CloverService {
  private readonly client: AxiosInstance;

  constructor(private readonly env: Env) {
    if (!env.CLOVER_MERCHANT_ID) {
      throw new Error("CLOVER_MERCHANT_ID must be configured");
    }

    this.client = axios.create({
      baseURL: `https://api.clover.com/v3/merchants/${env.CLOVER_MERCHANT_ID}`,
      headers: {
        Authorization: `Bearer ${env.CLOVER_ACCESS_TOKEN ?? ""}`,
        Accept: "application/json",
      },
    });
  }

  verifySignature(signature: string | undefined, payload: string): boolean {
    const secret = this.env.WEBHOOK_SIGNATURE_SECRET ?? this.env.CLOVER_WEBHOOK_SECRET;

    if (!secret) {
      // If no secret configured we cannot validate the signature; allow for development.
      return true;
    }

    if (!signature) {
      return false;
    }

    const computed = createHmac("sha256", secret).update(payload).digest("base64");

    const signatureBuffer = Buffer.from(signature);
    const computedBuffer = Buffer.from(computed);

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, computedBuffer);
  }

  async fetchOrder(orderId: string): Promise<CloverOrder> {
    try {
      const response = await withRetry(
        async () => {
          return await this.client.get(`/orders/${orderId}`, {
            params: {
              expand: "lineItems,lineItems.modifierGroups,lineItems.modifications,lineItems.discounts,discounts",
            },
          });
        },
        {
          maxAttempts: 3,
          initialDelayMs: 1000,
        }
      );

      const order = response.data;

      if (!order) {
        throw new Error(`Order ${orderId} not found in Clover`);
      }

      const items = (order?.lineItems?.elements ?? []).map((item: any) => {
        const itemData: {
          id: string;
          name: string;
          price: number;
          quantity: number;
          modifiers: Array<{ id: string; name: string; price: number }>;
          discounts?: Array<{ id: string; name: string; amount: number }>;
        } = {
          id: String(item.item?.id ?? item.id),
          name: String(item.name ?? ""),
          price: Number(item.price ?? 0) / 100,
          quantity: Number(item.quantity ?? 1),
          modifiers: (item.modifications?.elements ?? []).map((mod: any) => ({
            id: String(mod.id ?? ""),
            name: String(mod.name ?? ""),
            price: Number(mod.price ?? 0) / 100,
          })),
        };

        // Extract line item discounts
        if (item.discounts?.elements && item.discounts.elements.length > 0) {
          itemData.discounts = item.discounts.elements.map((discount: any) => ({
            id: String(discount.id ?? ""),
            name: String(discount.name ?? discount.percentage ?? ""),
            amount: Number(discount.amount ?? 0) / 100,
          }));
        }

        return itemData;
      });

      const cloverOrder: CloverOrder = {
        id: String(order.id ?? orderId),
        createdTime: Number(order.createdTime ?? Date.now()),
        currency: String(order.currency ?? "USD"),
        total: Number(order.total ?? 0) / 100,
        items,
        raw: order,
      };

      if (order.lastModifiedTime) {
        cloverOrder.lastModifiedTime = Number(order.lastModifiedTime);
      }

      if (!order.taxRemoved && order.taxAmount != null) {
        cloverOrder.taxAmount = Number(order.taxAmount) / 100;
      }

      if (order.tipAmount != null) {
        cloverOrder.tipAmount = Number(order.tipAmount) / 100;
      }

      // Extract order-level discounts
      if (order.discounts?.elements && order.discounts.elements.length > 0) {
        cloverOrder.discounts = order.discounts.elements.map((discount: any) => ({
          id: String(discount.id ?? ""),
          name: String(discount.name ?? discount.percentage ?? ""),
          amount: Number(discount.amount ?? 0) / 100,
        }));
      }

      if (order.customer?.id) {
        cloverOrder.customerId = String(order.customer.id);
      }

      if (order.tender?.id) {
        cloverOrder.tenderId = String(order.tender.id);
      }

      return cloverOrder;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorData = axiosError.response.data;

        logger.error(
          {
            status,
            errorData,
            orderId,
            url: axiosError.config?.url,
          },
          "Clover API error"
        );

        if (status === 404) {
          throw new Error(`Order ${orderId} not found in Clover`);
        }

        const errorMessage =
          (errorData as { message?: string })?.message ||
          `Clover API error: ${status} ${axiosError.response.statusText}`;

        throw new Error(errorMessage);
      }

      if (axiosError.request) {
        logger.error({ orderId }, "No response from Clover API");
        throw new Error("No response from Clover API - network error");
      }

      logger.error({ error: axiosError, orderId }, "Error fetching order from Clover");
      throw error;
    }
  }
}

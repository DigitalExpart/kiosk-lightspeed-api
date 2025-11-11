import axios, { type AxiosInstance } from "axios";
import { createHmac, timingSafeEqual } from "crypto";

import type { Env } from "../config/env";
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
    const response = await this.client.get(`/orders/${orderId}`, {
      params: {
        expand: "lineItems,lineItems.modifierGroups,lineItems.modifications",
      },
    });

    const order = response.data;

    const items = (order?.lineItems?.elements ?? []).map((item: any) => ({
      id: String(item.item?.id ?? item.id),
      name: String(item.name ?? ""),
      price: Number(item.price ?? 0) / 100,
      quantity: Number(item.quantity ?? 1),
      modifiers: (item.modifications?.elements ?? []).map((mod: any) => ({
        id: String(mod.id ?? ""),
        name: String(mod.name ?? ""),
        price: Number(mod.price ?? 0) / 100,
      })),
    }));

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

    if (order.customer?.id) {
      cloverOrder.customerId = String(order.customer.id);
    }

    if (order.tender?.id) {
      cloverOrder.tenderId = String(order.tender.id);
    }

    return cloverOrder;
  }
}

import axios, { type AxiosInstance, type AxiosError } from "axios";
import { createHmac, timingSafeEqual } from "crypto";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";
import type { CloverOrder } from "../types/clover";
import { CloverTokenManager } from "./clover-token-manager"; // OAuth token management

export class CloverService {
  private readonly client: AxiosInstance;
  private readonly tokenManager: CloverTokenManager | null;

  constructor(private readonly env: Env) {
    if (!env.CLOVER_MERCHANT_ID) {
      throw new Error("CLOVER_MERCHANT_ID must be configured");
    }

    // Initialize token manager if OAuth credentials are available
    let tokenManager: CloverTokenManager | null = null;
    try {
      tokenManager = new CloverTokenManager(env);
    } catch {
      // If OAuth not configured, fall back to direct token
      logger.warn("Clover OAuth not configured, using direct token if available");
    }

    this.tokenManager = tokenManager;

    // Use sandbox API if merchant ID starts with 'P' (sandbox merchant IDs often start with 'P')
    // or if we have CLOVER_SANDBOX=true in env. Otherwise use production.
    const useSandbox = env.CLOVER_MERCHANT_ID?.startsWith('P') || process.env.CLOVER_SANDBOX === 'true';
    const apiBase = useSandbox 
      ? `https://sandbox.dev.clover.com/v3/merchants/${env.CLOVER_MERCHANT_ID}`
      : `https://api.clover.com/v3/merchants/${env.CLOVER_MERCHANT_ID}`;

    this.client = axios.create({
      baseURL: apiBase,
      headers: {
        Accept: "application/json",
      },
    });

    if (useSandbox) {
      logger.info("Using Clover Sandbox API endpoints");
    }

    // Add request interceptor to inject OAuth token
    this.client.interceptors.request.use(async (config) => {
      if (this.tokenManager) {
        const token = await this.tokenManager.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else if (env.CLOVER_ACCESS_TOKEN) {
        config.headers.Authorization = `Bearer ${env.CLOVER_ACCESS_TOKEN}`;
      }
      return config;
    });

    // Add response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and we have a token manager, try refreshing
        if (error.response?.status === 401 && this.tokenManager && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.tokenManager.forceRefresh();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            logger.error({ error: refreshError }, "Failed to refresh Clover token after 401");
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Parse order from webhook payload (for E-commerce API accounts)
   * E-commerce API webhooks may include full order data in the payload
   */
  parseOrderFromPayload(payload: Record<string, unknown>): CloverOrder {
    const order = payload as any;

    const items = (order?.lineItems?.elements ?? order?.lineItems ?? []).map((item: any) => {
      const itemData: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        modifiers: Array<{ id: string; name: string; price: number }>;
        discounts?: Array<{ id: string; name: string; amount: number }>;
      } = {
        id: String(item.item?.id ?? item.id ?? ""),
        name: String(item.name ?? ""),
        price: Number(item.price ?? 0) / 100,
        quantity: Number(item.quantity ?? 1),
        modifiers: (item.modifications?.elements ?? item.modifications ?? []).map((mod: any) => ({
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
      id: String(order.id ?? ""),
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

  verifyWebhookAuth(authToken: string | undefined): boolean {
    const secret = this.env.CLOVER_WEBHOOK_SECRET;

    if (!secret) {
      // If no secret configured, allow for development/testing
      return true;
    }

    if (!authToken) {
      return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    const tokenBuffer = Buffer.from(authToken);
    const secretBuffer = Buffer.from(secret);

    if (tokenBuffer.length !== secretBuffer.length) {
      return false;
    }

    return timingSafeEqual(tokenBuffer, secretBuffer);
  }

  async fetchOrder(orderId: string): Promise<CloverOrder> {
    let order: any;
    let hasExpandedData = true;

    try {
      // Try fetching with expanded fields first (full order data)
      const response = await withRetry(
        async () => {
          return await this.client.get(`/orders/${orderId}`, {
            params: {
              expand: "lineItems,lineItems.modifierGroups,lineItems.modifications,lineItems.discounts,discounts",
            },
          });
        },
        {
          maxAttempts: 5,
          initialDelayMs: 1500,
          maxDelayMs: 8000,
          backoffMultiplier: 2,
        }
      );

      order = response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      // If 403 (permission error), try fetching without expand
      if (axiosError.response?.status === 403) {
        logger.warn(
          { orderId },
          "Token lacks permission for expanded fields, fetching basic order data"
        );

        try {
          const basicResponse = await withRetry(
            async () => {
              return await this.client.get(`/orders/${orderId}`);
            },
            {
              maxAttempts: 5,
              initialDelayMs: 1500,
              maxDelayMs: 8000,
              backoffMultiplier: 2,
            }
          );

          order = basicResponse.data;
          hasExpandedData = false;
        } catch (basicError) {
          // If even basic fetch fails with 403, it means no Orders Read permission at all
          const basicAxiosError = basicError as AxiosError;
          if (basicAxiosError.response?.status === 403) {
            logger.error(
              {
                orderId,
                merchantId: this.env.CLOVER_MERCHANT_ID,
                tokenPrefix: this.env.CLOVER_ACCESS_TOKEN?.substring(0, 8) + "...",
              },
              "Clover token has NO Orders Read permission - both expanded and basic fetch failed with 403"
            );
            throw new Error(
              "Clover API token lacks Orders Read permission. " +
                "Please go to Clover Dashboard → API Tokens → Enable 'Orders Read' permission"
            );
          }
          // If different error, rethrow original
          throw error;
        }
      } else {
        throw error;
      }
    }

    try {

      if (!order) {
        throw new Error(`Order ${orderId} not found in Clover`);
      }

      // Warn if we couldn't get expanded data
      if (!hasExpandedData) {
        logger.warn(
          { orderId, hasLineItems: !!order.lineItems },
          "Using basic order data - line items and details may be incomplete"
        );
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

      logger.error({ 
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack,
        orderId 
      }, "Error fetching order from Clover");
      throw error;
    }
  }
}

import axios, { type AxiosInstance, type AxiosError } from "axios";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";
import { LightspeedTokenManager } from "./lightspeed-token-manager";
import type { LightspeedSalePayload } from "../types/lightspeed";

export class LightspeedService {
  private readonly client: AxiosInstance;
  private readonly tokenManager: LightspeedTokenManager | null;
  private useOAuth: boolean;

  constructor(private readonly env: Env) {
    // Determine if using X-Series (domain-based) or R-Series (account ID-based)
    const isXSeries = Boolean(env.LIGHTSPEED_DOMAIN);
    const isRSeries = Boolean(env.LIGHTSPEED_ACCOUNT_ID);

    if (!isXSeries && !isRSeries) {
      throw new Error(
        "Either LIGHTSPEED_DOMAIN (for X-Series) or LIGHTSPEED_ACCOUNT_ID (for R-Series) must be configured"
      );
    }

    // Check if OAuth credentials are available
    const hasOAuthCredentials = Boolean(
      env.LIGHTSPEED_CLIENT_ID && env.LIGHTSPEED_CLIENT_SECRET && env.LIGHTSPEED_REFRESH_TOKEN
    );
    const hasPersonalToken = Boolean(env.LIGHTSPEED_PERSONAL_TOKEN);

    if (!hasOAuthCredentials && !hasPersonalToken) {
      throw new Error(
        "Either LIGHTSPEED_PERSONAL_TOKEN or OAuth credentials (LIGHTSPEED_CLIENT_ID, LIGHTSPEED_CLIENT_SECRET, LIGHTSPEED_REFRESH_TOKEN) must be configured"
      );
    }

    this.useOAuth = hasOAuthCredentials;

    if (this.useOAuth) {
      try {
        this.tokenManager = new LightspeedTokenManager(env);
        logger.info("Using Lightspeed OAuth authentication");
      } catch (error) {
        logger.error({ error }, "Failed to initialize OAuth token manager, falling back to personal token");
        if (!hasPersonalToken) {
          throw error;
        }
        this.tokenManager = null;
        this.useOAuth = false;
      }
    } else {
      this.tokenManager = null;
      logger.info("Using Lightspeed personal token authentication");
    }

    // Determine base URL based on series type
    let baseURL: string;
    if (isXSeries) {
      // X-Series uses domain-based URL
      const domain = env.LIGHTSPEED_DOMAIN!.replace(/^https?:\/\//, "").replace(/\/$/, "");
      baseURL = `https://${domain}/API`;
      logger.info({ domain, baseURL }, "Using Lightspeed X-Series (domain-based)");
    } else {
      // R-Series uses account ID-based URL
      baseURL = `https://api.lightspeedapp.com/API/Account/${env.LIGHTSPEED_ACCOUNT_ID}`;
      logger.info({ accountId: env.LIGHTSPEED_ACCOUNT_ID, baseURL }, "Using Lightspeed R-Series (account ID-based)");
    }

    // Create axios instance - token will be set dynamically for OAuth
    this.client = axios.create({
      baseURL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Set initial authorization header
    if (!this.useOAuth && hasPersonalToken) {
      this.client.defaults.headers.common.Authorization = `Bearer ${env.LIGHTSPEED_PERSONAL_TOKEN}`;
    }

    // Add request interceptor for OAuth to set token dynamically
    if (this.useOAuth && this.tokenManager) {
      this.client.interceptors.request.use(async (config) => {
        const token = await this.tokenManager!.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
    }

    // Add response interceptor to handle 401 errors and refresh token
    if (this.useOAuth && this.tokenManager) {
      this.client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          const originalRequest = error.config as any;

          // If we get a 401 and haven't retried yet, refresh token and retry
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
              const newToken = await this.tokenManager!.forceRefresh();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              logger.error({ error: refreshError }, "Failed to refresh token after 401");
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );
    }
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

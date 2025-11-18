import axios, { type AxiosError } from "axios";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";

export interface LightspeedTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

export class LightspeedTokenManager {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshToken: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly accountId: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(env: Env) {
    if (!env.LIGHTSPEED_CLIENT_ID || !env.LIGHTSPEED_CLIENT_SECRET || !env.LIGHTSPEED_REFRESH_TOKEN) {
      throw new Error(
        "LIGHTSPEED_CLIENT_ID, LIGHTSPEED_CLIENT_SECRET, and LIGHTSPEED_REFRESH_TOKEN must be configured for OAuth"
      );
    }

    // X-Series uses domain, R-Series uses account ID
    if (!env.LIGHTSPEED_DOMAIN && !env.LIGHTSPEED_ACCOUNT_ID) {
      throw new Error(
        "Either LIGHTSPEED_DOMAIN (for X-Series) or LIGHTSPEED_ACCOUNT_ID (for R-Series) must be configured"
      );
    }

    this.clientId = env.LIGHTSPEED_CLIENT_ID;
    this.clientSecret = env.LIGHTSPEED_CLIENT_SECRET;
    this.refreshToken = env.LIGHTSPEED_REFRESH_TOKEN;
    this.accountId = env.LIGHTSPEED_ACCOUNT_ID || ""; // Not used for X-Series but kept for compatibility
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      // Refresh 1 minute before expiry
      return this.accessToken;
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start a new refresh
    this.refreshPromise = this.refreshAccessToken();
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      logger.info("Refreshing Lightspeed OAuth access token");

      const response = await withRetry(
        async () => {
          return await axios.post<LightspeedTokenResponse>(
            "https://api.lightspeedapp.com/oauth/access_token.php",
            new URLSearchParams({
              refresh_token: this.refreshToken,
              grant_type: "refresh_token",
              client_id: this.clientId,
              client_secret: this.clientSecret,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
        },
        {
          maxAttempts: 3,
          initialDelayMs: 1000,
        }
      );

      const { access_token, expires_in, refresh_token } = response.data;

      if (!access_token) {
        throw new Error("No access token received from Lightspeed OAuth");
      }

      this.accessToken = access_token;
      this.tokenExpiresAt = Date.now() + (expires_in * 1000);

      // Update refresh token if a new one is provided
      if (refresh_token) {
        this.refreshToken = refresh_token;
        logger.info("Lightspeed refresh token updated");
      }

      logger.info(
        { expiresIn: expires_in, expiresAt: new Date(this.tokenExpiresAt).toISOString() },
        "Lightspeed access token refreshed successfully"
      );

      return access_token;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorData = axiosError.response.data;

        logger.error(
          {
            status,
            errorData,
          },
          "Failed to refresh Lightspeed OAuth token"
        );

        throw new Error(
          `Failed to refresh Lightspeed OAuth token: ${status} ${JSON.stringify(errorData)}`
        );
      }

      logger.error({ error: axiosError }, "Error refreshing Lightspeed OAuth token");
      throw new Error("Network error while refreshing Lightspeed OAuth token");
    }
  }

  /**
   * Force refresh the token (useful for handling 401 errors)
   */
  async forceRefresh(): Promise<string> {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    return this.getAccessToken();
  }
}


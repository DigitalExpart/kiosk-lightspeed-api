import axios, { type AxiosError } from "axios";

import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";

export interface CloverTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

export class CloverTokenManager {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshToken: string | null = null;
  private readonly appId: string;
  private readonly appSecret: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(env: Env) {
    // Support both OAuth and direct token (for backward compatibility)
    // Prefer direct token if available (simpler and more reliable for most use cases)
    if (env.CLOVER_ACCESS_TOKEN) {
      // Direct token mode
      this.accessToken = env.CLOVER_ACCESS_TOKEN;
      this.tokenExpiresAt = Date.now() + 86400000; // Assume 24 hours
      this.appId = env.CLOVER_APP_ID || "";
      this.appSecret = env.CLOVER_APP_SECRET || "";
      logger.info("Using direct CLOVER_ACCESS_TOKEN for Clover API authentication");
    } else if (env.CLOVER_APP_ID && env.CLOVER_APP_SECRET && env.CLOVER_REFRESH_TOKEN) {
      // OAuth mode (requires refresh token)
      this.appId = env.CLOVER_APP_ID;
      this.appSecret = env.CLOVER_APP_SECRET;
      this.refreshToken = env.CLOVER_REFRESH_TOKEN;
      logger.info("Using Clover OAuth with refresh token");
    } else {
      throw new Error(
        "Either CLOVER_ACCESS_TOKEN (direct) or CLOVER_APP_ID + CLOVER_APP_SECRET + CLOVER_REFRESH_TOKEN (OAuth) must be configured"
      );
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // If using direct token (legacy mode), return it
    if (this.accessToken && !this.appId) {
      return this.accessToken;
    }

    // If we have a valid OAuth token, return it
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      // Refresh 1 minute before expiry
      return this.accessToken;
    }

    // If no refresh token available, can't refresh
    if (!this.refreshToken) {
      if (this.accessToken) {
        // Return existing token even if expired (might still work)
        logger.warn("Clover access token expired but no refresh token available");
        return this.accessToken;
      }
      throw new Error("No Clover access token or refresh token available");
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
    if (!this.refreshToken) {
      throw new Error("No refresh token available to refresh Clover access token");
    }

    try {
      logger.info("Refreshing Clover OAuth access token");

      const response = await withRetry(
        async () => {
          return await axios.post<CloverTokenResponse>(
            "https://api.clover.com/oauth/token",
            new URLSearchParams({
              refresh_token: this.refreshToken!,
              grant_type: "refresh_token",
              client_id: this.appId,
              client_secret: this.appSecret,
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
        throw new Error("No access token received from Clover OAuth");
      }

      this.accessToken = access_token;
      this.tokenExpiresAt = Date.now() + (expires_in * 1000);

      // Update refresh token if a new one is provided
      if (refresh_token) {
        this.refreshToken = refresh_token;
        logger.info("Clover refresh token updated");
      }

      logger.info(
        { expiresIn: expires_in, expiresAt: new Date(this.tokenExpiresAt).toISOString() },
        "Clover access token refreshed successfully"
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
          "Failed to refresh Clover OAuth token"
        );

        throw new Error(
          `Failed to refresh Clover OAuth token: ${status} ${JSON.stringify(errorData)}`
        );
      }

      logger.error({ error: axiosError }, "Error refreshing Clover OAuth token");
      throw new Error("Network error while refreshing Clover OAuth token");
    }
  }

  /**
   * Exchange an authorization code for access and refresh tokens
   * This is used during initial OAuth setup
   */
  async exchangeCodeForToken(authorizationCode: string, redirectUri: string): Promise<CloverTokenResponse> {
    try {
      logger.info("Exchanging Clover authorization code for tokens");

      const response = await withRetry(
        async () => {
          return await axios.post<CloverTokenResponse>(
            "https://api.clover.com/oauth/token",
            new URLSearchParams({
              code: authorizationCode,
              grant_type: "authorization_code",
              client_id: this.appId,
              client_secret: this.appSecret,
              redirect_uri: redirectUri,
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

      const { access_token, refresh_token, expires_in } = response.data;

      if (!access_token) {
        throw new Error("No access token received from Clover OAuth");
      }

      // Store tokens
      this.accessToken = access_token;
      this.refreshToken = refresh_token ?? null;
      this.tokenExpiresAt = Date.now() + (expires_in * 1000);

      logger.info(
        { expiresIn: expires_in, hasRefreshToken: !!refresh_token },
        "Clover OAuth tokens obtained successfully"
      );

      return response.data;
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
          "Failed to exchange Clover authorization code"
        );

        throw new Error(
          `Failed to exchange Clover authorization code: ${status} ${JSON.stringify(errorData)}`
        );
      }

      logger.error({ error: axiosError }, "Error exchanging Clover authorization code");
      throw new Error("Network error while exchanging Clover authorization code");
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



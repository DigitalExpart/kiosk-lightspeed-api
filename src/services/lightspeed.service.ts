import axios, { type AxiosInstance } from "axios";

import type { Env } from "../config/env";
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
    await this.client.post("/Sale.json", {
      Sale: payload,
    });
  }
}

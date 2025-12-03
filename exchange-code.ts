#!/usr/bin/env ts-node

/**
 * Quick script to exchange Clover authorization code for tokens
 * Usage: ts-node exchange-code.ts YOUR_AUTHORIZATION_CODE
 */

import { config } from "dotenv";
import { CloverTokenManager } from "./src/services/clover-token-manager";

config();

async function main() {
  const authCode = process.argv[2];
  
  if (!authCode) {
    console.error("\n❌ Please provide authorization code:");
    console.error("   ts-node exchange-code.ts YOUR_AUTHORIZATION_CODE\n");
    process.exit(1);
  }

  const appId = process.env.CLOVER_APP_ID || "8GSC7031S26JY";
  const appSecret = process.env.CLOVER_APP_SECRET || "3de21706-142e-2abc-ab53-4e41e79bd0aa";
  const redirectUri = "http://localhost:4000/oauth/callback";

  console.log("\n🔄 Exchanging authorization code for tokens...\n");

  try {
    const tokenManager = new CloverTokenManager({
      CLOVER_APP_ID: appId,
      CLOVER_APP_SECRET: appSecret,
    } as any);

    const tokenResponse = await tokenManager.exchangeCodeForToken(authCode, redirectUri);

    console.log("✅ Successfully obtained tokens!\n");
    console.log("📝 Add these to your .env file:\n");
    console.log(`CLOVER_ACCESS_TOKEN=${tokenResponse.access_token}`);
    if (tokenResponse.refresh_token) {
      console.log(`CLOVER_REFRESH_TOKEN=${tokenResponse.refresh_token}`);
    }
    console.log(`\nExpires in: ${tokenResponse.expires_in} seconds\n`);
  } catch (error: any) {
    console.error("\n❌ Error exchanging code:");
    console.error(error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();


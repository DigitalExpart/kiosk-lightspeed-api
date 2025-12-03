#!/usr/bin/env tsx

/**
 * Script to set up Clover OAuth flow
 * 
 * This script helps you:
 * 1. Generate the authorization URL
 * 2. Exchange authorization code for access/refresh tokens
 * 3. Save tokens to .env file
 */

import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import readline from "readline";

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("\n=== Clover OAuth Setup ===\n");

  // Step 1: Get App ID and Secret
  const appId = process.env.CLOVER_APP_ID || (await question("Enter your Clover App ID: "));
  const appSecret = process.env.CLOVER_APP_SECRET || (await question("Enter your Clover App Secret: "));

  if (!appId || !appSecret) {
    console.error("❌ App ID and App Secret are required!");
    process.exit(1);
  }

  // Step 2: Get redirect URI
  const redirectUri =
    process.env.CLOVER_REDIRECT_URI ||
    (await question("Enter your redirect URI (default: http://localhost:4000/oauth/callback): ")) ||
    "http://localhost:4000/oauth/callback";

  // Step 3: Generate authorization URL
  const authUrl = `https://www.clover.com/oauth/authorize?client_id=${appId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;

  console.log("\n📋 Step 1: Authorize your app");
  console.log("─────────────────────────────────────────────────────────");
  console.log("Visit this URL in your browser:");
  console.log(`\n${authUrl}\n`);
  console.log("After authorizing, you'll be redirected to:");
  console.log(`${redirectUri}?code=AUTHORIZATION_CODE`);
  console.log("\nCopy the 'code' parameter from the URL.\n");

  // Step 4: Get authorization code
  const authCode = await question("Enter the authorization code from the redirect URL: ");

  if (!authCode) {
    console.error("❌ Authorization code is required!");
    process.exit(1);
  }

  // Step 5: Exchange code for tokens
  console.log("\n🔄 Exchanging authorization code for tokens...\n");

  try {
    const { CloverTokenManager } = await import("../src/services/clover-token-manager");
    
    // Create a temporary token manager with app credentials
    const tempEnv = {
      CLOVER_APP_ID: appId,
      CLOVER_APP_SECRET: appSecret,
    } as any;

    const tokenManager = new CloverTokenManager(tempEnv);
    const tokenResponse = await tokenManager.exchangeCodeForToken(authCode, redirectUri);

    console.log("✅ Successfully obtained tokens!\n");
    console.log("📝 Token Details:");
    console.log(`   Access Token: ${tokenResponse.access_token.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${tokenResponse.refresh_token ? tokenResponse.refresh_token.substring(0, 20) + "..." : "Not provided"}`);
    console.log(`   Expires In: ${tokenResponse.expires_in} seconds\n`);

    // Step 6: Save to .env file
    const envPath = join(process.cwd(), ".env");
    let envContent = "";

    try {
      envContent = readFileSync(envPath, "utf-8");
    } catch (error) {
      // .env file doesn't exist, that's okay
      console.log("📄 Creating new .env file...\n");
    }

    // Update or add Clover OAuth variables
    const updates: Record<string, string> = {
      CLOVER_APP_ID: appId,
      CLOVER_APP_SECRET: appSecret,
      CLOVER_ACCESS_TOKEN: tokenResponse.access_token,
    };

    if (tokenResponse.refresh_token) {
      updates.CLOVER_REFRESH_TOKEN = tokenResponse.refresh_token;
    }

    // Update existing values or append new ones
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    // Ensure CLOVER_MERCHANT_ID is present
    if (!envContent.includes("CLOVER_MERCHANT_ID=")) {
      const merchantId = process.env.CLOVER_MERCHANT_ID || (await question("Enter your Clover Merchant ID: "));
      if (merchantId) {
        envContent += `\nCLOVER_MERCHANT_ID=${merchantId}`;
      }
    }

    writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

    console.log("✅ Tokens saved to .env file!\n");
    console.log("📋 Next Steps:");
    console.log("   1. Test the connection: npm run test:clover");
    console.log("   2. Configure webhooks in your Clover app");
    console.log("   3. Start the server: npm run dev\n");
  } catch (error: any) {
    console.error("\n❌ Error exchanging authorization code:");
    console.error(error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});



/**
 * Script to retrieve Lightspeed Account ID from API
 * Run with: npx ts-node scripts/get-lightspeed-account-id.ts
 */

import { config } from "dotenv";
import axios from "axios";

config();

const LIGHTSPEED_PERSONAL_TOKEN = process.env.LIGHTSPEED_PERSONAL_TOKEN;

async function getAccountId() {
  if (!LIGHTSPEED_PERSONAL_TOKEN) {
    console.error("❌ LIGHTSPEED_PERSONAL_TOKEN is not set in .env file");
    process.exit(1);
  }

  console.log("🔍 Retrieving Lightspeed Account ID from API...\n");

  try {
    // Method 1: Try to get account list
    console.log("Method 1: Fetching account information...");
    const response = await axios.get(
      "https://api.lightspeedapp.com/API/Account.json",
      {
        headers: {
          Authorization: `Bearer ${LIGHTSPEED_PERSONAL_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data?.Account?.accountID) {
      const accountId = response.data.Account.accountID;
      console.log(`✅ Found Account ID: ${accountId}\n`);
      console.log("📝 Add this to your .env file:");
      console.log(`   LIGHTSPEED_ACCOUNT_ID=${accountId}\n`);
      return accountId;
    }

    // Method 2: Try shops endpoint (account ID might be in shop data)
    if (response.data?.Shop) {
      const shops = Array.isArray(response.data.Shop) 
        ? response.data.Shop 
        : [response.data.Shop];
      
      if (shops.length > 0 && shops[0].accountID) {
        const accountId = shops[0].accountID;
        console.log(`✅ Found Account ID from Shop data: ${accountId}\n`);
        console.log("📝 Add this to your .env file:");
        console.log(`   LIGHTSPEED_ACCOUNT_ID=${accountId}\n`);
        return accountId;
      }
    }

    // Method 3: Try to get shops directly
    console.log("Method 2: Trying shops endpoint...");
    const shopsResponse = await axios.get(
      "https://api.lightspeedapp.com/API/Account/*/Shop.json",
      {
        headers: {
          Authorization: `Bearer ${LIGHTSPEED_PERSONAL_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    if (shopsResponse.data?.Shop) {
      const shops = Array.isArray(shopsResponse.data.Shop)
        ? shopsResponse.data.Shop
        : [shopsResponse.data.Shop];
      
      if (shops.length > 0 && shops[0].accountID) {
        const accountId = shops[0].accountID;
        console.log(`✅ Found Account ID: ${accountId}\n`);
        console.log("📝 Add this to your .env file:");
        console.log(`   LIGHTSPEED_ACCOUNT_ID=${accountId}\n`);
        return accountId;
      }
    }

    console.log("⚠️  Could not automatically retrieve Account ID");
    console.log("\n📋 Manual Methods:");
    console.log("1. Check URL when logged into Lightspeed dashboard");
    console.log("2. Look in Settings → Account → Account Information");
    console.log("3. Contact Lightspeed support for Account ID");
    console.log("4. Check API response structure:", JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    if (error.response) {
      console.error("❌ API Error:");
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401) {
        console.error("\n💡 Your token might be invalid");
      }
    } else {
      console.error("❌ Error:", error.message);
    }

    console.log("\n📋 Alternative: Find Account ID in Lightspeed Dashboard");
    console.log("1. Log into Lightspeed Retail");
    console.log("2. Go to Settings → Account");
    console.log("3. Look for Account ID in the URL or account information");
    console.log("4. Or check the URL when viewing any account-level page");
    console.log("   Format: https://...lightspeedapp.com/.../Account/{ACCOUNT_ID}/...");
  }
}

void getAccountId();


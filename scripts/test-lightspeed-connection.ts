/**
 * Test script to verify Lightspeed API connection
 * Run with: npx ts-node scripts/test-lightspeed-connection.ts
 */

import { config } from "dotenv";
import axios from "axios";

config();

const LIGHTSPEED_ACCOUNT_ID = process.env.LIGHTSPEED_ACCOUNT_ID;
const LIGHTSPEED_PERSONAL_TOKEN = process.env.LIGHTSPEED_PERSONAL_TOKEN;
const LIGHTSPEED_SHOP_ID = process.env.LIGHTSPEED_SHOP_ID;

async function testLightspeedConnection() {
  if (!LIGHTSPEED_PERSONAL_TOKEN) {
    console.error("❌ LIGHTSPEED_PERSONAL_TOKEN is not set in .env file");
    process.exit(1);
  }

  if (!LIGHTSPEED_SHOP_ID) {
    console.error("❌ LIGHTSPEED_SHOP_ID is not set in .env file");
    process.exit(1);
  }

  let accountId = LIGHTSPEED_ACCOUNT_ID;

  // Try to get account ID from API if not set
  if (!accountId) {
    console.log("⚠️  LIGHTSPEED_ACCOUNT_ID not set, attempting to retrieve from API...\n");
    try {
      // Try to get account info using a generic endpoint
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
        accountId = response.data.Account.accountID;
        console.log(`✅ Found Account ID: ${accountId}\n`);
        console.log("💡 Add this to your .env file:");
        console.log(`   LIGHTSPEED_ACCOUNT_ID=${accountId}\n`);
      }
    } catch (error: any) {
      console.error("❌ Could not retrieve Account ID automatically");
      console.error("   Please set LIGHTSPEED_ACCOUNT_ID in your .env file");
      console.error("   You can find it in your Lightspeed dashboard\n");
      process.exit(1);
    }
  }

  console.log("🔍 Testing Lightspeed API connection...");
  console.log(`Account ID: ${accountId}`);
  console.log(`Shop ID: ${LIGHTSPEED_SHOP_ID}\n`);

  try {
    // Test 1: Get account info
    console.log("Test 1: Fetching account information...");
    const accountResponse = await axios.get(
      `https://api.lightspeedapp.com/API/Account/${accountId}.json`,
      {
        headers: {
          Authorization: `Bearer ${LIGHTSPEED_PERSONAL_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    console.log("✅ Account Info Retrieved:");
    console.log(`   Account: ${accountResponse.data.Account?.name || "N/A"}\n`);

    // Test 2: Get shop info
    console.log("Test 2: Fetching shop information...");
    const shopResponse = await axios.get(
      `https://api.lightspeedapp.com/API/Account/${accountId}/Shop/${LIGHTSPEED_SHOP_ID}.json`,
      {
        headers: {
          Authorization: `Bearer ${LIGHTSPEED_PERSONAL_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    console.log("✅ Shop Info Retrieved:");
    console.log(`   Shop: ${shopResponse.data.Shop?.name || "N/A"}\n`);

    // Test 3: Test creating a sale (dry run - we'll just check if we can access the endpoint)
    console.log("Test 3: Testing sale creation endpoint access...");
    try {
      // We'll make a minimal request to see if the endpoint is accessible
      // This will likely fail with validation error, but that's okay - we just want to check auth
      await axios.post(
        `https://api.lightspeedapp.com/API/Account/${accountId}/Sale.json`,
        {
          Sale: {
            shopID: LIGHTSPEED_SHOP_ID,
            lines: [],
            payments: [],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${LIGHTSPEED_PERSONAL_TOKEN}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log("❌ Authentication failed for sale creation");
        throw error;
      } else if (error.response?.status === 400 || error.response?.status === 422) {
        // Validation error is expected - means auth worked!
        console.log("✅ Sale endpoint accessible (validation error expected)\n");
      } else {
        throw error;
      }
    }

    console.log("✅ Lightspeed API connection successful!");
    console.log("   Your credentials are valid and working.\n");
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      console.error("❌ Lightspeed API Error:");
      console.error(`   Status: ${status}`);
      console.error(`   Message: ${JSON.stringify(errorData, null, 2)}`);

      if (status === 401) {
        console.error("\n💡 Your access token is invalid or expired.");
        console.error("   Please verify your LIGHTSPEED_PERSONAL_TOKEN in .env file");
      } else if (status === 403) {
        console.error("\n💡 Your token doesn't have permission for this account/shop.");
        console.error("   Verify your LIGHTSPEED_ACCOUNT_ID and LIGHTSPEED_SHOP_ID");
      } else if (status === 404) {
        console.error("\n💡 Account or Shop not found.");
        console.error("   Verify your LIGHTSPEED_ACCOUNT_ID and LIGHTSPEED_SHOP_ID are correct");
      }
    } else if (error.request) {
      console.error("❌ Network Error: Could not reach Lightspeed API");
      console.error("   Check your internet connection");
    } else {
      console.error("❌ Error:", error.message);
    }
    process.exit(1);
  }
}

void testLightspeedConnection();


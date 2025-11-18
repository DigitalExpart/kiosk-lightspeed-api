/**
 * Test different Clover API token formats
 */

import { config } from "dotenv";
import axios from "axios";

config();

const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

async function testTokenFormats() {
  if (!CLOVER_MERCHANT_ID || !CLOVER_ACCESS_TOKEN) {
    console.error("Missing credentials");
    process.exit(1);
  }

  console.log("Testing different Clover API authentication methods...\n");

  // Method 1: Bearer token (standard OAuth)
  console.log("Method 1: Bearer token (OAuth format)");
  try {
    const response = await axios.get(
      `https://api.clover.com/v3/merchants/${CLOVER_MERCHANT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${CLOVER_ACCESS_TOKEN}`,
          Accept: "application/json",
        },
      }
    );
    console.log("✅ SUCCESS with Bearer token!");
    console.log(`   Merchant: ${response.data.name}\n`);
    return;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.response?.status} - ${error.response?.statusText}\n`);
  }

  // Method 2: API Token (private token format)
  console.log("Method 2: API Token (private token format)");
  try {
    const response = await axios.get(
      `https://api.clover.com/v3/merchants/${CLOVER_MERCHANT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${CLOVER_ACCESS_TOKEN}`,
          Accept: "application/json",
        },
        params: {
          access_token: CLOVER_ACCESS_TOKEN,
        },
      }
    );
    console.log("✅ SUCCESS with API Token format!");
    console.log(`   Merchant: ${response.data.name}\n`);
    return;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.response?.status} - ${error.response?.statusText}\n`);
  }

  // Method 3: Query parameter
  console.log("Method 3: Token as query parameter");
  try {
    const response = await axios.get(
      `https://api.clover.com/v3/merchants/${CLOVER_MERCHANT_ID}`,
      {
        params: {
          access_token: CLOVER_ACCESS_TOKEN,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );
    console.log("✅ SUCCESS with query parameter!");
    console.log(`   Merchant: ${response.data.name}\n`);
    return;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.response?.status} - ${error.response?.statusText}\n`);
  }

  console.log("❌ All authentication methods failed.");
  console.log("\nPossible issues:");
  console.log("1. Token might need to be activated/enabled in Clover dashboard");
  console.log("2. Token might need different permissions (check PERMISSIONS in dashboard)");
  console.log("3. Token might be for a different API version or endpoint");
  console.log("4. You might need to use OAuth flow instead of private token");
}

void testTokenFormats();


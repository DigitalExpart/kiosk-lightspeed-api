/**
 * Test script to verify Clover API connection
 * Run with: npx ts-node scripts/test-clover-connection.ts
 */

import { config } from "dotenv";
import axios from "axios";

config();

const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

async function testCloverConnection() {
  if (!CLOVER_MERCHANT_ID) {
    console.error("❌ CLOVER_MERCHANT_ID is not set in .env file");
    process.exit(1);
  }

  if (!CLOVER_ACCESS_TOKEN) {
    console.error("❌ CLOVER_ACCESS_TOKEN is not set in .env file");
    console.log("\n📝 To get an access token:");
    console.log("1. Go to https://dev.clover.com/");
    console.log("2. Create an app or use existing app");
    console.log("3. Use OAuth flow to get access token");
    console.log("4. Add it to your .env file: CLOVER_ACCESS_TOKEN=your_token_here");
    process.exit(1);
  }

  console.log("🔍 Testing Clover API connection...");
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}\n`);

  try {
    // Test 1: Get merchant info
    console.log("Test 1: Fetching merchant information...");
    const merchantResponse = await axios.get(
      `https://api.clover.com/v3/merchants/${CLOVER_MERCHANT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${CLOVER_ACCESS_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    console.log("✅ Merchant Info Retrieved:");
    console.log(`   Name: ${merchantResponse.data.name}`);
    console.log(`   Address: ${merchantResponse.data.address?.address1 || "N/A"}`);
    console.log(`   Phone: ${merchantResponse.data.phone || "N/A"}\n`);

    // Test 2: Get recent orders
    console.log("Test 2: Fetching recent orders...");
    const ordersResponse = await axios.get(
      `https://api.clover.com/v3/merchants/${CLOVER_MERCHANT_ID}/orders`,
      {
        headers: {
          Authorization: `Bearer ${CLOVER_ACCESS_TOKEN}`,
          Accept: "application/json",
        },
        params: {
          limit: 5,
        },
      }
    );

    const orders = ordersResponse.data?.elements || [];
    console.log(`✅ Found ${orders.length} recent orders`);
    if (orders.length > 0) {
      console.log("   Latest orders:");
      orders.slice(0, 3).forEach((order: any) => {
        console.log(`   - Order ${order.id}: $${(order.total / 100).toFixed(2)} (${order.state || "N/A"})`);
      });
    }

    console.log("\n✅ Clover API connection successful!");
    console.log("   Your access token is valid and working.\n");
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Clover API Error:");
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);

      if (error.response.status === 401) {
        console.error("\n💡 Your access token is invalid or expired.");
        console.error("   Please get a new access token from https://dev.clover.com/");
      } else if (error.response.status === 403) {
        console.error("\n💡 Your access token doesn't have permission for this merchant.");
        console.error("   Make sure the token is authorized for merchant ID:", CLOVER_MERCHANT_ID);
      }
    } else if (error.request) {
      console.error("❌ Network Error: Could not reach Clover API");
      console.error("   Check your internet connection");
    } else {
      console.error("❌ Error:", error.message);
    }
    process.exit(1);
  }
}

void testCloverConnection();


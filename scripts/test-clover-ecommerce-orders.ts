/**
 * Test if E-commerce API can fetch orders
 */

import { config } from "dotenv";
import axios from "axios";

config();

const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const PRIVATE_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

async function testOrders() {
  console.log("🔍 Testing Clover E-commerce API for Orders\n");

  // Try different order endpoints
  const endpoints = [
    {
      name: "E-commerce v1 - Orders list",
      url: `https://api.clover.com/ecommerce/v1/merchants/${MERCHANT_ID}/orders`,
      method: "GET" as const,
    },
    {
      name: "E-commerce v1 - Orders with query",
      url: `https://api.clover.com/ecommerce/v1/merchants/${MERCHANT_ID}/orders?limit=5`,
      method: "GET" as const,
    },
    {
      name: "E-commerce v1 - Specific order (test ID)",
      url: `https://api.clover.com/ecommerce/v1/merchants/${MERCHANT_ID}/orders/test`,
      method: "GET" as const,
    },
    {
      name: "Standard v3 - Orders (with E-commerce token)",
      url: `https://api.clover.com/v3/merchants/${MERCHANT_ID}/orders?limit=5`,
      method: "GET" as const,
    },
  ];

  for (const test of endpoints) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await axios({
        method: test.method,
        url: test.url,
        headers: {
          Authorization: `Bearer ${PRIVATE_TOKEN}`,
          Accept: "application/json",
        },
        timeout: 10000,
      });

      console.log(`  ✅ Status: ${response.status}`);
      if (response.data) {
        const dataStr = JSON.stringify(response.data, null, 2);
        if (dataStr.length > 500) {
          console.log(`  Response (first 500 chars):\n${dataStr.substring(0, 500)}...`);
        } else {
          console.log(`  Response:\n${dataStr}`);
        }
        
        // Check if we got orders
        if (response.data.elements || response.data.orders || Array.isArray(response.data)) {
          console.log(`  🎉 Found orders endpoint!`);
        }
      } else {
        console.log(`  ⚠️  No response data (204 No Content)`);
      }
      console.log("");
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 401) {
          console.log(`  ❌ 401 Unauthorized`);
        } else if (status === 404) {
          console.log(`  ⚠️  404 - Endpoint doesn't exist`);
        } else if (status === 405) {
          console.log(`  ⚠️  405 - Method not allowed`);
        } else {
          console.log(`  ❌ ${status}: ${JSON.stringify(data).substring(0, 100)}`);
        }
      } else {
        console.log(`  ❌ Error: ${error.message}`);
      }
      console.log("");
    }
  }

  console.log("\n💡 Important Note:");
  console.log("E-commerce API is typically for:");
  console.log("  - Payment processing");
  console.log("  - Checkout integration");
  console.log("  - Tokenization");
  console.log("\nE-commerce API may NOT support:");
  console.log("  - Fetching orders");
  console.log("  - Order management");
  console.log("\nFor fetching orders, you typically need:");
  console.log("  - REST API access (which requires account upgrade)");
  console.log("  - OR use webhooks to receive orders (recommended)");
  console.log("\n📋 Recommendation:");
  console.log("  Use Clover webhooks to receive order events");
  console.log("  Webhooks will send order data when orders are created/updated");
  console.log("  This is the standard approach for E-commerce API accounts\n");
}

void testOrders();


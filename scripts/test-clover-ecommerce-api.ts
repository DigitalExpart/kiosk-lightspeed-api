/**
 * Test Clover E-commerce API endpoints
 * E-commerce API uses private token as Bearer token
 */

import { config } from "dotenv";
import axios from "axios";

config();

const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const PRIVATE_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

async function testEcommerceAPI() {
  if (!MERCHANT_ID || !PRIVATE_TOKEN) {
    console.error("❌ CLOVER_MERCHANT_ID and CLOVER_ACCESS_TOKEN must be set");
    process.exit(1);
  }

  console.log("🔍 Testing Clover E-commerce API\n");
  console.log(`Merchant ID: ${MERCHANT_ID}`);
  console.log(`Private Token: ${PRIVATE_TOKEN.substring(0, 12)}...\n`);

  // E-commerce API base URLs to try
  const baseURLs = [
    `https://api.clover.com/v3/merchants/${MERCHANT_ID}`, // Standard REST (might work for E-commerce too)
    `https://api.clover.com/ecommerce/v1/merchants/${MERCHANT_ID}`,
    `https://api.clover.com/v1/ecommerce/merchants/${MERCHANT_ID}`,
    `https://ecommerce.clover.com/v1/merchants/${MERCHANT_ID}`,
    `https://api.clover.com/v3/merchants/${MERCHANT_ID}/ecommerce`,
  ];

  const endpoints = [
    "", // Root/merchant info
    "/orders",
    "/orders?limit=1",
  ];

  for (const baseURL of baseURLs) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Testing Base URL: ${baseURL}`);
    console.log("=".repeat(60));

    for (const endpoint of endpoints) {
      const url = `${baseURL}${endpoint}`;
      const testName = endpoint || "/ (root)";

      try {
        console.log(`\n  Testing: ${testName}`);
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${PRIVATE_TOKEN}`,
            Accept: "application/json",
          },
          timeout: 10000,
        });

        console.log(`  ✅ SUCCESS! Status: ${response.status}`);
        if (response.data) {
          const dataStr = JSON.stringify(response.data).substring(0, 200);
          console.log(`  Response: ${dataStr}...`);
          
          // If we got merchant info, show it
          if (response.data.name || response.data.id) {
            console.log(`\n  🎉 Found working endpoint!`);
            console.log(`  Merchant: ${response.data.name || "N/A"}`);
            console.log(`  ID: ${response.data.id || "N/A"}`);
            return { baseURL, endpoint, working: true };
          }
        }
      } catch (error: any) {
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            console.log(`  ❌ 401 Unauthorized`);
          } else if (status === 404) {
            console.log(`  ⚠️  404 Not Found (endpoint might not exist)`);
          } else {
            console.log(`  ❌ ${status}: ${error.response.data?.message || error.response.statusText}`);
          }
        } else if (error.request) {
          console.log(`  ❌ Network Error: ${error.message}`);
        } else {
          console.log(`  ❌ Error: ${error.message}`);
        }
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("❌ No working E-commerce API endpoints found");
  console.log("=".repeat(60));
  console.log("\n💡 Next Steps:");
  console.log("1. Check Clover E-commerce API documentation for correct base URL");
  console.log("2. Verify the private token is for E-commerce API (not REST API)");
  console.log("3. Note: E-commerce API might be for payments/checkout only");
  console.log("   - You may need REST API access for fetching orders");
  console.log("   - Contact Clover to enable REST API access for your account\n");

  return { working: false };
}

void testEcommerceAPI();


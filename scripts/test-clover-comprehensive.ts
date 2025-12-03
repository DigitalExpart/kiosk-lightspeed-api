/**
 * Comprehensive Clover API test with multiple endpoints and formats
 */

import { config } from "dotenv";
import axios from "axios";

config();

const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const TOKEN = process.env.CLOVER_ACCESS_TOKEN;

async function testComprehensive() {
  if (!MERCHANT_ID || !TOKEN) {
    console.error("❌ CLOVER_MERCHANT_ID and CLOVER_ACCESS_TOKEN must be set");
    process.exit(1);
  }

  console.log("🔍 Comprehensive Clover API Test\n");
  console.log(`Merchant ID: ${MERCHANT_ID}`);
  console.log(`Token: ${TOKEN.substring(0, 12)}...\n`);

  const tests = [
    {
      name: "v3 API - Merchant Info (Bearer)",
      url: `https://api.clover.com/v3/merchants/${MERCHANT_ID}`,
      method: "GET" as const,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    },
    {
      name: "v3 API - Merchant Info (Query Param)",
      url: `https://api.clover.com/v3/merchants/${MERCHANT_ID}?access_token=${TOKEN}`,
      method: "GET" as const,
      headers: {
        Accept: "application/json",
      },
    },
    {
      name: "v2 API - Merchant Info",
      url: `https://api.clover.com/v2/merchant/${MERCHANT_ID}`,
      method: "GET" as const,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    },
    {
      name: "Sandbox API - Merchant Info",
      url: `https://sandbox.dev.clover.com/v3/merchants/${MERCHANT_ID}`,
      method: "GET" as const,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    },
    {
      name: "v3 API - Orders (Bearer)",
      url: `https://api.clover.com/v3/merchants/${MERCHANT_ID}/orders`,
      method: "GET" as const,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    },
  ];

  let successCount = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        headers: test.headers,
        timeout: 10000,
      });

      if (response.status === 200) {
        console.log(`   ✅ SUCCESS! Status: ${response.status}`);
        console.log(`   Response keys: ${Object.keys(response.data).join(", ")}\n`);
        successCount++;
      } else {
        console.log(`   ⚠️  Status: ${response.status}\n`);
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || JSON.stringify(error.response.data);
        if (status === 401) {
          console.log(`   ❌ 401 Unauthorized`);
        } else if (status === 403) {
          console.log(`   ❌ 403 Forbidden`);
        } else if (status === 404) {
          console.log(`   ❌ 404 Not Found`);
        } else {
          console.log(`   ❌ Error ${status}: ${message}`);
        }
      } else if (error.request) {
        console.log(`   ❌ Network Error: ${error.message}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
      console.log("");
    }
  }

  console.log("\n" + "=".repeat(50));
  if (successCount > 0) {
    console.log(`✅ ${successCount} test(s) succeeded!`);
  } else {
    console.log("❌ All tests failed");
    console.log("\n💡 Troubleshooting Steps:");
    console.log("1. Verify token is activated in Clover dashboard");
    console.log("2. Check token type is 'REST API' not 'Ecommerce API'");
    console.log("3. Verify Orders Read permission is enabled");
    console.log("4. Wait a few minutes - tokens may need activation time");
    console.log("5. Contact Clover support if issue persists");
  }
}

void testComprehensive();


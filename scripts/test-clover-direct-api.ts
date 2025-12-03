/**
 * Direct API test - trying different approaches
 */

import { config } from "dotenv";
import axios from "axios";

config();

const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const TOKEN = process.env.CLOVER_ACCESS_TOKEN;

async function testDirect() {
  console.log("🔍 Direct Clover API Test\n");
  console.log(`Merchant ID: ${MERCHANT_ID}`);
  console.log(`Token: ${TOKEN}\n`);

  // Test 1: Try with just the merchant endpoint
  console.log("Test 1: GET /merchants/{id} (no trailing slash)");
  try {
    const r1 = await axios.get(
      `https://api.clover.com/v3/merchants/${MERCHANT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
        },
      }
    );
    console.log(`   ✅ SUCCESS! Status: ${r1.status}`);
    console.log(`   Data: ${JSON.stringify(r1.data, null, 2).substring(0, 200)}...\n`);
    return;
  } catch (e: any) {
    console.log(`   ❌ ${e.response?.status || e.message}\n`);
  }

  // Test 2: Try with access_token in query
  console.log("Test 2: GET with access_token query parameter");
  try {
    const r2 = await axios.get(
      `https://api.clover.com/v3/merchants/${MERCHANT_ID}?access_token=${TOKEN}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    console.log(`   ✅ SUCCESS! Status: ${r2.status}\n`);
    return;
  } catch (e: any) {
    console.log(`   ❌ ${e.response?.status || e.message}\n`);
  }

  // Test 3: Try orders endpoint directly
  console.log("Test 3: GET /orders endpoint");
  try {
    const r3 = await axios.get(
      `https://api.clover.com/v3/merchants/${MERCHANT_ID}/orders`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
        },
        params: {
          limit: 1,
        },
      }
    );
    console.log(`   ✅ SUCCESS! Status: ${r3.status}`);
    console.log(`   Orders found: ${r3.data?.elements?.length || 0}\n`);
    return;
  } catch (e: any) {
    console.log(`   ❌ ${e.response?.status || e.message}`);
    if (e.response?.data) {
      console.log(`   Response: ${JSON.stringify(e.response.data)}\n`);
    }
  }

  // Test 4: Check if we need to use a different base URL
  console.log("Test 4: Check API version and endpoint");
  try {
    // Try to get API info
    const r4 = await axios.get("https://api.clover.com/v3/merchants", {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    });
    console.log(`   ✅ API accessible`);
    console.log(`   Response: ${JSON.stringify(r4.data, null, 2).substring(0, 200)}...\n`);
  } catch (e: any) {
    console.log(`   ❌ ${e.response?.status || e.message}`);
    if (e.response?.data) {
      console.log(`   Full error: ${JSON.stringify(e.response.data, null, 2)}\n`);
    }
  }

  console.log("\n💡 Since dashboard looks correct but API still fails:");
  console.log("   1. Contact Clover support - may be account-level issue");
  console.log("   2. Verify merchant account has API access enabled");
  console.log("   3. Check if there are any IP restrictions on the token");
  console.log("   4. Try creating a new token from scratch");
}

void testDirect();


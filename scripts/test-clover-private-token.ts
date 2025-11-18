/**
 * Test Clover private token authentication methods
 * Clover private tokens might use different authentication than OAuth tokens
 */

import { config } from "dotenv";
import axios from "axios";

config();

const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

async function testPrivateToken() {
  if (!CLOVER_MERCHANT_ID || !CLOVER_ACCESS_TOKEN) {
    console.error("Missing credentials");
    process.exit(1);
  }

  console.log("Testing Clover Private Token authentication...\n");
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}`);
  console.log(`Token: ${CLOVER_ACCESS_TOKEN.substring(0, 8)}...\n`);

  // Method 1: Private token as access_token query parameter
  console.log("Method 1: access_token as query parameter");
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
    console.log("✅ SUCCESS!");
    console.log(`   Merchant: ${response.data.name}`);
    console.log(`   Address: ${response.data.address?.address1 || "N/A"}\n`);
    return true;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.response?.status} - ${JSON.stringify(error.response?.data)}\n`);
  }

  // Method 2: Private token in Authorization header (different format)
  console.log("Method 2: Token in Authorization header (Private token format)");
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
    console.log("✅ SUCCESS!");
    console.log(`   Merchant: ${response.data.name}\n`);
    return true;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.response?.status}\n`);
  }

  // Method 3: Try with different base URL
  console.log("Method 3: Different API endpoint");
  try {
    const response = await axios.get(
      `https://api.clover.com/v3/merchants/me`,
      {
        params: {
          access_token: CLOVER_ACCESS_TOKEN,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );
    console.log("✅ SUCCESS with /me endpoint!");
    console.log(`   Merchant: ${response.data.name}\n`);
    return true;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.response?.status}\n`);
  }

  console.log("❌ All methods failed.");
  console.log("\n💡 Important Notes:");
  console.log("1. Make sure you clicked 'Save' after setting permissions");
  console.log("2. Private tokens might need to be activated/enabled");
  console.log("3. The token might be for a different API (Ecommerce vs REST)");
  console.log("4. You might need to use OAuth flow instead of private token");
  console.log("\n📝 Next Steps:");
  console.log("- Verify token is saved and active in Clover dashboard");
  console.log("- Check if there's an 'Enable' or 'Activate' button for the token");
  console.log("- Consider using OAuth flow for more reliable authentication");
  
  return false;
}

void testPrivateToken();


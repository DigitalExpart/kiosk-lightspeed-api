/**
 * Test End-to-End Integration
 * 
 * This script tests the complete flow:
 * 1. Fetches a recent order from Clover
 * 2. Maps it to Lightspeed format
 * 3. Creates a sale in Lightspeed
 */

import { config } from "dotenv";
import { CloverService } from "../src/services/clover.service";
import { LightspeedService } from "../src/services/lightspeed.service";
import { OrderMapper } from "../src/mappers/order.mapper";
import { env } from "../src/config/env";
import type { CloverOrder } from "../src/types/clover";

config();

async function testEndToEnd() {
  console.log("🧪 Testing End-to-End Integration\n");
  console.log("=" .repeat(60));

  try {
    // Initialize services
    console.log("\n📡 Initializing services...");
    const cloverService = new CloverService(env);
    const lightspeedService = new LightspeedService(env);

    // Step 1: Test Clover connection by fetching merchant info
    console.log("\n1️⃣  Testing Clover API connection...");
    
    // For this test, we'll ask the user for an order ID
    // In a real scenario, you'd fetch recent orders
    console.log("\n💡 This test requires a Clover order ID");
    console.log("   To get one:");
    console.log("   1. Go to: https://www.clover.com/orders/m/QQ50HVC3HQZE1/orders/");
    console.log("   2. Click on any recent order");
    console.log("   3. Copy the Order ID from the URL or order details");
    console.log("");
    
    // For demo purposes, use a hardcoded test order ID
    // You can replace this with actual order ID from your Clover dashboard
    const testOrderId = process.argv[2];
    
    if (!testOrderId) {
      console.log("❌ No order ID provided");
      console.log("\n💡 Usage: npm run test:integration ORDER_ID");
      console.log("   Example: npm run test:integration 2WQ1HEHW1CPNJ");
      console.log("\n   Get order ID from: https://www.clover.com/orders/m/QQ50HVC3HQZE1/orders/");
      return;
    }

    console.log(`📦 Using Order ID: ${testOrderId}`);

    // Step 2: Fetch full order details
    console.log("\n2️⃣  Fetching order details from Clover...");
    const fullOrder = await cloverService.fetchOrder(testOrderId);
    
    if (!fullOrder) {
      console.log("❌ Could not fetch order details");
      console.log("💡 Verify the order ID is correct");
      return;
    }

    console.log("✅ Order details retrieved");
    console.log(`   Order ID: ${fullOrder.id}`);
    console.log(`   Total: $${fullOrder.total.toFixed(2)}`);
    console.log(`   Items: ${fullOrder.items.length}`);

    // Step 3: Map to Lightspeed format
    console.log("\n3️⃣  Mapping order to Lightspeed format...");
    const mapper = new OrderMapper();
    
    const mapOptions: any = {
      shopId: env.LIGHTSPEED_SHOP_ID!,
    };
    
    if (env.LIGHTSPEED_EMPLOYEE_ID) {
      mapOptions.employeeId = env.LIGHTSPEED_EMPLOYEE_ID;
    }
    
    if (env.LIGHTSPEED_REGISTER_ID) {
      mapOptions.registerId = env.LIGHTSPEED_REGISTER_ID;
    }
    
    const salePayload = mapper.mapToLightspeed(fullOrder, mapOptions);
    
    console.log("✅ Order mapped successfully");
    console.log(`   Shop ID: ${salePayload.shopID}`);
    console.log(`   Line Items: ${salePayload.lines.length}`);
    const total = salePayload.lines.reduce((sum: number, line: any) => sum + (line.unitPrice * line.quantity), 0);
    console.log(`   Total: $${total.toFixed(2)}`);

    // Step 4: Ask for confirmation before creating in Lightspeed
    console.log("\n4️⃣  Ready to create sale in Lightspeed");
    console.log("\n⚠️  This will create a REAL sale in your Lightspeed system!");
    console.log("\nOrder details that will be created:");
    console.log(JSON.stringify(salePayload, null, 2));

    // Auto-proceed in test mode (you can modify this)
    const shouldProceed = true; // Set to false to just preview without creating

    if (!shouldProceed) {
      console.log("\n⏸️  Skipped - set shouldProceed=true to create the sale");
      return;
    }

    // Step 5: Create sale in Lightspeed
    console.log("\n5️⃣  Creating sale in Lightspeed...");
    const createdSale = await lightspeedService.createSale(salePayload);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 SUCCESS! Integration test completed!");
    console.log("=".repeat(60));
    console.log("\n✅ Order successfully synced from Clover to Lightspeed");
    console.log(`   Clover Order ID: ${fullOrder.id}`);
    console.log(`   Lightspeed Sale ID: ${createdSale.saleID || "N/A"}`);
    console.log(`   Total: $${fullOrder.total.toFixed(2)}`);
    
    console.log("\n✅ Your integration is working! 🎊");
    console.log("\n📝 Next steps:");
    console.log("   1. Set up webhooks for real-time syncing");
    console.log("   2. Monitor logs when orders come in");
    console.log("   3. Deploy to production when ready");

  } catch (error: any) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ Integration test failed");
    console.log("=".repeat(60));
    console.error("\nError details:");
    console.error(error.message);
    
    if (error.response?.data) {
      console.error("\nAPI Error Response:");
      console.error(JSON.stringify(error.response.data, null, 2));
    }

    console.log("\n💡 Troubleshooting:");
    console.log("   1. Verify Clover merchant ID and token are correct");
    console.log("   2. Verify Lightspeed credentials are correct");
    console.log("   3. Check that orders exist in Clover");
    console.log("   4. Run: npm run test:clover");
    console.log("   5. Run: npm run test:lightspeed");
    
    process.exit(1);
  }
}

testEndToEnd();


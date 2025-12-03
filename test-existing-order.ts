// Test script to process an existing Clover order
import { env } from "./src/config/env";
import { logger } from "./src/lib/logger";
import { CloverService } from "./src/services/clover.service";
import { LightspeedService } from "./src/services/lightspeed.service";
import { OrderMapper } from "./src/mappers/order.mapper";
import { OrderProcessorService } from "./src/services/order-processor.service";

async function testExistingOrder() {
  try {
    console.log("🔍 Fetching orders from Clover...\n");

    // Initialize services
    const cloverService = new CloverService(env);
    const lightspeedService = new LightspeedService(env);
    const orderMapper = new OrderMapper();

    // Fetch recent orders
    const response = await fetch(
      `https://sandbox.dev.clover.com/v3/merchants/${env.CLOVER_MERCHANT_ID}/orders?limit=10&expand=lineItems`,
      {
        headers: {
          Authorization: `Bearer ${env.CLOVER_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const orders = data.elements || [];

    if (orders.length === 0) {
      console.log("❌ No orders found in your Clover account.");
      console.log("Please create at least one order in Clover Sandbox first.");
      return;
    }

    console.log(`✅ Found ${orders.length} orders:\n`);
    orders.forEach((order: any, index: number) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Total: $${(order.total / 100).toFixed(2)}`);
      console.log(`   Created: ${new Date(order.createdTime).toLocaleString()}`);
      console.log(`   Line Items: ${order.lineItems?.elements?.length || 0}`);
      console.log("");
    });

    // Test with the first order
    const testOrder = orders[0];
    console.log(`\n🧪 Testing integration with Order ID: ${testOrder.id}\n`);

    // Initialize order processor
    const processor = new OrderProcessorService({
      cloverService,
      lightspeedService,
      orderMapper,
      env,
    });

    // Process the order
    console.log("📤 Processing order and sending to Lightspeed...\n");
    await processor.processByOrderId(testOrder.id);

    console.log("\n✅ Test completed successfully!");
    console.log("Check the logs above for details of the order processing.");
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testExistingOrder();


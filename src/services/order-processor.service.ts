import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import type { OrderDeduplicator } from "../lib/order-deduplicator";
import type { OrderMapper, OrderMapOptions } from "../mappers/order.mapper";
import type { CloverService } from "./clover.service";
import type { LightspeedService } from "./lightspeed.service";

export interface OrderProcessorDependencies {
  cloverService: CloverService;
  lightspeedService: LightspeedService;
  orderMapper: OrderMapper;
  env: Env;
  deduplicator?: OrderDeduplicator;
}

export class OrderProcessorService {
  constructor(private readonly deps: OrderProcessorDependencies) {}

  async processByOrderId(orderId: string) {
    const { cloverService, lightspeedService, orderMapper, env, deduplicator } = this.deps;

    if (!env.LIGHTSPEED_SHOP_ID) {
      throw new Error("LIGHTSPEED_SHOP_ID must be configured");
    }

    // Check for duplicate orders
    if (deduplicator?.isDuplicate(orderId)) {
      logger.warn({ orderId }, "Order already processed, skipping duplicate");
      throw new Error(`Order ${orderId} has already been processed`);
    }

    logger.info({ orderId }, "Fetching order from Clover");

    const order = await cloverService.fetchOrder(orderId);

    // Validate order has items
    if (!order.items || order.items.length === 0) {
      logger.warn({ orderId, orderTotal: order.total }, "Order has no items, skipping");
      throw new Error("Order has no items to process");
    }

    // Validate order total is positive
    if (order.total <= 0) {
      logger.warn({ orderId, orderTotal: order.total }, "Order total is zero or negative, skipping");
      throw new Error("Order total must be greater than zero");
    }

    logger.info(
      { orderId, itemCount: order.items.length, orderTotal: order.total },
      "Order validated, mapping to Lightspeed format"
    );

    const mapOptions: OrderMapOptions = {
      shopId: env.LIGHTSPEED_SHOP_ID,
    };

    if (env.LIGHTSPEED_EMPLOYEE_ID) {
      mapOptions.employeeId = env.LIGHTSPEED_EMPLOYEE_ID;
    }

    if (env.LIGHTSPEED_REGISTER_ID) {
      mapOptions.registerId = env.LIGHTSPEED_REGISTER_ID;
    }

    const salePayload = orderMapper.mapToLightspeed(order, mapOptions);

    logger.info({ orderId, lineCount: salePayload.lines.length }, "Creating sale in Lightspeed");

    await lightspeedService.createSale(salePayload);

    // Mark order as processed after successful creation
    deduplicator?.markProcessed(orderId);

    logger.info({ orderId, saleReference: salePayload.referenceNumber }, "Order successfully forwarded to Lightspeed");
  }
}

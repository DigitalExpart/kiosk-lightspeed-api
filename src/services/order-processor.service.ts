import type { Env } from "../config/env";
import { logger } from "../lib/logger";
import type { OrderMapper, OrderMapOptions } from "../mappers/order.mapper";
import type { CloverService } from "./clover.service";
import type { LightspeedService } from "./lightspeed.service";

export interface OrderProcessorDependencies {
  cloverService: CloverService;
  lightspeedService: LightspeedService;
  orderMapper: OrderMapper;
  env: Env;
}

export class OrderProcessorService {
  constructor(private readonly deps: OrderProcessorDependencies) {}

  async processByOrderId(orderId: string) {
    const { cloverService, lightspeedService, orderMapper, env } = this.deps;

    if (!env.LIGHTSPEED_SHOP_ID) {
      throw new Error("LIGHTSPEED_SHOP_ID must be configured");
    }

    const order = await cloverService.fetchOrder(orderId);
 
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

    await lightspeedService.createSale(salePayload);

    logger.info({ orderId }, "Order forwarded to Lightspeed");
  }
}

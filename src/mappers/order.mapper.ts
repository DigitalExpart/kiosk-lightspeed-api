import type { CloverOrder } from "../types/clover";
import type { LightspeedSalePayload } from "../types/lightspeed";

export interface OrderMapOptions {
  shopId: string;
  employeeId?: string;
  registerId?: string;
}

export class OrderMapper {
  mapToLightspeed(order: CloverOrder, options: OrderMapOptions): LightspeedSalePayload {
    const lines = order.items.map((item) => {
      const note = item.modifiers?.map((modifier) => modifier.name).join(", ");

      return {
        itemID: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        ...(note ? { note } : {}),
      };
    });

    const payments = [
      {
        amount: order.total,
        ...(order.tenderId ? { reference: order.tenderId } : {}),
      },
    ];

    const payload = {
      shopID: options.shopId,
      lines,
      payments,
      note: "Generated from Clover Kiosk order",
      total: order.total,
    } as LightspeedSalePayload;

    if (options.employeeId) {
      payload.employeeID = options.employeeId;
    }

    if (options.registerId) {
      payload.registerID = options.registerId;
    }

    if (order.customerId) {
      payload.customerID = order.customerId;
    }

    if (order.taxAmount != null) {
      payload.taxAmount = order.taxAmount;
    }

    if (order.tipAmount != null) {
      payload.tipAmount = order.tipAmount;
    }

    payload.referenceNumber = order.id;

    return payload;
  }
}

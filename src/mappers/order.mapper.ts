import type { CloverOrder } from "../types/clover";
import type { LightspeedSaleLine, LightspeedSalePayload } from "../types/lightspeed";

export interface OrderMapOptions {
  shopId: string;
  employeeId?: string;
  registerId?: string;
}

export class OrderMapper {
  mapToLightspeed(order: CloverOrder, options: OrderMapOptions): LightspeedSalePayload {
    const lines: LightspeedSaleLine[] = [];

    // Process each item and its modifiers/discounts
    for (const item of order.items) {
      // Calculate base line price including modifiers
      let linePrice = item.price;
      const modifierNotes: string[] = [];

      if (item.modifiers && item.modifiers.length > 0) {
        const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
        linePrice += modifierTotal;
        modifierNotes.push(...item.modifiers.map((mod) => `${mod.name} (+$${mod.price.toFixed(2)})`));
      }

      // Build discounts array for this line item
      const lineDiscounts: Array<{ description: string; amount: number }> = [];
      if (item.discounts && item.discounts.length > 0) {
        for (const discount of item.discounts) {
          lineDiscounts.push({
            description: discount.name || "Line item discount",
            amount: discount.amount,
          });
        }
      }

      // Create the line item
      const line: LightspeedSaleLine = {
        itemID: item.id,
        quantity: item.quantity,
        unitPrice: linePrice,
      };

      // Add note if there are modifiers
      if (modifierNotes.length > 0) {
        line.note = modifierNotes.join(", ");
      }

      // Add discounts if present
      if (lineDiscounts.length > 0) {
        line.discounts = lineDiscounts;
      }

      lines.push(line);
    }

    // Handle order-level discounts by distributing them proportionally or adding as a separate adjustment
    // For simplicity, we'll add order-level discounts to the first line item
    if (order.discounts && order.discounts.length > 0 && lines.length > 0 && lines[0]) {
      const orderDiscounts = order.discounts.map((discount) => ({
        description: discount.name || "Order discount",
        amount: discount.amount,
      }));

      // Add order discounts to the first line item
      if (lines[0].discounts) {
        lines[0].discounts.push(...orderDiscounts);
      } else {
        lines[0].discounts = orderDiscounts;
      }
    }

    const payments = [
      {
        amount: order.total,
        ...(order.tenderId ? { reference: order.tenderId } : {}),
      },
    ];

    // Build comprehensive note
    const notes: string[] = ["Generated from Clover Kiosk order"];
    if (order.id) {
      notes.push(`Clover Order ID: ${order.id}`);
    }
    if (order.createdTime) {
      notes.push(`Created: ${new Date(order.createdTime).toISOString()}`);
    }

    const payload = {
      shopID: options.shopId,
      lines,
      payments,
      note: notes.join(" | "),
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

    // Comprehensive tax handling
    if (order.taxAmount != null && order.taxAmount > 0) {
      payload.taxAmount = order.taxAmount;
    }

    if (order.tipAmount != null && order.tipAmount > 0) {
      payload.tipAmount = order.tipAmount;
    }

    payload.referenceNumber = order.id;

    return payload;
  }
}

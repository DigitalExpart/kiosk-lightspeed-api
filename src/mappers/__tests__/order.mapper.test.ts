import { describe, it, expect } from "@jest/globals";
import { OrderMapper } from "../order.mapper";
import type { CloverOrder } from "../../types/clover";

describe("OrderMapper", () => {
  const mapper = new OrderMapper();

  it("should map basic order to Lightspeed format", () => {
    const order: CloverOrder = {
      id: "order-123",
      createdTime: Date.now(),
      currency: "USD",
      total: 25.50,
      items: [
        {
          id: "item-1",
          name: "Test Item",
          price: 25.50,
          quantity: 1,
        },
      ],
      raw: {},
    };

    const result = mapper.mapToLightspeed(order, { shopId: "shop-123" });

    expect(result.shopID).toBe("shop-123");
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]?.itemID).toBe("item-1");
    expect(result.lines[0]?.quantity).toBe(1);
    expect(result.lines[0]?.unitPrice).toBe(25.50);
    expect(result.total).toBe(25.50);
    expect(result.referenceNumber).toBe("order-123");
  });

  it("should include modifiers in line price", () => {
    const order: CloverOrder = {
      id: "order-123",
      createdTime: Date.now(),
      currency: "USD",
      total: 30.00,
      items: [
        {
          id: "item-1",
          name: "Burger",
          price: 25.00,
          quantity: 1,
          modifiers: [
            { id: "mod-1", name: "Extra Cheese", price: 2.50 },
            { id: "mod-2", name: "Bacon", price: 2.50 },
          ],
        },
      ],
      raw: {},
    };

    const result = mapper.mapToLightspeed(order, { shopId: "shop-123" });

    expect(result.lines[0]?.unitPrice).toBe(30.00); // 25 + 2.50 + 2.50
    expect(result.lines[0]?.note).toContain("Extra Cheese");
    expect(result.lines[0]?.note).toContain("Bacon");
  });

  it("should map line item discounts", () => {
    const order: CloverOrder = {
      id: "order-123",
      createdTime: Date.now(),
      currency: "USD",
      total: 20.00,
      items: [
        {
          id: "item-1",
          name: "Item",
          price: 25.00,
          quantity: 1,
          discounts: [{ id: "disc-1", name: "10% Off", amount: 5.00 }],
        },
      ],
      raw: {},
    };

    const result = mapper.mapToLightspeed(order, { shopId: "shop-123" });

    expect(result.lines[0]?.discounts).toBeDefined();
    expect(result.lines[0]?.discounts).toHaveLength(1);
    expect(result.lines[0]?.discounts?.[0]?.description).toBe("10% Off");
    expect(result.lines[0]?.discounts?.[0]?.amount).toBe(5.00);
  });

  it("should map order-level discounts", () => {
    const order: CloverOrder = {
      id: "order-123",
      createdTime: Date.now(),
      currency: "USD",
      total: 45.00,
      items: [
        {
          id: "item-1",
          name: "Item",
          price: 50.00,
          quantity: 1,
        },
      ],
      discounts: [{ id: "disc-1", name: "Order Discount", amount: 5.00 }],
      raw: {},
    };

    const result = mapper.mapToLightspeed(order, { shopId: "shop-123" });

    expect(result.lines[0]?.discounts).toBeDefined();
    expect(result.lines[0]?.discounts).toHaveLength(1);
    expect(result.lines[0]?.discounts?.[0]?.description).toBe("Order Discount");
  });

  it("should include optional fields when provided", () => {
    const order: CloverOrder = {
      id: "order-123",
      createdTime: Date.now(),
      currency: "USD",
      total: 25.50,
      taxAmount: 2.00,
      tipAmount: 5.00,
      customerId: "customer-123",
      items: [
        {
          id: "item-1",
          name: "Item",
          price: 25.50,
          quantity: 1,
        },
      ],
      raw: {},
    };

    const result = mapper.mapToLightspeed(order, {
      shopId: "shop-123",
      employeeId: "emp-123",
      registerId: "reg-123",
    });

    expect(result.employeeID).toBe("emp-123");
    expect(result.registerID).toBe("reg-123");
    expect(result.customerID).toBe("customer-123");
    expect(result.taxAmount).toBe(2.00);
    expect(result.tipAmount).toBe(5.00);
  });
});


import { describe, it, expect, beforeEach } from "@jest/globals";
import { OrderDeduplicator } from "../order-deduplicator";

describe("OrderDeduplicator", () => {
  let deduplicator: OrderDeduplicator;

  beforeEach(() => {
    deduplicator = new OrderDeduplicator(1000); // 1 second TTL for testing
  });

  it("should return false for new order IDs", () => {
    expect(deduplicator.isDuplicate("order-123")).toBe(false);
  });

  it("should return true for processed order IDs", () => {
    deduplicator.markProcessed("order-123");
    expect(deduplicator.isDuplicate("order-123")).toBe(true);
  });

  it("should track multiple orders", () => {
    deduplicator.markProcessed("order-1");
    deduplicator.markProcessed("order-2");
    deduplicator.markProcessed("order-3");

    expect(deduplicator.isDuplicate("order-1")).toBe(true);
    expect(deduplicator.isDuplicate("order-2")).toBe(true);
    expect(deduplicator.isDuplicate("order-3")).toBe(true);
    expect(deduplicator.isDuplicate("order-4")).toBe(false);
  });

  it("should return correct size", () => {
    expect(deduplicator.getSize()).toBe(0);
    deduplicator.markProcessed("order-1");
    expect(deduplicator.getSize()).toBe(1);
    deduplicator.markProcessed("order-2");
    expect(deduplicator.getSize()).toBe(2);
  });

  it("should clear all tracked orders", () => {
    deduplicator.markProcessed("order-1");
    deduplicator.markProcessed("order-2");
    expect(deduplicator.getSize()).toBe(2);

    deduplicator.clear();
    expect(deduplicator.getSize()).toBe(0);
    expect(deduplicator.isDuplicate("order-1")).toBe(false);
    expect(deduplicator.isDuplicate("order-2")).toBe(false);
  });
});


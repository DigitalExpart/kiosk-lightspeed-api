import { logger } from "./logger";

/**
 * Simple in-memory deduplicator for order IDs.
 * In production, consider using Redis or a database for distributed systems.
 */
export class OrderDeduplicator {
  private readonly processedOrders = new Set<string>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) {
    // Default: 24 hours TTL
    this.ttlMs = ttlMs;
  }

  /**
   * Check if an order has already been processed.
   * Returns true if the order is a duplicate, false otherwise.
   */
  isDuplicate(orderId: string): boolean {
    return this.processedOrders.has(orderId);
  }

  /**
   * Mark an order as processed.
   */
  markProcessed(orderId: string): void {
    this.processedOrders.add(orderId);
    logger.debug({ orderId }, "Order marked as processed");

    // Schedule cleanup after TTL
    setTimeout(() => {
      this.processedOrders.delete(orderId);
      logger.debug({ orderId }, "Order removed from deduplication cache");
    }, this.ttlMs);
  }

  /**
   * Get the number of orders currently tracked.
   */
  getSize(): number {
    return this.processedOrders.size;
  }

  /**
   * Clear all tracked orders (useful for testing or manual cleanup).
   */
  clear(): void {
    const size = this.processedOrders.size;
    this.processedOrders.clear();
    logger.info({ clearedCount: size }, "Deduplication cache cleared");
  }
}


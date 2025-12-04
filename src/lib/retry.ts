import { logger } from "./logger";

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ECONNREFUSED"],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = isRetryableError(error, opts);

      // Don't retry on last attempt or if error is not retryable
      if (attempt === opts.maxAttempts || !isRetryable) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const currentDelay = Math.min(delay, opts.maxDelayMs);

      logger.warn(
        {
          attempt,
          maxAttempts: opts.maxAttempts,
          delay: currentDelay,
          error: error.message,
          statusCode: error.response?.status,
        },
        "Retrying after error"
      );

      await sleep(currentDelay);
      delay *= opts.backoffMultiplier;
    }
  }

  throw lastError;
}

function isRetryableError(error: any, options: Required<RetryOptions>): boolean {
  // Check for network errors
  if (error.code && options.retryableErrors.includes(error.code)) {
    return true;
  }

  // Check for HTTP status codes
  const statusCode = error.response?.status;
  if (statusCode && options.retryableStatusCodes.includes(statusCode)) {
    return true;
  }

  // Check for axios timeout
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return true;
  }

  // Don't retry client errors (4xx) except for specific ones
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    // Retry on:
    // - 408 (Request Timeout)
    // - 429 (Too Many Requests)
    // - 404 (Not Found) - for Clover API race conditions where webhook arrives before order is committed
    return statusCode === 408 || statusCode === 429 || statusCode === 404;
  }

  return false;
}


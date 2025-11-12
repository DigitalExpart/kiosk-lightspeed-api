import { describe, it, expect, jest } from "@jest/globals";
import { withRetry } from "../retry";

describe("withRetry", () => {
  it("should return result on first attempt if successful", async () => {
    const fn = jest.fn<() => Promise<string>>().mockResolvedValue("success");
    const result = await withRetry(fn);
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on transient errors", async () => {
    const fn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ response: { status: 500 } } as any)
      .mockResolvedValueOnce("success");

    const result = await withRetry(fn, { maxAttempts: 2, initialDelayMs: 10 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  }, 10000);

  it("should not retry on non-retryable errors", async () => {
    const fn = jest.fn<() => Promise<string>>().mockRejectedValue({ response: { status: 404 } } as any);

    await expect(withRetry(fn, { maxAttempts: 3 })).rejects.toMatchObject({
      response: { status: 404 },
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should throw after max attempts", async () => {
    const fn = jest.fn<() => Promise<string>>().mockRejectedValue({ response: { status: 500 } } as any);

    await expect(
      withRetry(fn, { maxAttempts: 2, initialDelayMs: 10 })
    ).rejects.toMatchObject({ response: { status: 500 } });

    expect(fn).toHaveBeenCalledTimes(2);
  }, 10000);
});


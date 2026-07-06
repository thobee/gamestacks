// tests/paystack.test.ts
// Unit tests for Paystack utilities

import {
  generateOrderNumber,
  generatePaystackReference,
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/paystack";

// ── generateOrderNumber ───────────────────────────────────────────────────────

describe("generateOrderNumber", () => {
  it("should return a string starting with GS-", () => {
    expect(generateOrderNumber()).toMatch(/^GS-/);
  });

  it("should have three dash-separated segments", () => {
    const parts = generateOrderNumber().split("-");
    expect(parts).toHaveLength(3);
  });

  it("should produce unique values on each call", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});

// ── generatePaystackReference ─────────────────────────────────────────────────

describe("generatePaystackReference", () => {
  it("should return a string starting with GSTACKS_", () => {
    expect(generatePaystackReference()).toMatch(/^GSTACKS_/);
  });

  it("should have three underscore-separated segments", () => {
    const parts = generatePaystackReference().split("_");
    expect(parts).toHaveLength(3);
  });

  it("should produce unique values on each call", () => {
    const a = generatePaystackReference();
    const b = generatePaystackReference();
    expect(a).not.toBe(b);
  });
});

// ── initializePaystackTransaction ─────────────────────────────────────────────

describe("initializePaystackTransaction", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("should throw if PAYSTACK_SECRET_KEY is not set", async () => {
    delete process.env.PAYSTACK_SECRET_KEY;

    await expect(
      initializePaystackTransaction({
        email: "test@example.com",
        amount: 100000,
        reference: "TEST_REF_001",
      }),
    ).rejects.toThrow("PAYSTACK_SECRET_KEY is not configured");
  });

  it("should return authorization_url on success", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        message: "Authorization URL created",
        data: {
          authorization_url: "https://checkout.paystack.com/abc123",
          access_code: "abc123",
          reference: "TEST_REF_001",
        },
      }),
    });

    const result = await initializePaystackTransaction({
      email: "test@example.com",
      amount: 250000,
      reference: "TEST_REF_001",
      callback_url: "http://localhost:3000/orders/1?ref=TEST_REF_001",
    });

    expect(result.status).toBe(true);
    expect(result.data.authorization_url).toBe(
      "https://checkout.paystack.com/abc123",
    );
  });

  it("should send Authorization header with Bearer token", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake_key";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        message: "Authorization URL created",
        data: {
          authorization_url: "https://checkout.paystack.com/xyz",
          access_code: "xyz",
          reference: "REF",
        },
      }),
    });

    await initializePaystackTransaction({
      email: "user@example.com",
      amount: 100000,
      reference: "REF",
    });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer sk_test_fake_key");
  });

  it("should throw on non-ok HTTP response", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(
      initializePaystackTransaction({
        email: "test@example.com",
        amount: 100000,
        reference: "REF",
      }),
    ).rejects.toThrow("Paystack API error 401");
  });
});

// ── verifyPaystackTransaction ─────────────────────────────────────────────────

describe("verifyPaystackTransaction", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("should throw if PAYSTACK_SECRET_KEY is not set", async () => {
    delete process.env.PAYSTACK_SECRET_KEY;

    await expect(verifyPaystackTransaction("GSTACKS_REF")).rejects.toThrow(
      "PAYSTACK_SECRET_KEY is not configured",
    );
  });

  it("should return success status for a successful payment", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        message: "Verification successful",
        data: {
          id: 12345,
          status: "success",
          reference: "GSTACKS_REF",
          amount: 250000,
          paid_at: "2026-06-22T10:00:00.000Z",
          customer: { email: "buyer@example.com" },
          metadata: { orderId: "order-uuid-123" },
        },
      }),
    });

    const result = await verifyPaystackTransaction("GSTACKS_REF");

    expect(result.status).toBe(true);
    expect(result.data.status).toBe("success");
    expect(result.data.reference).toBe("GSTACKS_REF");
    expect(result.data.metadata.orderId).toBe("order-uuid-123");
  });

  it("should return failed status for a failed payment", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        message: "Verification successful",
        data: {
          id: 99,
          status: "failed",
          reference: "GSTACKS_FAILED",
          amount: 100000,
          paid_at: null,
          customer: { email: "user@example.com" },
          metadata: {},
        },
      }),
    });

    const result = await verifyPaystackTransaction("GSTACKS_FAILED");

    expect(result.data.status).toBe("failed");
  });

  it("should URL-encode the reference when calling Paystack", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        message: "Verification successful",
        data: {
          id: 1,
          status: "success",
          reference: "GSTACKS_REF SPACE",
          amount: 0,
          paid_at: "",
          customer: { email: "" },
          metadata: {},
        },
      }),
    });

    await verifyPaystackTransaction("GSTACKS_REF SPACE");

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("GSTACKS_REF%20SPACE");
  });

  it("should throw on non-ok HTTP response", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    });

    await expect(verifyPaystackTransaction("BAD_REF")).rejects.toThrow(
      "Paystack verification error 400",
    );
  });
});

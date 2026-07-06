// tests/payments-verify.test.ts
// Unit tests for GET /api/payments/verify
// Mocks Supabase and Paystack — no real network calls

import { NextRequest } from "next/server";
import { GET } from "@/app/api/payments/verify/route";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@/lib/paystack", () => ({
  verifyPaystackTransaction: jest.fn(),
}));

import { supabase } from "@/lib/supabase";
import { verifyPaystackTransaction } from "@/lib/paystack";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(reference?: string): NextRequest {
  const url = reference
    ? `http://localhost:3000/api/payments/verify?reference=${encodeURIComponent(reference)}`
    : "http://localhost:3000/api/payments/verify";
  return new NextRequest(url);
}

const mockSuccessfulVerification = {
  status: true,
  message: "Verification successful",
  data: {
    id: 12345,
    status: "success" as const,
    reference: "GSTACKS_TEST_REF",
    amount: 250000,
    paid_at: "2026-06-22T10:00:00.000Z",
    customer: { email: "buyer@example.com" },
    metadata: { orderId: "order-uuid-1" },
  },
};

const mockOrder = {
  id: "order-uuid-1",
  order_number: "GS-TEST-001",
  status: "completed",
  total_naira: 2500,
  customer_email: "buyer@example.com",
  order_items: [
    { game_id: "game-1", game_title: "Test Game", price_at_purchase: 2500 },
  ],
};

function buildSupabaseMock({
  updateTxError = null,
  updateOrderError = null,
  orderData = mockOrder,
  orderError = null,
}: {
  updateTxError?: null | { message: string };
  updateOrderError?: null | { message: string };
  orderData?: typeof mockOrder | null;
  orderError?: null | { message: string };
} = {}) {
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "transactions") {
      return {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: updateTxError }),
      };
    }
    if (table === "orders") {
      return {
        update: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: orderData, error: orderError }),
        eq: jest.fn().mockReturnThis(),
      };
    }
    return {};
  });
}

// ── Validation tests ──────────────────────────────────────────────────────────

describe("GET /api/payments/verify – validation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when reference is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("MISSING_REFERENCE");
  });

  it("returns 400 when reference is longer than 100 characters", async () => {
    const longRef = "A".repeat(101);
    const res = await GET(makeRequest(longRef));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("MISSING_REFERENCE");
  });

  it("accepts a valid reference string", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce(
      mockSuccessfulVerification,
    );
    buildSupabaseMock();

    const res = await GET(makeRequest("GSTACKS_TEST_REF"));
    expect(res.status).toBe(200);
  });
});

// ── Payment success flow ──────────────────────────────────────────────────────

describe("GET /api/payments/verify – success flow", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with paymentStatus=success and order data", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce(
      mockSuccessfulVerification,
    );
    buildSupabaseMock();

    const res = await GET(makeRequest("GSTACKS_TEST_REF"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.paymentStatus).toBe("success");
    expect(json.data.order).toBeDefined();
    expect(json.data.order.id).toBe("order-uuid-1");
  });

  it("updates transaction status to 'success' in DB", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce(
      mockSuccessfulVerification,
    );
    buildSupabaseMock();

    await GET(makeRequest("GSTACKS_TEST_REF"));

    expect(supabase.from).toHaveBeenCalledWith("transactions");
  });
});

// ── Payment failed/abandoned flow ─────────────────────────────────────────────

describe("GET /api/payments/verify – failed payment", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with paymentStatus=failed for failed payment", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce({
      ...mockSuccessfulVerification,
      data: {
        ...mockSuccessfulVerification.data,
        status: "failed" as const,
        metadata: { orderId: "order-uuid-1" },
      },
    });
    buildSupabaseMock();

    const res = await GET(makeRequest("GSTACKS_FAILED_REF"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.paymentStatus).toBe("failed");
  });

  it("returns 200 with paymentStatus=abandoned for abandoned payment", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce({
      ...mockSuccessfulVerification,
      data: {
        ...mockSuccessfulVerification.data,
        status: "abandoned" as const,
        metadata: { orderId: "order-uuid-1" },
      },
    });
    buildSupabaseMock();

    const res = await GET(makeRequest("GSTACKS_ABANDONED_REF"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.paymentStatus).toBe("abandoned");
  });
});

// ── Missing metadata / edge cases ─────────────────────────────────────────────

describe("GET /api/payments/verify – edge cases", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when orderId is missing from Paystack metadata", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce({
      ...mockSuccessfulVerification,
      data: {
        ...mockSuccessfulVerification.data,
        metadata: {}, // no orderId
      },
    });

    const res = await GET(makeRequest("GSTACKS_NO_ORDER_REF"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("INVALID_REFERENCE");
  });

  it("returns 400 when Paystack status is false", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce({
      status: false,
      message: "Invalid key",
      data: {} as never,
    });

    const res = await GET(makeRequest("GSTACKS_TEST_REF"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VERIFICATION_FAILED");
  });

  it("returns 404 when order not found in DB after successful payment", async () => {
    (verifyPaystackTransaction as jest.Mock).mockResolvedValueOnce(
      mockSuccessfulVerification,
    );
    buildSupabaseMock({
      orderData: null,
      orderError: { message: "Not found" },
    });

    const res = await GET(makeRequest("GSTACKS_TEST_REF"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("ORDER_NOT_FOUND");
  });

  it("returns 500 when Paystack throws an error", async () => {
    (verifyPaystackTransaction as jest.Mock).mockRejectedValueOnce(
      new Error("Network failure"),
    );

    const res = await GET(makeRequest("GSTACKS_TEST_REF"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("SERVER_ERROR");
  });
});

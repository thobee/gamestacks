// tests/payments-initialize.test.ts
// Unit tests for POST /api/payments/initialize
// Mocks Supabase and Paystack so no real network calls are made

import { NextRequest } from "next/server";
import { POST } from "@/app/api/payments/initialize/route";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@/lib/paystack", () => ({
  initializePaystackTransaction: jest.fn(),
  generateOrderNumber: jest.fn(() => "GS-TEST-0001"),
  generatePaystackReference: jest.fn(() => "GSTACKS_TEST_000001"),
}));

import { supabase } from "@/lib/supabase";
import { initializePaystackTransaction } from "@/lib/paystack";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/payments/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  items: [{ gameId: "game-uuid-1" }],
  customerEmail: "buyer@example.com",
  customerFullName: "John Doe",
  customerWhatsapp: "+2348012345678",
  deliveryMethod: "digital",
};

const mockGame = {
  id: "game-uuid-1",
  title: "Test Game",
  price_naira: 2500,
  is_published: true,
};

const mockOrder = {
  id: "order-uuid-1",
  order_number: "GS-TEST-0001",
  total_naira: 2500,
};

// Build a chainable supabase mock helper
function buildSupabaseMock({
  gamesData = [mockGame],
  gamesError = null,
  orderData = mockOrder,
  orderError = null,
  itemsError = null,
  txError = null,
}: {
  gamesData?: (typeof mockGame)[] | null;
  gamesError?: null | { message: string };
  orderData?: typeof mockOrder | null;
  orderError?: null | { message: string };
  itemsError?: null | { message: string };
  txError?: null | { message: string };
} = {}) {
  const fromMock = jest.fn().mockImplementation((table: string) => {
    if (table === "games") {
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: gamesData, error: gamesError }),
      };
    }
    if (table === "orders") {
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: orderData, error: orderError }),
      };
    }
    if (table === "order_items") {
      return {
        insert: jest.fn().mockResolvedValue({ error: itemsError }),
      };
    }
    if (table === "transactions") {
      return {
        insert: jest.fn().mockResolvedValue({ error: txError }),
      };
    }
    return {};
  });

  (supabase.from as jest.Mock).mockImplementation(fromMock);
}

// ── Validation tests ──────────────────────────────────────────────────────────

describe("POST /api/payments/initialize – validation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when items array is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, items: undefined }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("MISSING_FIELDS");
  });

  it("returns 400 when items array is empty", async () => {
    const res = await POST(makeRequest({ ...validBody, items: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("MISSING_FIELDS");
  });

  it("returns 400 when customerEmail is missing", async () => {
    const res = await POST(
      makeRequest({ ...validBody, customerEmail: undefined }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("MISSING_FIELDS");
  });

  it("returns 400 when customerFullName is missing", async () => {
    const res = await POST(
      makeRequest({ ...validBody, customerFullName: undefined }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("MISSING_FIELDS");
  });

  it("returns 422 for an invalid email format", async () => {
    const res = await POST(
      makeRequest({ ...validBody, customerEmail: "not-an-email" }),
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("INVALID_EMAIL");
  });

  it("returns 422 for an invalid deliveryMethod", async () => {
    const res = await POST(
      makeRequest({ ...validBody, deliveryMethod: "teleport" }),
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("INVALID_DELIVERY");
  });

  it("accepts 'home' as a valid deliveryMethod", async () => {
    buildSupabaseMock();
    (initializePaystackTransaction as jest.Mock).mockResolvedValueOnce({
      status: true,
      data: { authorization_url: "https://paystack.com/pay/test" },
    });

    const res = await POST(
      makeRequest({ ...validBody, deliveryMethod: "home" }),
    );
    // Should proceed past validation (200 OK)
    expect(res.status).toBe(200);
  });
});

// ── Game lookup tests ─────────────────────────────────────────────────────────

describe("POST /api/payments/initialize – game lookup", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 404 when game does not exist", async () => {
    buildSupabaseMock({ gamesData: [] });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("GAMES_NOT_FOUND");
  });

  it("returns 400 when game is not published", async () => {
    buildSupabaseMock({ gamesData: [{ ...mockGame, is_published: false }] });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("GAMES_UNAVAILABLE");
    expect(json.error.message).toContain("Test Game");
  });

  it("returns 500 on database error during game lookup", async () => {
    buildSupabaseMock({ gamesData: null, gamesError: { message: "DB down" } });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DB_ERROR");
  });
});

// ── Success path ──────────────────────────────────────────────────────────────

describe("POST /api/payments/initialize – success", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with authorization_url on successful initialization", async () => {
    buildSupabaseMock();
    (initializePaystackTransaction as jest.Mock).mockResolvedValueOnce({
      status: true,
      data: { authorization_url: "https://checkout.paystack.com/pay/abc" },
    });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.authorizationUrl).toBe(
      "https://checkout.paystack.com/pay/abc",
    );
    expect(json.data.orderId).toBe("order-uuid-1");
    expect(json.data.reference).toBe("GSTACKS_TEST_000001");
  });

  it("calls Paystack with amount in kobo (not naira)", async () => {
    buildSupabaseMock(); // game price = ₦2500
    (initializePaystackTransaction as jest.Mock).mockResolvedValueOnce({
      status: true,
      data: { authorization_url: "https://checkout.paystack.com/pay/abc" },
    });

    await POST(makeRequest(validBody));

    const callArgs = (initializePaystackTransaction as jest.Mock).mock
      .calls[0][0];
    // ₦2500 = 250,000 kobo
    expect(callArgs.amount).toBe(250000);
  });

  it("sends customer email to Paystack", async () => {
    buildSupabaseMock();
    (initializePaystackTransaction as jest.Mock).mockResolvedValueOnce({
      status: true,
      data: { authorization_url: "https://checkout.paystack.com/pay/abc" },
    });

    await POST(makeRequest(validBody));

    const callArgs = (initializePaystackTransaction as jest.Mock).mock
      .calls[0][0];
    expect(callArgs.email).toBe("buyer@example.com");
  });
});

// ── Error path ────────────────────────────────────────────────────────────────

describe("POST /api/payments/initialize – errors", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 500 when order creation fails", async () => {
    buildSupabaseMock({
      orderData: null,
      orderError: { message: "Insert failed" },
    });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("ORDER_ERROR");
  });

  it("returns 500 when Paystack throws", async () => {
    buildSupabaseMock();
    (initializePaystackTransaction as jest.Mock).mockRejectedValueOnce(
      new Error("Paystack API error 500"),
    );

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("PAYSTACK_ERROR");
  });
});

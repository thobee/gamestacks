// lib/paystack.ts
// Paystack payment utilities — server-side only (never call from client)

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitializeParams {
  email: string;
  amount: number; // in kobo
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // in kobo
    paid_at: string;
    customer: {
      email: string;
    };
    metadata: Record<string, unknown>;
  };
}

/**
 * Initialize a Paystack transaction — redirects user to Paystack hosted page
 */
export async function initializePaystackTransaction(
  params: PaystackInitializeParams,
): Promise<PaystackInitializeResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Paystack API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Verify a Paystack transaction by reference
 */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Paystack verification error ${response.status}: ${errorText}`,
    );
  }

  return response.json();
}

/**
 * Generate a unique order number: GS-<timestamp>-<random>
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GS-${timestamp}-${random}`;
}

/**
 * Generate a unique Paystack payment reference
 */
export function generatePaystackReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GSTACKS_${timestamp}_${random}`;
}

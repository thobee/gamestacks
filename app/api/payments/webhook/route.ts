import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// In-memory set to deduplicate webhook events
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 },
      );
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Verify HMAC-SHA512 signature using constant-time comparison to prevent timing attacks
    const expectedHash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(body) as {
      event: string;
      data: {
        reference: string;
        status: string;
        paid_at: string;
        metadata?: { orderId?: string };
      };
    };

    // Replay attack protection — deduplicate by reference + event type
    const eventKey = `${event.event}:${event.data.reference}`;
    if (processedEvents.has(eventKey)) {
      return NextResponse.json({ received: true }, { status: 200 });
    }
    processedEvents.add(eventKey);

    // Handle charge success
    if (event.event === "charge.success") {
      const { reference, metadata, paid_at } = event.data;
      const orderId = metadata?.orderId;

      if (orderId) {
        const paidDate = paid_at ? new Date(paid_at) : new Date();

        await prisma.$transaction([
          prisma.transaction.updateMany({
            where: { paystackReference: reference },
            data: { status: "success", paidAt: paidDate },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { status: "completed" },
          }),
        ]);
      }
    }

    // Handle charge failure
    if (event.event === "charge.failed") {
      const { reference } = event.data;
      await prisma.transaction.updateMany({
        where: { paystackReference: reference },
        data: { status: "failed" },
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

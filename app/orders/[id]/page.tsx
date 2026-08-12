// app/orders/[id]/page.tsx
// Order confirmation — verifies payment and prioritizes key/download access

"use client";

import React, { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";

interface OrderItem {
  id: string;
  game_id: string;
  game_title: string;
  price_at_purchase: number;
}

interface Order {
  id: string;
  status: "pending" | "completed" | "delivered" | "cancelled";
  order_number: string;
  order_items: OrderItem[];
  delivery_summary?: {
    method?: string | null;
    items?: Array<{
      game_id: string;
      game_title: string;
      item_type: string;
      is_digital: boolean;
      download_link: string | null;
      is_game_key?: boolean;
      game_key?: string | null;
    }>;
  };
}

type PaymentStatus = "success" | "failed" | "abandoned" | "pending";

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { success } = useToast();
  const hasShownPaidToast = useRef(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Set<string>>(new Set());

  const isSuccess =
    paymentStatus === "success" || order?.status === "completed";
  const isFailed = paymentStatus === "failed" || paymentStatus === "abandoned";
  const keyItems =
    order?.delivery_summary?.items?.filter((item) => item.is_game_key) || [];
  const primaryKeyItem = keyItems.find((item) => !!item.game_key) || null;
  const downloadItems =
    order?.delivery_summary?.items?.filter(
      (item) => item.is_digital && !!item.download_link,
    ) || [];
  const primaryDownload = downloadItems[0] || null;

  useEffect(() => {
    const verify = async () => {
      try {
        if (!ref) {
          // No ref — fetch order status directly
          const res = await fetch(`/api/payments/verify?orderId=${id}`);
          if (!res.ok) throw new Error("Could not load order");
          const data = await res.json();
          setOrder(data.data.order);
          setPaymentStatus(data.data.paymentStatus || "pending");
          return;
        }

        const res = await fetch(`/api/payments/verify?reference=${ref}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error?.message || "Could not verify payment");
          return;
        }

        setOrder(data.data.order);
        setPaymentStatus(data.data.paymentStatus);
      } catch {
        setError("Failed to load order details. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [id, ref]);

  useEffect(() => {
    if (!isSuccess || hasShownPaidToast.current) return;
    hasShownPaidToast.current = true;
    success("Payment successful. Your game access is now available.");
  }, [isSuccess, success]);

  const revealKey = (gameId: string) => {
    setRevealedKeyIds((prev) => new Set(prev).add(gameId));
  };

  const copyGameKey = async (value: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      success("Game key copied to clipboard.");
    } catch {
      // No-op: browser clipboard can fail in non-secure contexts.
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600" />
          <p className="text-neutral-500 font-semibold text-sm">
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-neutral-50">
        <div className="max-w-md text-center animate-scale-up">
          <p className="mb-4 text-6xl drop-shadow-sm">❌</p>
          <h2 className="mb-2 text-3xl font-bold text-neutral-900 tracking-tight">
            Something went wrong
          </h2>
          <p className="mb-8 text-neutral-500 leading-relaxed">{error}</p>
          <Link
            href="/games"
            className="rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-sm text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center animate-fade-in">
          {isSuccess ? (
            <>
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100/50 shadow-sm relative">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-15" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-emerald-555"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: "#10b981" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                Payment Successful!
              </h1>
              <p className="mt-3 text-neutral-500 text-base max-w-md mx-auto leading-relaxed">
                Your payment is verified. Access your game key and downloads
                immediately below.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Paystack Verified
              </div>
            </>
          ) : isFailed ? (
            <>
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-100/50 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-red-555"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: "#ef4444" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                Payment Failed
              </h1>
              <p className="mt-3 text-neutral-500 text-base max-w-md mx-auto leading-relaxed">
                Your payment transaction was not completed. If you were debited,
                please wait while we auto-reverify.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-100/50 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-555 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: "#3b82f6" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                Order Pending
              </h1>
              <p className="mt-3 text-neutral-500 text-base max-w-md mx-auto leading-relaxed">
                We are processing your payment verification. Hang tight, this
                will take just a moment.
              </p>
            </>
          )}
        </div>

        {isSuccess && primaryKeyItem && (
          <div className="mb-8 rounded-2xl border border-[#111] bg-white p-5 md:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.08)] animate-fade-in print:hidden">
            <p className="text-xs font-semibold text-neutral-500">
              Game key unlocked
            </p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                  {primaryKeyItem.game_title}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  This key is saved in My Library and can be viewed anytime.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyGameKey(primaryKeyItem.game_key || null)}
                  className="inline-flex items-center justify-center rounded-xl bg-[#111] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-neutral-800 active:scale-95"
                >
                  Copy Game Key
                </button>
                <Link
                  href="/library"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-6 py-3 text-sm font-bold text-neutral-800 transition-all hover:bg-neutral-100 active:scale-95"
                >
                  Open My Library
                </Link>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[#111] bg-neutral-50 px-4 py-3">
              <p className="text-xs font-semibold text-neutral-500">
                Key
              </p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-neutral-900">
                {primaryKeyItem.game_key}
              </p>
            </div>
          </div>
        )}

        {isSuccess && !primaryKeyItem && primaryDownload && (
          <div className="mb-8 rounded-2xl border border-[#111] bg-white p-5 md:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.08)] animate-fade-in print:hidden">
            <p className="text-xs font-semibold text-neutral-500">
              Ready to play
            </p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                  Download {primaryDownload.game_title}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Payment received. Your game is ready for immediate download.
                </p>
              </div>
              <a
                href={primaryDownload.download_link || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-neutral-800 active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v11m0 0l-4-4m4 4l4-4m4 8H4"
                  />
                </svg>
                Download Now
              </a>
            </div>
          </div>
        )}

        {order && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 shadow-xl shadow-neutral-100/60 relative overflow-hidden animate-scale-up">
            <div className="mb-5 border-b border-neutral-100 pb-4">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                Your Access
              </h2>
              <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                Order {order.order_number}
              </p>
            </div>

            <div className="space-y-3">
              {order.delivery_summary?.items?.map((item) => {
                const isKeyVisible = revealedKeyIds.has(item.game_id);
                const canShowKey = !!item.game_key;

                return (
                  <div
                    key={item.game_id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-neutral-900">
                          {item.game_title}
                        </p>
                        <p className="text-xs text-neutral-500 font-medium mt-1">
                          {item.item_type}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.is_game_key ? (
                          <>
                            <button
                              onClick={() => revealKey(item.game_id)}
                              className="inline-flex items-center justify-center rounded-lg border border-[#111] px-4 py-2 text-sm font-bold text-[#111] transition hover:bg-[#111] hover:text-white"
                            >
                              {isKeyVisible ? "Key Visible" : "View Key"}
                            </button>
                            {isKeyVisible && canShowKey && (
                              <button
                                onClick={() =>
                                  copyGameKey(item.game_key || null)
                                }
                                className="inline-flex items-center justify-center rounded-lg bg-[#111] px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
                              >
                                Copy Key
                              </button>
                            )}
                          </>
                        ) : item.is_digital && item.download_link ? (
                          <a
                            href={item.download_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-lg bg-[#111] px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-[10px] font-semibold text-neutral-500">
                            Processing
                          </span>
                        )}
                      </div>
                    </div>

                    {item.is_game_key && isKeyVisible && (
                      <div className="mt-3 rounded-xl border border-[#111] bg-white px-3 py-3">
                        <p className="text-xs font-semibold text-neutral-500">
                          Your Game Key
                        </p>
                        <p className="mt-1 break-all font-mono text-sm font-semibold text-neutral-900">
                          {item.game_key || "Key not available yet"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
          {isFailed && (
            <Link
              href="/checkout"
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-center font-bold text-sm text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all"
            >
              Try Again
            </Link>
          )}

          {isSuccess && (
            <Link
              href="/library"
              className="rounded-xl bg-[#111] px-8 py-3.5 text-center font-bold text-sm text-white shadow-md hover:bg-neutral-800 hover:shadow-lg active:scale-95 transition-all"
            >
              Open My Library
            </Link>
          )}

          {isSuccess && !primaryKeyItem && primaryDownload && (
            <a
              href={primaryDownload.download_link || "#"}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-neutral-300 bg-white px-8 py-3.5 text-center font-bold text-sm text-neutral-700 shadow-sm hover:bg-neutral-50 hover:shadow-md active:scale-95 transition-all"
            >
              Download Game
            </a>
          )}

          <Link
            href="/games"
            className={`rounded-xl px-8 py-3.5 text-center font-bold transition-all ${
              isSuccess
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95"
                : "border-2 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 active:scale-95"
            }`}
          >
            {isSuccess ? "Continue Shopping" : "Back to Store"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// app/orders/[id]/page.tsx
// Order confirmation — verifies payment and shows order details

"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatNaira } from "@/lib/utils";

interface OrderItem {
  id: string;
  game_id: string;
  game_title: string;
  price_at_purchase: number;
}

interface Order {
  id: string;
  order_number: string;
  status: "pending" | "completed" | "delivered" | "cancelled";
  total_naira: number;
  subtotal_naira: number;
  transaction_fee_naira: number;
  customer_email: string;
  customer_whatsapp: string | null;
  delivery_method: "digital" | "home";
  items_count: number;
  order_items: OrderItem[];
  created_at: string;
}

type PaymentStatus = "success" | "failed" | "abandoned" | "pending";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600" />
          <p className="text-neutral-500 font-semibold tracking-wide text-sm">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-neutral-50">
        <div className="max-w-md text-center animate-scale-up">
          <p className="mb-4 text-6xl drop-shadow-sm">❌</p>
          <h2 className="mb-2 text-3xl font-extrabold text-neutral-900 tracking-tight">
            Something went wrong
          </h2>
          <p className="mb-8 text-neutral-500 leading-relaxed">{error}</p>
          <Link
            href="/games"
            className="rounded-xl bg-blue-600 px-8 py-3.5 font-bold tracking-wide text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus === "success" || order?.status === "completed";
  const isFailed = paymentStatus === "failed" || paymentStatus === "abandoned";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Status header */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
                Payment Successful!
              </h1>
              <p className="mt-3 text-neutral-500 text-base max-w-md mx-auto leading-relaxed">
                Your order is confirmed. A receipt and delivery details have been sent to your email.
              </p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Payment Failed</h1>
              <p className="mt-3 text-neutral-500 text-base max-w-md mx-auto leading-relaxed">
                Your payment transaction was not completed. If you were debited, please wait while we auto-reverify.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Order Pending</h1>
              <p className="mt-3 text-neutral-500 text-base max-w-md mx-auto leading-relaxed">
                We are processing your payment verification. Hang tight, this will take just a moment.
              </p>
            </>
          )}
        </div>

        {/* Stepper Progress Timeline */}
        {order && (
          <div className="mb-10 px-4 animate-fade-in print:hidden">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 -z-10" />
              <div 
                className="absolute top-4 left-0 h-0.5 bg-blue-600 -translate-y-1/2 -z-10 transition-all duration-700" 
                style={{ width: isSuccess ? (order.status === "completed" || order.status === "delivered" ? "100%" : "66%") : "33%" }} 
              />
              
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm">
                  ✓
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-600">Placed</span>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-350 shadow-sm ${
                  isSuccess 
                    ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                    : isFailed 
                      ? "bg-red-500 text-white ring-4 ring-red-100" 
                      : "bg-neutral-200 text-neutral-500"
                }`}>
                  {isSuccess ? "✓" : isFailed ? "✕" : "2"}
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-600">Paid</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-350 shadow-sm ${
                  order.status === "completed" || order.status === "delivered"
                    ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                    : isSuccess 
                      ? "bg-blue-50 text-blue-600 border border-blue-200 ring-4 ring-blue-50 animate-pulse" 
                      : "bg-neutral-200 text-neutral-500"
                }`}>
                  {order.status === "completed" || order.status === "delivered" ? "✓" : "3"}
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-600">Processing</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-350 shadow-sm ${
                  order.status === "delivered"
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-neutral-200 text-neutral-500"
                }`}>
                  4
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-600">Dispatch</span>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Receipt Card */}
        {order && (
          <div className="rounded-3xl border border-neutral-150 bg-white p-6 md:p-8 shadow-xl shadow-neutral-100/60 relative overflow-hidden animate-scale-up">
            
            {/* Header info */}
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">Receipt</h2>
                <p className="text-[11px] text-neutral-400 font-bold tracking-wide uppercase mt-0.5">Order Invoices</p>
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 px-3.5 py-2 text-xs font-extrabold tracking-wide text-neutral-600 transition-all active:scale-95"
              >
                <span>{order.order_number}</span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {copied ? "✓ Copied" : "Copy"}
                </span>
              </button>
            </div>

            {/* Items */}
            <div className="mb-6 space-y-3">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 transition-all hover:bg-neutral-50"
                >
                  <div>
                    <p className="text-sm font-extrabold text-neutral-800">
                      {item.game_title}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5 tracking-wider">Product License</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-neutral-900">
                    {formatNaira(item.price_at_purchase)}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary List */}
            <div className="rounded-2xl bg-neutral-50/80 border border-neutral-100 p-5 space-y-3">
              <div className="flex justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider">
                <span>Subtotal</span>
                <span className="text-neutral-850 font-extrabold">{formatNaira(order.subtotal_naira)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider">
                <span>Transaction Fee</span>
                <span className="text-neutral-855 font-extrabold">
                  {order.transaction_fee_naira === 0
                    ? "Free"
                    : formatNaira(order.transaction_fee_naira)}
                </span>
              </div>
              
              {/* Receipt tear design element */}
              <div className="border-t border-dashed border-neutral-250/80 my-3 pt-3 flex justify-between text-base font-black">
                <span className="text-neutral-900 uppercase text-xs tracking-wider font-extrabold self-center">Total Paid</span>
                <span className="text-blue-600 text-lg">
                  {formatNaira(order.total_naira)}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="mt-6 grid grid-cols-2 gap-y-4 gap-x-6 border-t border-neutral-100 pt-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Customer Email
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-800 break-all">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Delivery Method
                </p>
                <p className="mt-1 text-sm font-bold capitalize text-neutral-800">{order.delivery_method}</p>
              </div>
              {order.customer_whatsapp && (
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    WhatsApp Delivery Contact
                  </p>
                  <p className="mt-1 text-sm font-bold text-neutral-850">
                    +234 {order.customer_whatsapp}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
          {isFailed && (
            <Link
              href="/checkout"
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-center font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all"
            >
              Try Again
            </Link>
          )}
          
          {isSuccess && (
            <button
              onClick={() => window.print()}
              className="rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 px-8 py-3.5 text-center font-bold text-neutral-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
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

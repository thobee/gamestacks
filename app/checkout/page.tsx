// app/checkout/page.tsx
// Secure Checkout — matches GameHubNG reference design

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { formatNaira } from "@/lib/utils";

type DeliveryMethod = "digital" | "home";

interface FormData {
  fullName: string;
  email: string;
  whatsapp: string;
  deliveryMethod: DeliveryMethod;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
}

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();

  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    whatsapp: "",
    deliveryMethod: "digital",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const transactionFee = 0;
  const total = subtotal + transactionFee;

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (!items.length) {
      setServerError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ gameId: item.gameId })),
          customerFullName: form.fullName.trim(),
          customerEmail: form.email.trim().toLowerCase(),
          customerWhatsapp: form.whatsapp.trim() || undefined,
          deliveryMethod: form.deliveryMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(
          data.error?.message || "Something went wrong. Please try again.",
        );
        return;
      }

      // Redirect to Paystack hosted payment page
      clearCart();
      window.location.href = data.data.authorizationUrl;
    } catch {
      setServerError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to games if cart empty
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <p className="mb-2 text-6xl">🛒</p>
          <h2 className="mb-2 text-2xl font-black text-white">
            Your cart is empty
          </h2>
          <p className="mb-6 text-gray-400">
            Add some games before checking out.
          </p>
          <Link
            href="/games"
            className="rounded-full bg-yellow-400 px-8 py-3 font-black uppercase tracking-wide text-black hover:bg-yellow-300 transition-colors"
          >
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[#2A2A2A] bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-black text-yellow-400">
              Gamestacks
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-yellow-400">
            Secure Checkout
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Complete your purchase to start playing immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* ── Left column ──────────────────────── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Server error */}
              {serverError && (
                <div className="rounded-xl border border-red-500/50 bg-red-900/20 p-4 text-sm text-red-300">
                  {serverError}
                </div>
              )}

              {/* Customer Information */}
              <section className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={`w-full rounded-lg border bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 ${
                        errors.fullName ? "border-red-500" : "border-[#3A3A3A]"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full rounded-lg border bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 ${
                        errors.email ? "border-red-500" : "border-[#3A3A3A]"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    WhatsApp Number{" "}
                    <span className="text-gray-600">(optional)</span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-[#3A3A3A] bg-[#222] px-3 text-sm text-gray-400">
                      +234
                    </span>
                    <input
                      type="tel"
                      placeholder="8012345678"
                      value={form.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      className="flex-1 rounded-r-lg border border-[#3A3A3A] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30"
                    />
                  </div>
                </div>
              </section>

              {/* Delivery Selection */}
              <section className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1.4 4.2A2 2 0 008.3 14H16a2 2 0 001.9-1.4L19 8"
                    />
                  </svg>
                  Delivery Selection
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Digital */}
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      form.deliveryMethod === "digital"
                        ? "border-yellow-400 bg-yellow-400/5"
                        : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="digital"
                      checked={form.deliveryMethod === "digital"}
                      onChange={() => handleChange("deliveryMethod", "digital")}
                      className="mt-0.5 accent-yellow-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-yellow-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <p className="font-bold text-white">Digital Instant</p>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Delivered via Email/WhatsApp
                      </p>
                    </div>
                  </label>

                  {/* Home Delivery */}
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      form.deliveryMethod === "home"
                        ? "border-yellow-400 bg-yellow-400/5"
                        : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="home"
                      checked={form.deliveryMethod === "home"}
                      onChange={() => handleChange("deliveryMethod", "home")}
                      className="mt-0.5 accent-yellow-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <p className="font-bold text-white">Home Delivery</p>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Physical copy (2–5 business days)
                      </p>
                    </div>
                  </label>
                </div>
              </section>

              {/* Payment Method */}
              <section className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment Method
                </h2>

                {/* Paystack — only active option */}
                <div className="flex items-center justify-between rounded-xl border-2 border-yellow-400 bg-yellow-400/5 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-black" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Paystack</p>
                      <p className="text-xs text-gray-400">
                        Cards, USSD, Bank Transfer
                      </p>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  You will be redirected to Paystack&apos;s secure payment page
                  to complete your purchase.
                </p>
              </section>
            </div>

            {/* ── Order Summary (right column) ─────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-[#2A2A2A] bg-[#111111] p-6">
                <h2 className="mb-5 text-base font-black text-white">
                  Order Summary
                </h2>

                {/* Cart items */}
                <div className="mb-5 max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.gameId} className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-[#2A2A2A]">
                        <img
                          src={
                            item.game.coverImageUrl ||
                            "https://placehold.co/40x48/2a2a2a/555?text=G"
                          }
                          alt={item.game.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {item.game.title}
                        </p>
                        <span className="inline-block rounded bg-green-900/40 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                          IN STOCK
                        </span>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-yellow-400">
                        {formatNaira(item.game.priceNaira)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#2A2A2A] pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatNaira(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Transaction Fee</span>
                      <span>
                        {transactionFee === 0
                          ? "Free"
                          : formatNaira(transactionFee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#2A2A2A] pt-2 text-base font-black">
                      <span className="text-white">Total</span>
                      <span className="text-yellow-400">
                        {formatNaira(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 w-full rounded-xl bg-yellow-400 py-4 font-black uppercase tracking-widest text-black transition-all hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                      Processing...
                    </span>
                  ) : (
                    "Place Order →"
                  )}
                </button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secure Encrypted Payment
                </p>

                {/* Trust badges */}
                <div className="mt-4 flex justify-center gap-6 border-t border-[#2A2A2A] pt-4">
                  <div className="flex flex-col items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-500">
                      VERIFIED
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-500">
                      24/7 CARE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

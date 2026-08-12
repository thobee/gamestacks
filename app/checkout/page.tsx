// app/checkout/page.tsx
// Secure Checkout — Kinetic Noir design, Paystack payment

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { formatNaira } from "@/lib/utils";
import { useSession } from "next-auth/react";

type DeliveryMethod = "digital" | "home";

interface FormData {
  fullName: string;
  email: string;
  whatsapp: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  city: string;
  state: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
}

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }
  if (form.deliveryMethod === "home") {
    if (!form.address.trim()) errors.address = "Delivery address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
  }
  return errors;
}

/** Effective price: use salePrice when set and lower than priceNaira */
function effectiveItemPrice(item: any): number {
  const price = item.game?.priceNaira ?? 0;
  const sale = item.game?.salePrice;
  if (sale != null && sale > 0 && sale < price) return sale;
  return price;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { data: session, status: authStatus } = useSession();

  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    whatsapp: "",
    deliveryMethod: "digital",
    address: "",
    city: "",
    state: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const subtotal = items.reduce((total, item) => total + effectiveItemPrice(item), 0);
  const total = subtotal;

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Auth gate
    if (!session) {
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }

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
      const deliveryAddress = form.deliveryMethod === "home"
        ? `${form.address}, ${form.city}, ${form.state}, Nigeria`
        : undefined;

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({ gameId: item.gameId })),
          customerFullName: form.fullName.trim(),
          customerEmail: form.email.trim().toLowerCase(),
          customerWhatsapp: form.whatsapp.trim() || undefined,
          deliveryMethod: form.deliveryMethod,
          deliveryAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error?.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Clear cart AFTER we have the authorization URL to prevent data loss on failure
      clearCart();
      window.location.href = data.data.authorizationUrl;
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  // Empty cart — redirect to games
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center" style={{ paddingTop: 64 }}>
        <div className="text-center px-6">
          <div className="w-16 h-16 border-2 border-[#e5e5e5] flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-[#bbb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#111]">Your cart is empty</h2>
          <p className="mb-8 text-[#999] text-sm">Add some games before checking out.</p>
          <Link href="/games" className="inline-block bg-[#111] text-white px-8 py-3.5 font-bold text-sm hover:bg-neutral-800 transition-all active:scale-[0.98]">
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  // Auth prompt if not signed in
  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center" style={{ paddingTop: 64 }}>
        <div className="text-center px-6 max-w-sm">
          <div className="w-16 h-16 border-2 border-[#111] flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#111] mb-2">Sign in to checkout</h2>
          <p className="text-[#999] text-sm mb-8">You need an account to complete your purchase.</p>
          <Link href="/auth/login?callbackUrl=/checkout" className="block bg-[#111] text-white px-8 py-3.5 font-bold text-sm hover:bg-neutral-800 transition-all active:scale-[0.98]">
            Sign In
          </Link>
          <Link href="/auth/signup?callbackUrl=/checkout" className="block mt-3 border-2 border-[#111] text-[#111] px-8 py-3.5 font-bold text-sm hover:bg-[#111] hover:text-white transition-all active:scale-[0.98]">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full border border-[#e5e5e5] bg-[#f8f9fa] px-4 py-3 text-sm text-[#111] placeholder-[#ccc] outline-none transition-colors focus:border-[#111]";
  const errorInput = "border-red-400 bg-red-50";
  const labelCls = "block text-xs font-semibold text-[#777] mb-1.5";

  return (
    <div className="min-h-screen bg-white text-[#111]" style={{ paddingTop: 64 }}>

      {/* Nav bar override for checkout context */}
      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-bold tracking-tight">Gamestacks</Link>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#999]">
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Checkout</h1>
        <p className="text-sm text-[#999] mb-10">Complete your purchase below</p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

            {/* ── Left: Form ── */}
            <div className="space-y-6 lg:col-span-2">

              {serverError && (
                <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
                  {serverError}
                </div>
              )}

              {/* Customer info */}
              <section className="border border-[#e5e5e5] p-6">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#ebebeb]">
                  <span className="block w-0.5 h-3.5 bg-[#111] rounded-full" />
                  <h2 className="text-sm font-bold">Customer Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input type="text" placeholder="Your full name" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)}
                      className={`${inputCls} ${errors.fullName ? errorInput : ""}`} />
                    {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" placeholder="email@example.com" value={form.email} onChange={e => handleChange("email", e.target.value)}
                      className={`${inputCls} ${errors.email ? errorInput : ""}`} />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelCls}>WhatsApp Number <span className="text-[#ccc] font-normal">(optional)</span></label>
                  <div className="flex">
                    <span className="flex items-center border border-r-0 border-[#e5e5e5] bg-[#f0f0f0] px-3 text-sm text-[#888] font-bold">+234</span>
                    <input type="tel" placeholder="8012345678" value={form.whatsapp} onChange={e => handleChange("whatsapp", e.target.value)}
                      className={`flex-1 ${inputCls}`} />
                  </div>
                </div>
              </section>

              {/* Delivery method */}
              <section className="border border-[#e5e5e5] p-6">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#ebebeb]">
                  <span className="block w-0.5 h-3.5 bg-[#111] rounded-full" />
                  <h2 className="text-sm font-bold">Delivery Method</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { value: "digital", label: "Digital Instant", desc: "Via Email / WhatsApp" },
                    { value: "home",    label: "Home Delivery",   desc: "Physical (2–5 business days)" },
                  ].map(opt => (
                    <label key={opt.value}
                      className={`flex cursor-pointer items-start gap-3 border-2 p-4 transition-all ${
                        form.deliveryMethod === opt.value ? "border-[#111] bg-[#f8f9fa]" : "border-[#e5e5e5] hover:border-[#999]"
                      }`}
                    >
                      <input type="radio" name="delivery" value={opt.value}
                        checked={form.deliveryMethod === opt.value}
                        onChange={() => handleChange("deliveryMethod", opt.value)}
                        className="mt-0.5 accent-[#111]"
                      />
                      <div>
                        <p className="font-bold text-sm text-[#111]">{opt.label}</p>
                        <p className="mt-0.5 text-xs text-[#999]">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Address fields — visible only for home delivery */}
                {form.deliveryMethod === "home" && (
                  <div className="mt-5 space-y-4 border-t border-[#ebebeb] pt-5">
                    <p className="text-xs font-semibold text-[#bbb]">Delivery Address</p>
                    <div>
                      <label className={labelCls}>Street Address *</label>
                      <textarea rows={2} placeholder="Street address, house number..." value={form.address} onChange={e => handleChange("address", e.target.value)}
                        className={`${inputCls} resize-none ${errors.address ? errorInput : ""}`} />
                      {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>City *</label>
                        <input type="text" placeholder="City" value={form.city} onChange={e => handleChange("city", e.target.value)}
                          className={`${inputCls} ${errors.city ? errorInput : ""}`} />
                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>State *</label>
                        <input type="text" placeholder="State" value={form.state} onChange={e => handleChange("state", e.target.value)}
                          className={`${inputCls} ${errors.state ? errorInput : ""}`} />
                        {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Payment method */}
              <section className="border border-[#e5e5e5] p-6">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#ebebeb]">
                  <span className="block w-0.5 h-3.5 bg-[#111] rounded-full" />
                  <h2 className="text-sm font-bold">Payment Method</h2>
                </div>
                <div className="flex items-center justify-between border-2 border-[#111] bg-[#f8f9fa] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#111] bg-[#111]">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#111]">Paystack</p>
                      <p className="text-xs text-[#999]">Cards, USSD, Bank Transfer</p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="mt-3 text-[11px] text-[#bbb]">You&apos;ll be redirected to Paystack&apos;s secure page to complete payment.</p>
              </section>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border border-[#e5e5e5] p-6" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#ebebeb]">
                  <span className="block w-0.5 h-3.5 bg-[#111] rounded-full" />
                  <h2 className="text-sm font-bold">Order Summary</h2>
                </div>

                {/* Cart items */}
                <div className="mb-5 max-h-64 space-y-3 overflow-y-auto">
                  {items.map(item => {
                    const price = effectiveItemPrice(item);
                    const original = item.game?.priceNaira;
                    const hasDiscount = item.game?.salePrice != null && item.game.salePrice < original;
                    return (
                      <div key={item.gameId} className="flex items-center gap-3">
                        <div className="h-12 w-10 shrink-0 overflow-hidden border border-[#e5e5e5]">
                          <img
                            src={item.game.coverImageUrl || "https://placehold.co/40x48/f5f5f5/999?text=G"}
                            alt={item.game.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-[#111]">{item.game.title}</p>
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold border border-[#e5e5e5] text-[#999]">
                            In Stock
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-[#111]">{formatNaira(price)}</p>
                          {hasDiscount && (
                            <p className="text-xs text-[#bbb] line-through">{formatNaira(original)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#e5e5e5] pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#999]">
                    <span>Subtotal</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#999]">
                    <span>Transaction Fee</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between border-t border-[#e5e5e5] pt-3 text-base font-bold">
                    <span>Total</span>
                    <span>{formatNaira(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authStatus === "loading"}
                  className="mt-5 w-full bg-[#111] text-white py-4 font-bold text-sm transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processing...
                    </span>
                  ) : "Place Order →"}
                </button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#bbb] font-medium">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Encrypted Payment
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

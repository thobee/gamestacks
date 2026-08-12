// app/cart/page.tsx
// Cart page — review items before checkout

"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, getTotalPrice, getItemCount } = useCart();

  const total = getTotalPrice();
  const count = getItemCount();

  if (count === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <p className="mb-2 text-6xl">🛒</p>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Your cart is empty
          </h2>
          <p className="mb-6 text-gray-400">
            Browse our store and add games to get started.
          </p>
          <Link
            href="/games"
            className="rounded-full bg-yellow-400 px-8 py-3 font-bold text-sm text-black hover:bg-yellow-300 transition-colors"
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
            <Link href="/" className="text-xl font-bold text-yellow-400">
              Gamestacks
            </Link>
            <Link
              href="/games"
              className="text-sm text-gray-400 hover:text-yellow-400 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Your Cart</h1>
        <p className="mb-8 text-sm text-gray-400">
          {count} item{count !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.gameId}
                className="flex items-center gap-4 rounded-xl border border-[#2A2A2A] bg-[#111111] p-4"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#2A2A2A]">
                  <img
                    src={
                      item.game.coverImageUrl ||
                      "https://placehold.co/48x64/1a1a1a/555?text=G"
                    }
                    alt={item.game.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold text-white">
                    {item.game.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {item.game.category}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-yellow-400">
                    {formatNaira(item.game.priceNaira)}
                  </p>
                  <button
                    onClick={() => removeItem(item.gameId)}
                    className="mt-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-[#2A2A2A] bg-[#111111] p-6">
              <h2 className="mb-5 text-base font-bold text-white">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({count} items)</span>
                  <span>{formatNaira(total)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Transaction Fee</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between border-t border-[#2A2A2A] pt-3 text-base font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-yellow-400">{formatNaira(total)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-5 block w-full rounded-xl bg-yellow-400 py-4 text-center font-bold text-sm text-black hover:bg-yellow-300 transition-colors"
              >
                Proceed to Checkout →
              </Link>
              <p className="mt-3 text-center text-xs text-gray-500">
                Secure payment powered by Paystack
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { formatNaira } from "@/lib/utils";
import { UserDashboardLayout } from "@/components/UserDashboardNav";

interface OrderItem {
  id: string;
  game_id: string;
  game_title: string;
  price_at_purchase: number;
  cover_image_url: string | null;
}

interface Order {
  id: string;
  order_number: string;
  items_count: number;
  subtotal_naira: number;
  transaction_fee_naira: number;
  total_naira: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "completed" || s === "success" || s === "delivered") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 capitalize">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{status}
      </span>
    );
  }
  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 capitalize">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />{status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 capitalize">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{status}
    </span>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login?next=/orders"); return; }
    if (user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(data.data || []))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <UserDashboardLayout title="Order History" subtitle="Your purchases and receipts">
        <div className="flex items-center justify-center py-20">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (error) {
    return (
      <UserDashboardLayout title="Order History" subtitle="Your purchases and receipts">
        <div className="bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Something went wrong</p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-black transition-colors">
            Try Again
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout title="Order History" subtitle="Your purchases and receipts">
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">No orders yet</p>
          <p className="text-xs text-gray-400 mb-5 max-w-xs">
            You haven&apos;t made any purchases yet. Browse our store to get started.
          </p>
          <Link href="/games" className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-black transition-colors">
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">

              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-5">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Order No.</p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Date</p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{formatNaira(order.total_naira)}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="h-12 w-9 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      {item.cover_image_url ? (
                        <img src={item.cover_image_url} alt={item.game_title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.game_title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Digital Key & Download</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900 shrink-0">{formatNaira(item.price_at_purchase)}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-400">{order.items_count} {order.items_count === 1 ? "item" : "items"}</p>
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  View Details
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserDashboardLayout>
  );
}

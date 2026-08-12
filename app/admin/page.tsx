"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Gamepad2,
  TrendingUp,
  Plus,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

interface Analytics {
  orders: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
  };
  revenue: { total: number; avg: number };
  games: { total: number; published: number; draft: number };
  topGames: Array<{ id: string; title: string; sales: number }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    total_naira: number;
    status: string;
    customer_email: string;
    created_at: string;
  }>;
}

function statusDotClass(status: string) {
  const s = status.toLowerCase();
  if (s === "completed") return "bg-[#000]";
  if (s === "pending") return "bg-amber-500";
  if (s === "failed") return "bg-[#ba1a1a]";
  if (s === "refunded") return "bg-[#5e5e5e]";
  return "bg-[#cfc4c5]";
}

function statusTextClass(status: string) {
  const s = status.toLowerCase();
  if (s === "failed") return "text-[#ba1a1a]";
  if (s === "pending") return "text-amber-700";
  if (s === "refunded") return "text-[#5e5e5e]";
  return "text-[#191c1d]";
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error.message);
        else setAnalytics(json.data);
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 w-72 bg-[#e1e3e4]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-[#e1e3e4]" />
          ))}
        </div>
        <div className="h-80 bg-[#e1e3e4]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="noir-card p-6 border-[#ba1a1a]/30">
        <p className="font-bold text-sm text-[#ba1a1a]">Analytics Error</p>
        <p className="mt-1 text-sm text-[#5e5e5e]">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  const quarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
  const year = new Date().getFullYear();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-[#000] leading-none mb-2">
            Dashboard
          </h1>
          <p className="font-label-mono text-[#5e5e5e] uppercase tracking-widest">
            Administrative Control Center / {year}.{quarter}
          </p>
        </div>
        <Link
          href="/admin/games"
          className="noir-btn-primary px-12 py-6 inline-flex items-center gap-2 no-underline uppercase tracking-wide text-xs"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Metric cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Revenue"
          value={formatNaira(analytics.revenue.total)}
          detail={`${analytics.orders.completed} completed orders`}
          icon={DollarSign}
        />
        <MetricCard
          label="Pending Orders"
          value={String(analytics.orders.pending)}
          detail={`${analytics.orders.total} total orders`}
          icon={ShoppingCart}
          muted
        />
        <MetricCard
          label="Published Games"
          value={String(analytics.games.published)}
          detail={`${analytics.games.draft} drafts · ${analytics.games.total} total`}
          icon={Gamepad2}
        />
      </section>

      {/* Secondary metrics + top games */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="noir-card overflow-hidden">
          <div className="p-6 border-b border-[#cfc4c5]">
            <h2 className="text-xl font-bold text-[#000] tracking-tight">
              Order Status
            </h2>
            <p className="text-sm text-[#4c4546] mt-1">
              Breakdown of marketplace order states
            </p>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(analytics.orders)
              .filter(([key]) => key !== "total")
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-24">
                    <span
                      className={`w-2 h-2 rounded-full ${statusDotClass(status)}`}
                    />
                    <span className="font-label-mono text-[#191c1d] capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex-1 h-2 bg-[#edeeef] overflow-hidden">
                    <div
                      className="h-full bg-[#000] transition-all"
                      style={{
                        width:
                          analytics.orders.total > 0
                            ? `${((count as number) / analytics.orders.total) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="font-label-mono text-[#191c1d] w-8 text-right tabular-nums">
                    {count as number}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="noir-card overflow-hidden">
          <div className="p-6 border-b border-[#cfc4c5] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#000] tracking-tight">
                Top Games
              </h2>
              <p className="text-sm text-[#4c4546] mt-1">
                Best sellers by units sold
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#000]" />
          </div>
          <div className="p-6">
            {analytics.topGames.length === 0 ? (
              <p className="text-sm text-[#5e5e5e]">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topGames.map((game, i) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between py-2 border-b border-[#e1e3e4] last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-label-mono text-[#5e5e5e] w-5">
                        {i + 1}.
                      </span>
                      <span className="text-sm font-bold text-[#191c1d] truncate">
                        {game.title}
                      </span>
                    </div>
                    <span className="font-label-mono text-[#191c1d] whitespace-nowrap border border-[#cfc4c5] px-2 py-0.5 bg-[#f8f9fa]">
                      {game.sales} sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent orders table */}
      <section className="noir-card overflow-hidden">
        <div className="p-6 border-b border-[#cfc4c5] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#000] tracking-tight">
              Recent Orders
            </h2>
            <p className="text-sm text-[#4c4546] mt-1">
              Latest marketplace transactions
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="noir-btn-outline px-4 py-2 inline-flex items-center gap-1.5 no-underline text-xs uppercase"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {analytics.recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-[#5e5e5e]">No orders yet</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="noir-table-head">
                  <tr>
                    <th className="px-6 py-4 border-r border-white/10">Order</th>
                    <th className="px-6 py-4 border-r border-white/10">
                      Customer
                    </th>
                    <th className="px-6 py-4 border-r border-white/10">
                      Amount
                    </th>
                    <th className="px-6 py-4 border-r border-white/10">
                      Status
                    </th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cfc4c5]">
                  {analytics.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#f8f9fa] transition-colors"
                    >
                      <td className="px-6 py-4 font-label-mono text-[#000]">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4c4546] truncate max-w-48">
                        {order.customer_email}
                      </td>
                      <td className="px-6 py-4 font-label-mono text-[#191c1d]">
                        {formatNaira(order.total_naira)}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center gap-2 font-label-mono capitalize ${statusTextClass(order.status)}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusDotClass(order.status)}`}
                          />
                          {order.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-label-mono text-[#5e5e5e] whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-[#cfc4c5] bg-[#f3f4f5] flex justify-between items-center">
              <span className="font-label-mono text-[#5e5e5e] uppercase">
                Showing {analytics.recentOrders.length} recent orders
              </span>
              <Link
                href="/admin/orders"
                className="text-sm font-bold text-[#000] hover:opacity-60 no-underline"
              >
                Open orders →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Avg order value strip */}
      <div className="noir-card noir-card-lift p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-label-mono text-[#5e5e5e] uppercase tracking-tighter mb-1">
            Average Order Value
          </p>
          <p className="text-3xl font-bold tracking-tight text-[#000]">
            {formatNaira(analytics.revenue.avg)}
          </p>
        </div>
        <p className="text-sm text-[#4c4546] max-w-sm leading-relaxed">
          Per completed order across the marketplace. Keep an eye on pending
          and failed payments from the Orders panel.
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  muted = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  muted?: boolean;
}) {
  return (
    <div className="noir-card noir-card-lift p-6 flex flex-col justify-between h-48">
      <div className="flex justify-between items-start">
        <span className="font-label-mono text-[#5e5e5e] uppercase tracking-tighter">
          {label}
        </span>
        <Icon className="w-5 h-5 text-[#000]" strokeWidth={1.75} />
      </div>
      <div>
        <div className="text-3xl md:text-[2rem] font-bold text-[#000] tracking-tighter leading-none">
          {value}
        </div>
        <div
          className={`flex items-center gap-1.5 font-label-mono mt-2 ${
            muted ? "text-[#5e5e5e]" : "text-[#191c1d]"
          }`}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

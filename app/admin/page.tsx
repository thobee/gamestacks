"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Gamepad2,
  TrendingUp,
  LucideIcon
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

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400 bg-green-400/10 border border-green-500/10",
  pending: "text-yellow-400 bg-yellow-400/10 border border-yellow-500/10",
  failed: "text-red-400 bg-red-400/10 border border-red-500/10",
  refunded: "text-blue-400 bg-blue-400/10 border border-blue-500/10",
};

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
      <div className="p-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-neutral-200 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-neutral-200 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-5 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-bold text-sm uppercase tracking-wider">Analytics Error</p>
          <p className="mt-1 text-sm text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-neutral-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-xs font-semibold text-neutral-450 uppercase tracking-wider">
          System analytics and marketplace performance metrics
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={formatNaira(analytics.revenue.total)}
          sub="from completed orders"
          color="yellow"
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders"
          value={String(analytics.orders.total)}
          sub={`${analytics.orders.completed} completed`}
          color="green"
          icon={ShoppingCart}
        />
        <StatCard
          label="Published Games"
          value={String(analytics.games.published)}
          sub={`${analytics.games.draft} drafts`}
          color="blue"
          icon={Gamepad2}
        />
        <StatCard
          label="Avg Order Value"
          value={formatNaira(analytics.revenue.avg)}
          sub="per completed order"
          color="purple"
          icon={TrendingUp}
        />
      </div>

      {/* Order breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 tracking-tight">
            Order Status Breakdown
          </h2>
          <div className="space-y-4">
            {Object.entries(analytics.orders)
              .filter(([key]) => key !== "total")
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border capitalize ${STATUS_COLORS[status] || "text-neutral-500 bg-neutral-100 border border-neutral-200"}`}
                  >
                    {status}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-neutral-100 border border-neutral-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width:
                            analytics.orders.total > 0
                              ? `${((count as number) / analytics.orders.total) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="text-neutral-900 font-bold text-sm w-8 text-right font-mono">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 tracking-tight">
            Top 5 Games by Sales
          </h2>
          {analytics.topGames.length === 0 ? (
            <p className="text-neutral-400 text-sm">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.topGames.map((game, i) => (
                <div key={game.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-sm font-semibold w-5">{i + 1}.</span>
                    <span className="text-neutral-800 text-sm font-bold truncate max-w-[200px] md:max-w-[260px]">
                      {game.title}
                    </span>
                  </div>
                  <span className="text-blue-600 font-bold text-xs whitespace-nowrap bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-mono">
                    {game.sales} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition flex items-center gap-1"
          >
            <span>View all</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        {analytics.recentOrders.length === 0 ? (
          <p className="text-neutral-400 text-sm">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 bg-neutral-50/50 text-[10px] font-extrabold tracking-widest uppercase">
                  <th className="pb-3 text-left font-extrabold">Order #</th>
                  <th className="pb-3 text-left font-extrabold">Customer</th>
                  <th className="pb-3 text-left font-extrabold">Amount</th>
                  <th className="pb-3 text-left font-extrabold">Status</th>
                  <th className="pb-3 text-left font-extrabold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/40 transition-colors duration-150">
                    <td className="py-4 text-blue-600 font-mono font-bold">
                      {order.order_number}
                    </td>
                    <td className="py-4 text-neutral-600 font-semibold truncate max-w-40">
                      {order.customer_email}
                    </td>
                    <td className="py-4 text-neutral-900 font-extrabold font-mono text-sm">
                      {formatNaira(order.total_naira)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border capitalize ${STATUS_COLORS[order.status] || ""}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-neutral-450 font-semibold whitespace-nowrap">
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
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: "yellow" | "green" | "blue" | "purple";
  icon: LucideIcon;
}) {
  const borderColors = {
    yellow: "border-t-amber-500 hover:border-amber-500/30",
    green: "border-t-emerald-500 hover:border-emerald-500/30",
    blue: "border-t-blue-600 hover:border-blue-600/30",
    purple: "border-t-purple-600 hover:border-purple-600/30",
  };

  const textColors = {
    yellow: "text-amber-600",
    green: "text-emerald-700",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };

  const bgIconColors = {
    yellow: "bg-amber-50 text-amber-500",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className={`bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs transition duration-200 border-t-2 ${borderColors[color]} flex items-start justify-between`}>
      <div className="space-y-1">
        <p className="text-neutral-450 text-[10px] font-extrabold uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-extrabold tracking-tight font-mono ${textColors[color]}`}>{value}</p>
        <p className="text-neutral-450 text-xs font-bold pt-1">{sub}</p>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${bgIconColors[color]} shadow-2xs`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}



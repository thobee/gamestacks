"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  total_naira: number;
  status: string;
  customer_email: string;
  customer_whatsapp: string | null;
  delivery_method: string;
  items_count: number;
  created_at: string;
  order_items: Array<{ game_title: string; price_at_purchase: number }>;
}

const STATUS_OPTIONS = ["", "pending", "completed", "failed", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  pending: "bg-amber-50 text-amber-850 border border-amber-100",
  failed: "bg-red-50 text-red-700 border border-red-100",
  refunded: "bg-blue-50 text-blue-750 border border-blue-100",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const fetchOrders = async (page = 1, status = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (json.error) setError(json.error.message);
      else {
        setOrders(json.data || []);
        setPagination(json.pagination);
      }
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const json = await res.json();
      if (!json.error) {
        fetchOrders(pagination.page, statusFilter);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-neutral-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">Orders</h1>
        <p className="mt-2 text-xs font-semibold text-neutral-450 uppercase tracking-wider">
          Manage system invoices, check game delivery options, and update statuses
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs">
        <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mr-2">Filter Status:</span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-xs rounded-xl font-bold tracking-wide transition duration-150 border cursor-pointer capitalize ${
                statusFilter === s
                  ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {s || "All Orders"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 bg-neutral-50/50 text-[10px] font-extrabold tracking-widest uppercase">
                  <th className="px-6 py-4 text-left font-extrabold">Order #</th>
                  <th className="px-6 py-4 text-left font-extrabold">Customer</th>
                  <th className="px-6 py-4 text-left font-extrabold">Amount</th>
                  <th className="px-6 py-4 text-left font-extrabold">Delivery</th>
                  <th className="px-6 py-4 text-left font-extrabold">Status</th>
                  <th className="px-6 py-4 text-left font-extrabold">Date</th>
                  <th className="px-6 py-4 text-right font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50/40 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 font-mono font-bold hover:underline cursor-pointer"
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-semibold max-w-44 truncate">
                      {order.customer_email}
                    </td>
                    <td className="px-6 py-4 text-neutral-900 font-extrabold font-mono text-sm">
                      {formatNaira(order.total_naira)}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-bold capitalize">
                      {order.delivery_method}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border capitalize ${STATUS_COLORS[order.status] || "bg-neutral-100 text-neutral-500 border-neutral-200"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-450 font-semibold whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                        className="text-xs font-bold px-2.5 py-1.5 bg-white border border-neutral-250 text-neutral-800 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 cursor-pointer disabled:opacity-50 transition duration-150"
                      >
                        {["pending", "completed", "failed", "refunded"].map(
                          (s) => (
                            <option key={s} value={s} className="bg-white text-neutral-900">
                              {s}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-500 mt-6 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="font-bold text-xs uppercase tracking-wider text-neutral-450">{pagination.total} total orders</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1, statusFilter)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-white border border-neutral-200 text-neutral-900 text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-xs font-bold text-neutral-800 self-center">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchOrders(pagination.page + 1, statusFilter)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 bg-white border border-neutral-200 text-neutral-900 text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white border border-neutral-200 rounded-2xl w-full max-w-lg p-6 shadow-[0_24px_32px_-8px_rgba(0,0,0,0.06)] z-10 animate-scaleUp">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-bold text-neutral-900 font-mono flex items-center gap-2">
                <span className="text-neutral-500 font-semibold text-sm uppercase tracking-wider">Order:</span>
                <span className="text-blue-600">{selectedOrder.order_number}</span>
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-950 transition duration-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm mb-6">
              <Row label="Customer Email" value={selectedOrder.customer_email} />
              {selectedOrder.customer_whatsapp && (
                <Row label="WhatsApp Phone" value={selectedOrder.customer_whatsapp} />
              )}
              <Row label="Delivery Mode" value={<span className="capitalize">{selectedOrder.delivery_method}</span>} />
              <Row label="Items Count" value={String(selectedOrder.items_count)} />
              <Row
                label="Status Badge"
                value={
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border capitalize ${STATUS_COLORS[selectedOrder.status] || "bg-neutral-100 text-neutral-500 border-neutral-200"}`}
                  >
                    {selectedOrder.status}
                  </span>
                }
              />
              <Row
                label="Order Placed"
                value={new Date(selectedOrder.created_at).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
              <hr className="border-neutral-100 my-2" />
              <div className="flex justify-between items-center bg-blue-50 border border-blue-100/50 rounded-xl p-3 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Total Price paid</span>
                <span className="text-blue-600 text-lg font-extrabold font-mono">{formatNaira(selectedOrder.total_naira)}</span>
              </div>
            </div>

            {selectedOrder.order_items?.length > 0 && (
              <div className="mt-4 border-t border-neutral-100 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Purchased items</p>
                <div className="space-y-2.5 max-h-32 overflow-y-auto pr-1">
                  {selectedOrder.order_items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-neutral-50 last:border-0">
                      <span className="text-neutral-700 font-bold truncate max-w-[240px]">{item.game_title}</span>
                      <span className="text-neutral-900 font-extrabold font-mono text-sm whitespace-nowrap">
                        {formatNaira(item.price_at_purchase)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-neutral-450 font-bold text-[10px] uppercase tracking-wider">{label}</span>
      <span className="text-neutral-800 font-semibold text-right max-w-64 truncate">{value}</span>
    </div>
  );
}



"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";
import { AdminPageHeader } from "@/components/AdminPageHeader";

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
    <div className="space-y-8">
      <AdminPageHeader
        title="Orders"
        subtitle="Manage invoices, delivery, and order statuses"
      />

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 noir-card p-4">
        <span className="font-label-mono text-[#5e5e5e] uppercase tracking-widest mr-2">
          Filter Status
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition duration-150 border cursor-pointer ${
                statusFilter === s
                  ? "bg-[#000] border-[#000] text-white"
                  : "noir-btn-outline"
              }`}
            >
              {s || "All Orders"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 noir-card border-[#ba1a1a]/30 text-[#ba1a1a] text-sm font-semibold flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="noir-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#cfc4c5] border-t-[#000]" />
            <span className="font-label-mono text-[#5e5e5e] uppercase">
              Loading orders...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[#5e5e5e]">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="noir-table-head">
                <tr>
                  <th className="px-6 py-4 text-left">Order #</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Delivery</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfc4c5]">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#f8f9fa] transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#000] font-label-mono font-bold hover:underline cursor-pointer"
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-[#5e5e5e] font-semibold max-w-44 truncate">
                      {order.customer_email}
                    </td>
                    <td className="px-6 py-4 text-[#000] font-extrabold font-label-mono text-sm">
                      {formatNaira(order.total_naira)}
                    </td>
                    <td className="px-6 py-4 text-[#5e5e5e] font-bold capitalize">
                      {order.delivery_method}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 font-label-mono capitalize ${statusTextClass(order.status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusDotClass(order.status)}`}
                        />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#5e5e5e] font-label-mono whitespace-nowrap">
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
                        className="text-xs font-bold px-2.5 py-1.5 bg-white border border-[#cfc4c5] text-[#191c1d] focus:outline-none focus:border-[#000] focus:ring-0 cursor-pointer disabled:opacity-50 transition duration-150"
                      >
                        {["pending", "completed", "failed", "refunded"].map(
                          (s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white text-neutral-900"
                            >
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
        <div className="flex items-center justify-between text-sm text-[#5e5e5e] noir-card p-4">
          <span className="font-label-mono text-[#5e5e5e] uppercase">
            {pagination.total} total orders
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1, statusFilter)}
              disabled={pagination.page <= 1}
              className="noir-btn-outline px-4 py-2 text-xs uppercase tracking-wide disabled:opacity-40 cursor-pointer"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 font-label-mono text-[#191c1d] self-center">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchOrders(pagination.page + 1, statusFilter)}
              disabled={pagination.page >= pagination.totalPages}
              className="noir-btn-outline px-4 py-2 text-xs uppercase tracking-wide disabled:opacity-40 cursor-pointer"
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
          <div className="relative noir-card rounded-none w-full max-w-lg p-6 z-10">
            <div className="flex justify-between items-center mb-6 border-b border-[#cfc4c5] pb-4">
              <h2 className="text-lg font-bold text-[#000] font-label-mono flex items-center gap-2">
                <span className="text-[#5e5e5e] font-semibold text-sm uppercase tracking-widest">
                  Order
                </span>
                <span className="text-[#000]">{selectedOrder.order_number}</span>
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 border border-[#cfc4c5] hover:bg-[#f8f9fa] text-[#5e5e5e] hover:text-[#000] transition duration-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm mb-6">
              <Row label="Customer Email" value={selectedOrder.customer_email} />
              {selectedOrder.customer_whatsapp && (
                <Row
                  label="WhatsApp Phone"
                  value={selectedOrder.customer_whatsapp}
                />
              )}
              <Row
                label="Delivery Mode"
                value={
                  <span className="capitalize">
                    {selectedOrder.delivery_method}
                  </span>
                }
              />
              <Row
                label="Items Count"
                value={String(selectedOrder.items_count)}
              />
              <Row
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center gap-2 font-label-mono capitalize ${statusTextClass(selectedOrder.status)}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusDotClass(selectedOrder.status)}`}
                    />
                    {selectedOrder.status}
                  </span>
                }
              />
              <Row
                label="Order Placed"
                value={new Date(selectedOrder.created_at).toLocaleString(
                  "en-NG",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              />
              <hr className="border-[#cfc4c5] my-2" />
              <div className="flex justify-between items-center border border-[#cfc4c5] bg-[#f8f9fa] p-3 mt-2">
                <span className="font-label-mono text-[#5e5e5e] uppercase tracking-widest">
                  Total Paid
                </span>
                <span className="text-[#000] text-lg font-extrabold font-label-mono">
                  {formatNaira(selectedOrder.total_naira)}
                </span>
              </div>
            </div>

            {selectedOrder.order_items?.length > 0 && (
              <div className="mt-4 border-t border-[#cfc4c5] pt-4">
                <p className="font-label-mono text-[#5e5e5e] uppercase tracking-widest mb-3">
                  Purchased Items
                </p>
                <div className="space-y-2.5 max-h-32 overflow-y-auto pr-1">
                  {selectedOrder.order_items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm py-1 border-b border-[#e1e3e4] last:border-0"
                    >
                      <span className="text-[#191c1d] font-bold truncate max-w-[240px]">
                        {item.game_title}
                      </span>
                      <span className="text-[#000] font-extrabold font-label-mono text-sm whitespace-nowrap">
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
      <span className="font-label-mono text-[#5e5e5e] uppercase tracking-widest">
        {label}
      </span>
      <span className="text-[#191c1d] font-semibold text-right max-w-64 truncate">
        {value}
      </span>
    </div>
  );
}

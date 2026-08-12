"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/AdminPageHeader";

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  isAdmin: boolean;
  name: string | null;
  user_metadata: { full_name?: string; role?: string };
  app_metadata: { role?: string };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error.message);
        else setUsers(json.data || []);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId: string, targetAdminState: boolean) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAdmin: targetAdminState }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || "Failed to update role");
      } else {
        // Update local state without full reload
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, isAdmin: targetAdminState } : u,
          ),
        );
      }
    } catch {
      setError("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const getAvatarInitials = (user: User) => {
    if (user.name) return user.name.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "US";
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Users"
        subtitle="Credentials, access logs, and administrator roles"
      />

      {error && (
        <div className="p-4 noir-card border-[#ba1a1a]/30 text-[#ba1a1a] text-sm font-semibold flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="noir-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#cfc4c5] border-t-[#000]" />
            <span className="font-label-mono text-[#5e5e5e] uppercase">
              Loading user accounts...
            </span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-[#5e5e5e]">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="noir-table-head">
                <tr>
                  <th className="px-6 py-4 text-left">User</th>
                  <th className="px-6 py-4 text-left">System Role</th>
                  <th className="px-6 py-4 text-left">Email Status</th>
                  <th className="px-6 py-4 text-left">Last Sign In</th>
                  <th className="px-6 py-4 text-left">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfc4c5]">
                {users.map((user) => {
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#f8f9fa] transition-colors duration-150 group"
                    >
                      {/* Avatar + Email Info */}
                      <td className="px-6 py-4.5 flex items-center gap-3">
                        <div className="h-9 w-9 bg-[#f8f9fa] border border-[#cfc4c5] flex items-center justify-center text-xs font-bold text-[#191c1d] select-none">
                          {getAvatarInitials(user)}
                        </div>
                        <div>
                          {user.name && (
                            <div className="text-[#000] font-bold text-sm tracking-tight">
                              {user.name}
                            </div>
                          )}
                          <div className="text-[#5e5e5e] text-xs font-semibold">
                            {user.email}
                          </div>
                        </div>
                      </td>

                      {/* Interactive Role Toggle */}
                      <td className="px-6 py-4.5">
                        <select
                          value={user.isAdmin ? "admin" : "user"}
                          disabled={updatingId === user.id}
                          onChange={(e) =>
                            handleRoleToggle(user.id, e.target.value === "admin")
                          }
                          className="text-xs font-bold px-2.5 py-1.5 bg-white border border-[#cfc4c5] text-[#191c1d] focus:outline-none focus:border-[#000] focus:ring-0 cursor-pointer disabled:opacity-50 transition duration-150"
                        >
                          <option
                            value="user"
                            className="bg-white text-neutral-900 font-semibold"
                          >
                            User
                          </option>
                          <option
                            value="admin"
                            className="bg-white text-neutral-900 font-semibold"
                          >
                            Administrator
                          </option>
                        </select>
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center gap-2 font-label-mono ${
                            user.email_confirmed_at || user.id
                              ? "text-[#191c1d]"
                              : "text-[#5e5e5e]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.email_confirmed_at || user.id
                                ? "bg-[#000]"
                                : "bg-[#5e5e5e]"
                            }`}
                          />
                          {user.email_confirmed_at || user.id
                            ? "Verified"
                            : "Unverified"}
                        </span>
                      </td>

                      {/* Last Login Logs */}
                      <td className="px-6 py-4.5 text-[#5e5e5e] font-label-mono whitespace-nowrap">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4.5 text-[#5e5e5e] font-label-mono whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

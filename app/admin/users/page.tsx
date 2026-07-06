"use client";

import { useEffect, useState } from "react";

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
        setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: targetAdminState } : u));
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
    <div className="p-8 space-y-8">
      <div className="border-b border-neutral-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">Users</h1>
        <p className="mt-2 text-xs font-semibold text-neutral-450 uppercase tracking-wider">
          Manage system credentials, view active user logs, and grant administrator access
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-neutral-550">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 bg-neutral-50/50 text-[10px] font-extrabold tracking-widest uppercase">
                  <th className="px-6 py-4 text-left font-extrabold">User</th>
                  <th className="px-6 py-4 text-left font-extrabold">System Role</th>
                  <th className="px-6 py-4 text-left font-extrabold">Email Status</th>
                  <th className="px-6 py-4 text-left font-extrabold">Last Sign In</th>
                  <th className="px-6 py-4 text-left font-extrabold">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => {
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-neutral-50/40 transition-colors duration-150 group"
                    >
                      {/* Avatar + Email Info */}
                      <td className="px-6 py-4.5 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-800 select-none shadow-2xs group-hover:scale-105 transition duration-150">
                          {getAvatarInitials(user)}
                        </div>
                        <div>
                          {user.name && (
                            <div className="text-neutral-900 font-bold text-sm tracking-tight">
                              {user.name}
                            </div>
                          )}
                          <div className="text-neutral-500 text-xs font-semibold">
                            {user.email}
                          </div>
                        </div>
                      </td>

                      {/* Interactive Role Toggle */}
                      <td className="px-6 py-4.5">
                        <select
                          value={user.isAdmin ? "admin" : "user"}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleToggle(user.id, e.target.value === "admin")}
                          className="text-xs font-bold px-2.5 py-1.5 bg-white border border-neutral-250 text-neutral-800 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 cursor-pointer disabled:opacity-50 transition duration-150"
                        >
                          <option value="user" className="bg-white text-neutral-900 font-semibold">User</option>
                          <option value="admin" className="bg-white text-blue-600 font-semibold">Administrator</option>
                        </select>
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                            user.email_confirmed_at || user.id ? "text-emerald-700" : "text-neutral-450"
                          }`}
                        >
                          {user.email_confirmed_at || user.id ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Verified</span>
                            </>
                          ) : (
                            <span>Unverified</span>
                          )}
                        </span>
                      </td>

                      {/* Last Login Logs */}
                      <td className="px-6 py-4.5 text-neutral-550 font-semibold text-xs whitespace-nowrap font-mono">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4.5 text-neutral-550 font-semibold text-xs whitespace-nowrap font-mono">
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


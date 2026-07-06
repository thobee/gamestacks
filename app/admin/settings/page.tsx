"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { validatePassword } from "@/lib/auth-utils";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?next=/admin/settings");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      setError(passwordCheck.error || "Password does not meet security requirements.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Failed to update password");
      }

      setSuccessMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading settings...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">Security Settings</h1>
        <p className="mt-2 text-xs font-semibold text-neutral-450 uppercase tracking-wider">
          Manage your account profile, credentials, and password rules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Bio */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xl font-extrabold shadow-2xs mb-4">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <h2 className="text-lg font-bold text-neutral-900">{user.name || "Administrator"}</h2>
            <p className="text-xs font-semibold text-neutral-450 mt-0.5">{user.email}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 border border-blue-100/50 text-blue-600 mt-4">
              System Admin
            </span>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest mb-3">Password Guidelines</h3>
            <ul className="text-xs text-neutral-500 space-y-2 list-disc list-inside">
              <li>Must be at least 8 characters long</li>
              <li>Include one uppercase letter</li>
              <li>Include at least one number</li>
              <li>Avoid reusing previous passwords</li>
            </ul>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Change Password</h3>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { validatePassword } from "@/lib/auth-utils";
import { AdminPageHeader } from "@/components/AdminPageHeader";

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
      setError(
        passwordCheck.error || "Password does not meet security requirements.",
      );
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
        throw new Error(
          data.error?.message || data.error || "Failed to update password",
        );
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
      <div className="p-12 text-center text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#cfc4c5] border-t-[#000]" />
        <span className="font-label-mono text-[#5e5e5e] uppercase">
          Loading settings...
        </span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        subtitle="Account profile, credentials, and password rules"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Bio */}
        <div className="lg:col-span-1 space-y-6">
          <div className="noir-card p-6 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-[#f8f9fa] border border-[#cfc4c5] text-[#000] flex items-center justify-center text-xl font-extrabold mb-4">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <h2 className="text-lg font-bold text-[#000]">
              {user.name || "Administrator"}
            </h2>
            <p className="font-label-mono text-[#5e5e5e] mt-0.5">{user.email}</p>
            <span className="inline-flex items-center gap-2 font-label-mono text-[#191c1d] mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#000]" />
              System Admin
            </span>
          </div>

          <div className="noir-card p-6">
            <h3 className="font-label-mono text-[#5e5e5e] uppercase tracking-widest mb-3">
              Password Guidelines
            </h3>
            <ul className="text-xs text-[#5e5e5e] space-y-2 list-disc list-inside">
              <li>Must be at least 8 characters long</li>
              <li>Include one uppercase letter</li>
              <li>Include at least one number</li>
              <li>Avoid reusing previous passwords</li>
            </ul>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-2">
          <div className="noir-card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#000] mb-6 tracking-tight">
              Change Password
            </h3>

            {error && (
              <div className="mb-6 p-4 border border-[#ba1a1a]/30 bg-white text-[#ba1a1a] text-sm font-semibold flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 border border-[#cfc4c5] bg-[#f8f9fa] text-[#191c1d] text-sm font-semibold flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#000] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-label-mono text-[#5e5e5e] uppercase tracking-widest mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0 transition"
                />
              </div>

              <div>
                <label className="block font-label-mono text-[#5e5e5e] uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0 transition"
                />
              </div>

              <div>
                <label className="block font-label-mono text-[#5e5e5e] uppercase tracking-widest mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0 transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="noir-btn-primary px-5 py-2.5 text-xs uppercase tracking-wide disabled:opacity-50 cursor-pointer"
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

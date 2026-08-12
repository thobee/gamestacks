"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { UserDashboardLayout } from "@/components/UserDashboardNav";
import { validatePassword } from "@/lib/auth-utils";

function PasswordField({
  id, label, value, onChange, disabled, helperText,
}: {
  id: string; label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean; helperText?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
          placeholder="••••••••"
          className="w-full px-3 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:bg-white focus:border-gray-900 focus:outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {helperText && <p className="mt-1 text-[10px] text-gray-400">{helperText}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login?next=/settings");
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields."); return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match."); return;
    }
    const check = validatePassword(newPassword);
    if (!check.isValid) {
      setError(check.error || "Password does not meet requirements."); return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || "Failed to update password");
      setSuccessMsg("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <UserDashboardLayout title="Settings" subtitle="Security and account preferences">
        <div className="flex items-center justify-center py-20">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout title="Settings" subtitle="Security and account preferences">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Change Password form — 3 cols */}
        <div className="lg:col-span-3">
          <div className="noir-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>
                <p className="text-[11px] text-gray-400">Keep your account secure</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-green-700">{successMsg}</p>
                </div>
              )}

              <PasswordField id="currentPassword" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={loading} />
              <PasswordField id="newPassword" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} helperText="Min. 8 chars, one uppercase, one number" />
              <PasswordField id="confirmPassword" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar — 2 cols */}
        <div className="lg:col-span-2 space-y-4">

          {/* Security tips */}
          <div className="noir-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-900">Password Requirements</h3>
            </div>
            <div className="p-4 space-y-2.5">
              {[
                "At least 8 characters long",
                "One uppercase letter (A–Z)",
                "At least one number (0–9)",
                "Avoid personal info or dates",
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                  <p className="text-[11px] text-gray-500">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div className="noir-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-900">Quick Links</h3>
            </div>
            <div className="p-2">
              {[
                { href: "/profile", label: "Edit Profile" },
                { href: "/orders", label: "Order History" },
                { href: "/wallet", label: "Manage Wallet" },
                { href: "/support", label: "Get Support" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                >
                  {label}
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}

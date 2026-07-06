"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, error: authError } = useAuthContext();
  const { success, error: toastError, warning } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      toastError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setEmailNotConfirmed(false);
      await signIn(email, password);
      success("Welcome back! Signed in successfully");
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (
        message.toLowerCase().includes("email not confirmed") ||
        message.toLowerCase().includes("not confirmed")
      ) {
        setEmailNotConfirmed(true);
        setError("");
        warning("Check your inbox for a confirmation email");
      } else {
        setError(message);
        toastError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white font-sans text-black">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 no-underline group">
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none" className="transition-transform group-hover:scale-105">
            <rect width="34" height="34" rx="9" fill="#111" />
            <rect x="5.5" y="13.5" width="5" height="7" rx="1.2" fill="white" />
            <rect x="14.5" y="13.5" width="5" height="7" rx="1.2" fill="white" />
            <rect x="8.5" y="10.5" width="7" height="5" rx="1.2" fill="white" />
            <rect x="8.5" y="18.5" width="7" height="5" rx="1.2" fill="white" />
            <circle cx="25.5" cy="13" r="2" fill="white" />
            <circle cx="28.5" cy="17" r="2" fill="white" />
            <circle cx="25.5" cy="21" r="2" fill="white" />
            <circle cx="22.5" cy="17" r="2" fill="white" />
          </svg>
          <span className="text-[18px] font-black tracking-[0.12em] text-[#111]">GAMESTACKS</span>
        </Link>

        {/* Header */}
        <h1 className="text-[28px] font-extrabold text-[#111] mb-1.5 tracking-tight">Welcome back</h1>
        <p className="text-sm text-neutral-500 mb-8">Sign in to your account to continue</p>

        {/* Email not confirmed */}
        {emailNotConfirmed && (
          <div className="px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-[13px] font-medium text-amber-800">
            <strong className="font-bold">📧 Email not confirmed</strong>
            <br />
            <span className="text-xs mt-1 inline-block">
              Check your inbox for a confirmation email and click the link before signing in.
            </span>
          </div>
        )}

        {/* Error */}
        {(error || authError) && (
          <div className="px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-[13px] font-semibold text-red-600 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4.5">
            <label htmlFor="login-email" className="block text-[13px] font-semibold text-neutral-800 mb-1.5 tracking-wide">Email Address</label>
            <div className="relative flex items-center">
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-3 text-sm font-medium text-[#111] bg-neutral-50 border-[1.5px] border-neutral-200 rounded-xl outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="login-password" className="block text-[13px] font-semibold text-neutral-800 mb-0 tracking-wide">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-neutral-400 hover:text-[#111] no-underline transition-colors duration-150"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-3.5 pr-11 py-3 text-sm font-medium text-[#111] bg-neutral-50 border-[1.5px] border-neutral-200 rounded-xl outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 flex items-center justify-center bg-transparent border-none cursor-pointer text-neutral-400 p-0.5 hover:text-neutral-600 transition-colors duration-150"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3.5 text-sm font-bold text-white bg-[#111] border-none rounded-xl mt-2 transition-all duration-150 tracking-wide flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-800 cursor-pointer active:scale-[0.98]'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs font-semibold text-neutral-400 tracking-wider whitespace-nowrap">New to Gamestacks?</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Create Account */}
        <Link href="/auth/signup" className="w-full p-3 text-sm font-semibold text-[#111] bg-white border-[1.5px] border-neutral-200 rounded-xl cursor-pointer transition-all duration-150 inline-flex items-center justify-center no-underline hover:bg-neutral-50 hover:border-neutral-300">
          Create Account
        </Link>

        {/* Trust badge */}
        <p className="text-center text-xs text-neutral-400 mt-8 font-medium">
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}

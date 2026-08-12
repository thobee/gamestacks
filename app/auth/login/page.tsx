"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <div className="min-h-screen bg-[#f5f6f8] text-[#111]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-[#e5e5e5] bg-[#111] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-16 -top-10 h-72 w-72 rounded-full bg-[#FDD835]/25 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

          <Link
            href="/"
            className="relative z-10 flex items-center gap-2.5 no-underline"
          >
            <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="9" fill="white" />
              <rect
                x="5.5"
                y="13.5"
                width="5"
                height="7"
                rx="1.2"
                fill="#111"
              />
              <rect
                x="14.5"
                y="13.5"
                width="5"
                height="7"
                rx="1.2"
                fill="#111"
              />
              <rect
                x="8.5"
                y="10.5"
                width="7"
                height="5"
                rx="1.2"
                fill="#111"
              />
              <rect
                x="8.5"
                y="18.5"
                width="7"
                height="5"
                rx="1.2"
                fill="#111"
              />
            </svg>
            <span className="text-sm font-bold tracking-tight">
              Gamestacks
            </span>
          </Link>

          <div className="relative z-10 max-w-md space-y-5">
            <p className="text-xs font-semibold text-white/60">
              Creator Economy
            </p>
            <h2 className="text-4xl font-bold leading-[1.02] tracking-tight">
              Back to your
              <br />
              games business
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Monitor sales, replies, and player activity from one account. Sign
              in to continue where you left off.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold text-white/60">
              Live signal
            </p>
            <p className="mt-1 text-sm text-white">
              Recent comment response rate is up 18% this week.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-[0_18px_45px_rgba(17,17,17,0.08)] sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-semibold text-[#999]">
                Welcome back
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111]">
                Sign in to continue
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Access your dashboard, orders, and game operations.
              </p>
            </div>

            {emailNotConfirmed && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                <strong className="font-bold">Email not confirmed.</strong>
                <p className="mt-1 text-xs">
                  Check your inbox for a confirmation link before signing in.
                </p>
              </div>
            )}

            {(error || authError) && (
              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-xs font-semibold text-[#777]"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-[#111] outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-[#777]"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] font-bold text-neutral-400 no-underline transition-colors hover:text-[#111]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-sm font-semibold text-[#111] outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0.5 text-neutral-400 transition-colors hover:text-neutral-600"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-1 flex w-full items-center justify-center rounded-xl bg-[#111] px-4 py-3.5 text-sm font-bold text-white transition-all ${loading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-neutral-800 active:scale-[0.98]"}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      className="animate-spin"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        strokeDasharray="32"
                        strokeDashoffset="12"
                      />
                    </svg>
                    Signing in
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="whitespace-nowrap text-xs font-medium text-neutral-400">
                New here?
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <Link
              href="/auth/signup"
              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-[#111] no-underline transition-all hover:border-neutral-300 hover:bg-neutral-50"
            >
              Create Account
            </Link>

            <p className="mt-6 text-center text-xs font-medium text-neutral-400">
              Your data is encrypted and secure.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

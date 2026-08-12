"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import { isValidEmail } from "@/lib/auth-utils";

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

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#16a34a"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function XSmallIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ccc"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
    </svg>
  );
}

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
];

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;

  return (
    <div className="mt-2.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
      <p className="text-xs font-semibold text-neutral-400 mb-2">
        Password requirements
      </p>
      <div className="flex flex-col gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              {passed ? <CheckIcon /> : <XSmallIcon />}
              <span
                className={`text-[12.5px] font-medium transition-colors duration-200 ${passed ? "text-green-600" : "text-neutral-400"}`}
              >
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signUp, error: authError } = useAuthContext();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allPasswordRulesPassed = useMemo(
    () => PASSWORD_RULES.every((rule) => rule.test(password)),
    [password],
  );

  const passwordsMatch = useMemo(
    () =>
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword,
    [password, confirmPassword],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      toastError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      toastError("Please enter a valid email address");
      return;
    }

    if (!allPasswordRulesPassed) {
      toastError("Password does not meet all requirements");
      return;
    }

    if (password !== confirmPassword) {
      toastError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, fullName);
      success("Account created! You can now sign in 🎉");
      router.push("/auth/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#111]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-[#e5e5e5] bg-[#111] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#FDD835]/20 blur-3xl" />

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
              Get started
            </p>
            <h2 className="text-4xl font-bold leading-[1.02] tracking-tight">
              Build your
              <br />
              player network
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Create your account to buy, review, and manage your digital and
              delivery orders in one place.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold text-white/60">
              Fast setup
            </p>
            <p className="mt-1 text-sm text-white">
              New users complete onboarding in under two minutes.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-[0_18px_45px_rgba(17,17,17,0.08)] sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-semibold text-[#999]">
                Create account
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111]">
                Join Gamestacks
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Start shopping and tracking your orders in one dashboard.
              </p>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-4.5">
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-1.5 block text-xs font-semibold text-[#777]"
                >
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-[#111] outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-1.5 block text-xs font-semibold text-[#777]"
                >
                  Email Address
                </label>
                <input
                  id="signup-email"
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
                <label
                  htmlFor="signup-password"
                  className="mb-1.5 block text-xs font-semibold text-[#777]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-sm font-semibold text-[#111] outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                    autoComplete="new-password"
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
                <PasswordRules password={password} />
              </div>

              <div>
                <label
                  htmlFor="signup-confirm"
                  className="mb-1.5 block text-xs font-semibold text-[#777]"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="........"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-sm font-semibold text-[#111] outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0.5 text-neutral-400 transition-colors hover:text-neutral-600"
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {passwordsMatch ? (
                      <>
                        <CheckIcon />
                        <span className="text-xs font-semibold text-green-600">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        <span className="text-xs font-semibold text-red-600">
                          Passwords do not match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-2 flex w-full items-center justify-center rounded-xl bg-[#111] px-4 py-3.5 text-sm font-bold text-white transition-all ${loading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-neutral-800 active:scale-[0.98]"}`}
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
                    Creating account
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="whitespace-nowrap text-xs font-medium text-neutral-400">
                Already have account?
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-[#111] no-underline transition-all hover:border-neutral-300 hover:bg-neutral-50"
            >
              Sign In
            </Link>

            <p className="mt-6 text-center text-xs font-medium leading-relaxed text-neutral-400">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="text-neutral-500 underline underline-offset-2 hover:text-neutral-700"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-neutral-500 underline underline-offset-2 hover:text-neutral-700"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

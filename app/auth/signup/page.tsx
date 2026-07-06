"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import { isValidEmail } from "@/lib/auth-utils";

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

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function XSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      <p className="text-[11px] font-bold text-neutral-400 tracking-[0.06em] mb-2 uppercase">
        Password requirements
      </p>
      <div className="flex flex-col gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              {passed ? <CheckIcon /> : <XSmallIcon />}
              <span className={`text-[12.5px] font-medium transition-colors duration-200 ${passed ? "text-green-600" : "text-neutral-400"}`}>
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
    () => password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
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
        <h1 className="text-[28px] font-extrabold text-[#111] mb-1.5 tracking-tight">Create your account</h1>
        <p className="text-sm text-neutral-500 mb-8">Join Gamestacks and start gaming</p>

        {/* Error */}
        {(error || authError) && (
          <div className="px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-[13px] font-semibold text-red-600 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4.5">
            <label htmlFor="signup-name" className="block text-[13px] font-semibold text-neutral-800 mb-1.5 tracking-wide">Full Name</label>
            <div className="relative flex items-center">
              <input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-3 text-sm font-medium text-[#111] bg-neutral-50 border-[1.5px] border-neutral-200 rounded-xl outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4.5">
            <label htmlFor="signup-email" className="block text-[13px] font-semibold text-neutral-800 mb-1.5 tracking-wide">Email Address</label>
            <div className="relative flex items-center">
              <input
                id="signup-email"
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
          <div className="mb-4.5">
            <label htmlFor="signup-password" className="block text-[13px] font-semibold text-neutral-800 mb-1.5 tracking-wide">Password</label>
            <div className="relative flex items-center">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-3.5 pr-11 py-3 text-sm font-medium text-[#111] bg-neutral-50 border-[1.5px] border-neutral-200 rounded-xl outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                autoComplete="new-password"
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

            {/* Password rules — show as user types */}
            <PasswordRules password={password} />
          </div>

          {/* Confirm Password */}
          <div className="mb-1.5">
            <label htmlFor="signup-confirm" className="block text-[13px] font-semibold text-neutral-800 mb-1.5 tracking-wide">Confirm Password</label>
            <div className="relative flex items-center">
              <input
                id="signup-confirm"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-3.5 pr-11 py-3 text-sm font-medium text-[#111] bg-neutral-50 border-[1.5px] border-neutral-200 rounded-xl outline-none transition-all duration-150 focus:border-[#111] focus:ring-[3px] focus:ring-black/5"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 flex items-center justify-center bg-transparent border-none cursor-pointer text-neutral-400 p-0.5 hover:text-neutral-600 transition-colors duration-150"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {passwordsMatch ? (
                  <>
                    <CheckIcon />
                    <span className="text-xs font-semibold text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span className="text-xs font-semibold text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3.5 text-sm font-bold text-white bg-[#111] border-none rounded-xl mt-6 transition-all duration-150 tracking-wide flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-800 cursor-pointer active:scale-[0.98]'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                Creating account…
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs font-semibold text-neutral-400 tracking-wider whitespace-nowrap">Already have an account?</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Sign In */}
        <Link href="/auth/login" className="w-full p-3 text-sm font-semibold text-[#111] bg-white border-[1.5px] border-neutral-200 rounded-xl cursor-pointer transition-all duration-150 inline-flex items-center justify-center no-underline hover:bg-neutral-50 hover:border-neutral-300">
          Sign In
        </Link>

        {/* Terms */}
        <p className="text-center text-xs text-neutral-400 mt-6 font-medium leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-neutral-500 underline underline-offset-2 hover:text-neutral-700">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-neutral-500 underline underline-offset-2 hover:text-neutral-700">Privacy Policy</Link>
        </p>

        {/* Trust badge */}
        <p className="text-center text-xs text-neutral-400 mt-5 font-medium">
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}

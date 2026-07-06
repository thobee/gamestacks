"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

/* ─── Types ───────────────────────────────────────────────── */

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Hook ────────────────────────────────────────────────── */

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/* ─── Icons ───────────────────────────────────────────────── */

const icons: Record<ToastVariant, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const borderColors: Record<ToastVariant, string> = {
  success: "border-l-green-600",
  error: "border-l-red-600",
  info: "border-l-blue-600",
  warning: "border-l-amber-600",
};

/* ─── Single toast item ───────────────────────────────────── */

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 320);
    }, toast.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.duration, onRemove]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 320);
  };

  return (
    <div
      role="alert"
      onClick={dismiss}
      className={`flex items-center gap-3 px-4.5 py-3.5 bg-white border border-neutral-200/60 border-l-[3.5px] ${borderColors[toast.variant]} rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.04)] cursor-pointer w-full max-w-[400px] pointer-events-auto ${
        exiting ? "animate-[toastSlideOut_0.32s_cubic-bezier(0.22,1,0.36,1)_forwards]" : "animate-[toastSlideIn_0.32s_cubic-bezier(0.22,1,0.36,1)_both]"
      }`}
    >
      <div className="shrink-0 flex">{icons[toast.variant]}</div>
      <p className="flex-1 m-0 text-[13.5px] font-semibold text-neutral-900 leading-snug font-sans">
        {toast.message}
      </p>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="shrink-0 text-neutral-400 opacity-50 transition-opacity hover:opacity-100"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </div>
  );
}

/* ─── Provider ────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      <style>{`
        @keyframes toastSlideIn {
          from { opacity:0; transform:translateX(100%) scale(0.95); }
          to   { opacity:1; transform:translateX(0)    scale(1); }
        }
        @keyframes toastSlideOut {
          from { opacity:1; transform:translateX(0)    scale(1); }
          to   { opacity:0; transform:translateX(100%) scale(0.95); }
        }
      `}</style>

      {/* Toast container — top right */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

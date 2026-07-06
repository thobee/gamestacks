// components/Input.tsx
// Reusable text input component

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  className?: string;
}

export function Input({ label, helperText, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-150 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-zinc-500">{helperText}</p>
      )}
    </div>
  );
}

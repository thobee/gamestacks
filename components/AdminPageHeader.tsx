import Link from "next/link";
import React from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    href?: string;
    label: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
}

/** Shared Kinetic Noir page header for admin subpages */
export function AdminPageHeader({
  title,
  subtitle,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#000] leading-none mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="font-label-mono text-[#5e5e5e] uppercase tracking-widest">
            {subtitle}
          </p>
        )}
      </div>
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="noir-btn-primary px-8 py-4 inline-flex items-center gap-2 no-underline uppercase tracking-wide text-xs"
          >
            {action.icon}
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="noir-btn-primary px-8 py-4 inline-flex items-center gap-2 uppercase tracking-wide text-xs cursor-pointer"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
    </div>
  );
}

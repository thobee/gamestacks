"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { signOut } from "next-auth/react";

const navLinks = [
  {
    href: "/profile",
    label: "Profile",
    description: "Personal information",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "Orders",
    description: "Purchases & receipts",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    href: "/library",
    label: "Library",
    description: "Keys & downloads",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h10"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Security & password",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 01-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function UserDashboardLayout({
  children,
  title,
  subtitle,
}: UserDashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-10 md:py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0">
            <div className="sticky top-24 flex flex-col gap-4">
              <div className="noir-card p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-[#000] flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold tracking-tight">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#191c1d] truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-[#5e5e5e] truncate mt-0.5">
                      {user?.email || ""}
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#000]" />
                      <span className="font-label-mono text-[#5e5e5e] uppercase">
                        Active
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <nav className="noir-card overflow-hidden">
                <p className="px-4 pt-4 pb-2 font-label-mono text-[#5e5e5e] uppercase">
                  Account
                </p>
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 mx-2 mb-1 transition-all no-underline group ${
                        isActive
                          ? "bg-[#000] text-white"
                          : "text-[#4c4546] hover:bg-[#edeeef] hover:text-[#000]"
                      }`}
                    >
                      <span
                        className={`shrink-0 ${isActive ? "text-white" : "text-[#5e5e5e] group-hover:text-[#000]"}`}
                      >
                        {link.icon}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold ${isActive ? "text-white" : "text-[#191c1d]"}`}
                        >
                          {link.label}
                        </p>
                        <p
                          className={`text-xs leading-tight ${isActive ? "text-white/50" : "text-[#5e5e5e]"}`}
                        >
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
                <div className="px-2 pb-2 mt-1 border-t border-[#e1e3e4] pt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#5e5e5e] hover:text-[#ba1a1a] hover:bg-red-50 transition-all group bg-transparent border-none cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </nav>

              <div className="bg-[#000] p-5 text-white architectural-shadow">
                <p className="font-label-mono text-white/40 uppercase mb-1">
                  Support
                </p>
                <p className="text-sm font-bold mb-1">Need help?</p>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Our team is available around the clock.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#000] bg-[#FDD835] hover:bg-yellow-400 px-3.5 py-2 transition-colors no-underline"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </aside>

          {/* Mobile tabs */}
          <div className="lg:hidden w-full mb-2" style={{ position: "relative" }}>
            <nav className="flex noir-card overflow-hidden">
              {navLinks.map((link, i) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 text-xs font-semibold transition-colors no-underline ${
                      i !== navLinks.length - 1
                        ? "border-r border-[#e1e3e4]"
                        : ""
                    } ${isActive ? "bg-[#000] text-white" : "text-[#5e5e5e] hover:bg-[#edeeef]"}`}
                  >
                    <span className={isActive ? "text-white" : "text-[#5e5e5e]"}>
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#000] leading-none mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="font-label-mono text-[#5e5e5e] uppercase tracking-widest">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function UserDashboardNav() {
  return null;
}

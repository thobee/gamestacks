"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { signOut } from "next-auth/react";

const navLinks = [
  {
    href: "/profile",
    label: "Profile",
    description: "Personal information",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "Order History",
    description: "Purchases & receipts",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Security & password",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface UserDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function UserDashboardLayout({ children, title, subtitle }: UserDashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-7">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0">
            <div className="sticky top-10 flex flex-col gap-3">

              {/* User card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white text-lg font-bold tracking-tight">{getInitials(user?.name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email || ""}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] text-green-600 font-medium">Active</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Account</p>
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3.5 px-4 py-3.5 mx-2 mb-1 rounded-xl transition-all group ${
                        isActive
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-700"}`}>
                        {link.icon}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-800"}`}>
                          {link.label}
                        </p>
                        <p className={`text-[11px] leading-tight ${isActive ? "text-white/60" : "text-gray-400"}`}>
                          {link.description}
                        </p>
                      </div>
                      {isActive && (
                        <svg className="w-4 h-4 ml-auto shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
                <div className="px-2 pb-2 mt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </nav>

              {/* Help card */}
              <div className="bg-black rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-1">Need help?</p>
                <p className="text-xs text-white/50 mb-3 leading-relaxed">Our support team is here for you anytime.</p>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-lg transition-colors"
                >
                  Contact Support
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Mobile Tab Bar ── */}
          <div className="lg:hidden w-full mb-5">
            <nav className="flex bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-4 text-xs font-semibold transition-colors ${
                      i !== navLinks.length - 1 ? "border-r border-gray-100" : ""
                    } ${isActive ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    <span className={isActive ? "text-white" : "text-gray-400"}>{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// Backwards compat shim
export function UserDashboardNav() {
  return null;
}

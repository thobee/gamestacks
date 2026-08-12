"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Gamepad2,
  ShoppingBag,
  Users as UsersIcon,
  Settings as SettingsIcon,
  ArrowLeft,
  Bell,
  LayoutList,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/games", label: "Inventory", icon: Gamepad2 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/homepage-sections", label: "Homepage", icon: LayoutList },
  { href: "/admin/notifications", label: "Notifications", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuthContext();

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userRef = useRef<HTMLDivElement>(null);
  const REFRESH_MS = 10000;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      if (signOut) await signOut();
      setIsUserOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user || user?.isAdmin !== true) {
      router.replace("/auth/login?next=/admin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user?.isAdmin !== true) return;

    const refreshUnread = () => {
      fetch("/api/admin/comments/notifications")
        .then((r) => r.json())
        .then((json) => {
          setUnreadCount(json?.data?.unreadCount || 0);
        })
        .catch(() => {
          setUnreadCount(0);
        });
    };

    refreshUnread();

    const interval = window.setInterval(refreshUnread, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshUnread();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname, user]);

  if (loading || !user || user?.isAdmin !== true) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#e1e3e4] border-t-black animate-spin" />
      </div>
    );
  }

  const getAvatarInitials = () => {
    if (user.name) return user.name.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "AD";
  };

  const sectionLabel =
    pathname === "/admin"
      ? "Dashboard"
      : pathname.split("/").pop()?.replace(/-/g, " ") || "Admin";

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-5 border-b border-white/10">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2.5 group no-underline"
        >
          <div className="h-8 w-8 bg-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 34 34" fill="none">
              <rect x="5.5" y="13.5" width="5" height="7" rx="1.2" fill="#111" />
              <rect x="14.5" y="13.5" width="5" height="7" rx="1.2" fill="#111" />
              <rect x="8.5" y="10.5" width="7" height="5" rx="1.2" fill="#111" />
              <rect x="8.5" y="18.5" width="7" height="5" rx="1.2" fill="#111" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-tight">
              Gamestacks
            </div>
            <div className="font-label-mono text-white/40 uppercase">
              Admin Panel
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 mt-2 overflow-y-auto">
        <p className="px-3 pt-2 pb-2 font-label-mono text-white/30 uppercase">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const IconComponent = item.icon;
          const showBadge =
            item.href === "/admin/notifications" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all no-underline ${
                isActive
                  ? "bg-white text-[#111]"
                  : "text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className={`min-w-5 h-5 px-1.5 text-[10px] leading-5 font-bold text-center ${
                    isActive
                      ? "bg-[#111] text-white"
                      : "bg-[#FDD835] text-[#111]"
                  }`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/40 hover:bg-white/10 hover:text-white transition-all no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-[#f8f9fa] flex text-[#191c1d] overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-60 bg-[#111] flex-col z-20 shrink-0 h-full overflow-hidden">
        <SidebarNav />
      </aside>

      {/* ── Mobile drawer ── */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#111] flex flex-col h-full z-10">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-3 p-1.5 text-white/60 hover:text-white bg-transparent border-none cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="sticky top-0 h-14 bg-white border-b border-[#cfc4c5] px-4 md:px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 text-[#4c4546] hover:text-black bg-transparent border-none cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="font-label-mono text-[#5e5e5e] uppercase hidden sm:block">
                Administration Panel
              </p>
              <p className="text-sm font-bold text-[#111] capitalize leading-tight">
                {sectionLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/notifications")}
              className="p-2 text-[#5e5e5e] hover:bg-[#edeeef] hover:text-[#111] transition relative cursor-pointer border-none bg-transparent"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-1 bg-[#FDD835] text-[10px] leading-3.5 text-[#111] font-bold text-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="w-px h-5 bg-[#e1e3e4]" />

            <div className="relative" ref={userRef}>
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-2.5 focus:outline-none cursor-pointer group bg-transparent border-none"
              >
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-[#111]">
                    {user.name || "Admin"}
                  </div>
                  <div className="font-label-mono text-[#5e5e5e] truncate max-w-40">
                    {user.email}
                  </div>
                </div>
                <div className="h-8 w-8 bg-[#111] text-white flex items-center justify-center text-xs font-bold">
                  {getAvatarInitials()}
                </div>
              </button>

              {isUserOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border border-[#cfc4c5] p-1.5 z-50"
                  style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.05)" }}
                >
                  <p className="px-3 py-2 font-label-mono text-[#5e5e5e] border-b border-[#e1e3e4] mb-1">
                    Admin Profile
                  </p>
                  {[
                    { href: "/admin", label: "Dashboard" },
                    { href: "/admin/orders", label: "Orders" },
                    { href: "/admin/settings", label: "Settings" },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setIsUserOpen(false)}
                      className="block px-3 py-2 text-sm font-semibold text-[#555] hover:bg-[#edeeef] hover:text-[#111] no-underline transition"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <hr className="my-1 border-[#e1e3e4]" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-[#ba1a1a] hover:bg-red-50 transition cursor-pointer bg-transparent border-none"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="p-6 md:p-8 max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

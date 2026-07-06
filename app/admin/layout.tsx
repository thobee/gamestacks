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
  Shield,
  Bell,
  LayoutList,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/games", label: "Catalog", icon: Gamepad2 },
  { href: "/admin/homepage-sections", label: "Homepage", icon: LayoutList },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
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
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut();
      }
      setIsUserOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  useEffect(() => {
    if (loading) return;
    const isAdmin = user?.isAdmin === true;
    if (!user || !isAdmin) {
      router.replace("/auth/login?next=/admin");
    }
  }, [user, loading, router]);

  const isAdmin = user?.isAdmin === true;

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getAvatarInitials = () => {
    if (user.name) return user.name.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "AD";
  };

  return (
    <div className="h-screen bg-[#fafafa] flex text-neutral-900 font-sans overflow-hidden">
      {/* Sidebar - Sleek Dark Theme */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-900 flex flex-col z-20 shrink-0 h-full overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-900">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition duration-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-extrabold text-sm tracking-wider uppercase group-hover:text-blue-400 transition duration-250">
                Gamestacks
              </div>
              <div className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">Admin Portal</div>
            </div>
          </Link>
        </div>

        {/* Navigation - Left Sidebar Tabs */}
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                }`}
              >
                <IconComponent className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to store link */}
        <div className="p-4 border-t border-neutral-900">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-neutral-400 hover:bg-neutral-900/60 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 h-16 bg-white border-b border-neutral-200/80 px-8 flex items-center justify-between z-10 shrink-0">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            {pathname === "/admin" ? "Overview Dashboard" : pathname.split("/").pop()}
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 rounded-xl text-neutral-455 hover:bg-neutral-50 hover:text-neutral-900 transition duration-150 relative cursor-pointer">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            </button>
            
            <div className="w-px h-6 bg-neutral-200" />
            
            {/* User Profile Info with Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-3 focus:outline-none cursor-pointer group"
              >
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-bold text-neutral-800 group-hover:text-blue-600 transition">{user.name || "Admin User"}</div>
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{user.email}</div>
                </div>
                <div className="h-8 w-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-750 hover:bg-neutral-200 hover:text-neutral-900 transition duration-200">
                  {getAvatarInitials()}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-md">
                  <div className="px-4 py-2 border-b border-neutral-900 mb-1">
                    <p className="text-[9px] font-bold text-neutral-550 uppercase tracking-wider">Admin Profile</p>
                    <p className="text-xs font-bold text-neutral-350 truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <Link
                    href="/admin"
                    onClick={() => setIsUserOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-400 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition duration-150"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsUserOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-400 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition duration-150"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsUserOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-400 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition duration-150"
                  >
                    Security Settings
                  </Link>

                  <hr className="my-1.5 border-neutral-900" />
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-600 hover:text-white rounded-lg font-bold transition duration-150 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}



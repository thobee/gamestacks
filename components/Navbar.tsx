"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { useCart } from "@/hooks/useCart";
import { Search, X, Loader2 } from "lucide-react";
import { NAVBAR_GENRES, NAVBAR_STORE_CATEGORIES } from "@/lib/catalog";

const NAV_LINKS = [
  { label: "Deals", href: "/games?collection=weekend-deals" },
  { label: "New Releases", href: "/games?collection=new-releases" },
];

const GENRES = NAVBAR_GENRES;
const STORE_CATEGORIES = NAVBAR_STORE_CATEGORIES;

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuthContext();
  const { getItemCount } = useCart();

  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const itemCount = getItemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsGenreOpen(false);
        setIsStoreOpen(false);
        setIsUserOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 40);
    else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/games/search?query=${encodeURIComponent(searchQuery)}`,
        );
        const json = await res.json();
        setSearchResults(Array.isArray(json) ? json : []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node))
        setIsGenreOpen(false);
      if (storeRef.current && !storeRef.current.contains(e.target as Node))
        setIsStoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setIsUserOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserOpen(false);
      setIsMobileOpen(false);
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        .nav-pill {
          border: 1px solid transparent;
          border-radius: 9999px;
          padding: 6px 12px;
          transition: all 0.15s ease;
        }
      `}</style>

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
            : "bg-white/90 backdrop-blur-md border-b border-black/8"
        }`}
      >
        <div className="max-w-360 mx-auto px-4 md:px-16">
          <div className="flex items-center h-16 gap-8">
            {/* ── LOGO ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 group no-underline"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="34" height="34" rx="8" fill="#111111" />
                <rect
                  x="5.5"
                  y="13.5"
                  width="5"
                  height="7"
                  rx="1.2"
                  fill="white"
                />
                <rect
                  x="14.5"
                  y="13.5"
                  width="5"
                  height="7"
                  rx="1.2"
                  fill="white"
                />
                <rect
                  x="8.5"
                  y="10.5"
                  width="7"
                  height="5"
                  rx="1.2"
                  fill="white"
                />
                <rect
                  x="8.5"
                  y="18.5"
                  width="7"
                  height="5"
                  rx="1.2"
                  fill="white"
                />
                <circle cx="25.5" cy="13" r="2" fill="white" />
                <circle cx="28.5" cy="17" r="2" fill="white" />
                <circle cx="25.5" cy="21" r="2" fill="white" />
                <circle cx="22.5" cy="17" r="2" fill="white" />
              </svg>
              <span className="text-[15px] font-bold text-[#111] leading-none">
                Gamestacks
              </span>
            </Link>

            <div className="hidden w-px h-4 bg-black/10 md:block shrink-0" />

            {/* ── NAV LINKS ── */}
            <div className="hidden md:flex items-center gap-3 flex-1">
              {/* Store dropdown */}
              <div className="relative" ref={storeRef}>
                <button
                  onClick={() => {
                    setIsStoreOpen(!isStoreOpen);
                    setIsGenreOpen(false);
                  }}
                  className={`flex items-center gap-1.5 nav-pill text-sm font-semibold transition-colors bg-transparent cursor-pointer ${
                    pathname === "/games" && !isGenreOpen
                      ? "text-[#111] bg-black/6 border-black/12"
                      : "text-[#555] hover:text-[#111] hover:bg-black/4"
                  }`}
                >
                  <span>Store</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`transition-transform duration-200 mt-px ${isStoreOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M2 3.5L5 6.5L8 3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isStoreOpen && (
                  <div className="absolute top-[calc(100%+16px)] -left-3 w-56 z-50 animate-[slideDown_0.12s_ease_both]">
                    <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border border-black/10 border-r-0 border-b-0 rotate-45 z-0" />
                    <div className="bg-white border border-black/10 rounded-xl p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] relative z-10">
                      <p className="px-2.5 pt-2 pb-1 text-xs font-semibold text-[#bbb]">
                        Browse Store
                      </p>
                      <Link
                        href="/games"
                        onClick={() => setIsStoreOpen(false)}
                        className="flex items-center justify-between px-2.5 py-2 text-[13px] font-medium text-[#444] rounded-lg no-underline transition-colors hover:bg-black/4 hover:text-[#111]"
                      >
                        All Products
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className="opacity-20"
                        >
                          <path
                            d="M4.5 2.5L8 6L4.5 9.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <div className="h-px bg-black/8 my-1" />
                      {STORE_CATEGORIES.map((c) => (
                        <Link
                          key={c.name}
                          href={c.href}
                          onClick={() => setIsStoreOpen(false)}
                          className="flex flex-col px-2.5 py-2 rounded-lg no-underline transition-colors hover:bg-black/4 group"
                        >
                          <span className="text-[13px] font-semibold text-[#111] group-hover:text-[#111]">
                            {c.name}
                          </span>
                          <span className="text-[11px] text-[#999]">
                            {c.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative nav-pill text-sm font-semibold no-underline text-[#555] hover:text-[#111] hover:bg-black/4"
                >
                  {link.label}
                </Link>
              ))}

              {/* Genres dropdown */}
              <div className="relative" ref={genreRef}>
                <button
                  onClick={() => {
                    setIsGenreOpen(!isGenreOpen);
                    setIsStoreOpen(false);
                  }}
                  className="flex items-center gap-1.5 nav-pill text-sm font-semibold text-[#555] hover:text-[#111] hover:bg-black/4 transition-colors bg-transparent cursor-pointer"
                >
                  <span>Genres</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`transition-transform duration-200 mt-px ${isGenreOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M2 3.5L5 6.5L8 3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isGenreOpen && (
                  <div className="absolute top-[calc(100%+16px)] -left-3 w-50 z-50 animate-[slideDown_0.12s_ease_both]">
                    <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border border-black/10 border-r-0 border-b-0 rotate-45 z-0" />
                    <div className="bg-white border border-black/10 rounded-xl p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] relative z-10">
                      <p className="px-2.5 pt-2 pb-1 text-xs font-semibold text-[#bbb]">
                        Browse
                      </p>
                      {GENRES.map((g) => (
                        <Link
                          key={g.name}
                          href={g.href}
                          onClick={() => setIsGenreOpen(false)}
                          className="flex items-center justify-between px-2.5 py-2 text-[13px] font-medium text-[#444] rounded-lg no-underline transition-colors hover:bg-black/4 hover:text-[#111]"
                        >
                          {g.name}
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            className="opacity-20"
                          >
                            <path
                              d="M4.5 2.5L8 6L4.5 9.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT ACTIONS ── */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/4 border border-black/8 rounded-lg cursor-pointer transition-all hover:bg-black/7 hover:border-black/14 group"
              >
                <Search className="w-3.5 h-3.5 text-[#888]" />
                <span className="text-xs text-[#888] font-medium group-hover:text-[#555]">
                  Search collection…
                </span>
                <kbd className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded border border-black/10 bg-black/4 text-[10px] font-bold text-[#999] font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#555] hover:bg-black/6 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#555] hover:text-[#111] hover:bg-black/6 transition-colors"
              >
                <svg
                  width="17"
                  height="17"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {mounted && itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-3.5 h-3.5 px-0.75 rounded-full bg-[#111] text-white text-[10px] font-semibold flex items-center justify-center shadow-[0_0_0_2px_white]">
                    {itemCount}
                  </span>
                )}
              </Link>

              <div className="w-px h-4 bg-black/8 mx-1" />

              {/* User auth */}
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-black/6 animate-pulse" />
              ) : user ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className={`w-8 h-8 rounded-full bg-[#111] text-white font-bold text-xs cursor-pointer transition-all border-2 ${isUserOpen ? "border-black scale-105" : "border-transparent hover:scale-105"}`}
                  >
                    {getUserInitial()}
                  </button>

                  {isUserOpen && (
                    <div className="absolute top-[calc(100%+14px)] right-0 w-55 z-50 animate-[slideDown_0.12s_ease_both]">
                      <div className="absolute -top-1.5 right-3 w-3 h-3 bg-white border border-black/10 border-r-0 border-b-0 rotate-45 z-0" />
                      <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] relative z-10">
                        <div className="px-4 pt-3.5 pb-3 border-b border-black/8 bg-black/3 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#111] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {getUserInitial()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#bbb]">
                              Signed in
                            </p>
                            <p className="text-xs font-semibold text-[#111] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="p-1.5">
                          {[
                            { href: "/profile", label: "Profile Dashboard" },
                            { href: "/orders", label: "My Orders" },
                            { href: "/settings", label: "Settings" },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsUserOpen(false)}
                              className="block px-2.5 py-2 text-[13px] font-medium text-[#444] rounded-lg no-underline transition-colors hover:bg-black/4 hover:text-[#111]"
                            >
                              {item.label}
                            </Link>
                          ))}
                          {user.isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserOpen(false)}
                              className="flex items-center justify-between px-2.5 py-2 text-[13px] font-semibold text-[#111] rounded-lg no-underline transition-colors hover:bg-black/4"
                            >
                              Admin Panel
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/8 text-[#666]">
                                Admin
                              </span>
                            </Link>
                          )}
                          <div className="h-px bg-black/8 my-1.5" />
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-2.5 py-2 text-[13px] font-semibold text-red-600 rounded-lg bg-transparent transition-colors hover:bg-red-50 cursor-pointer"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-1.5 text-sm font-bold text-white bg-[#111] rounded-lg transition-all hover:bg-black active:scale-95 border-2 border-[#111]"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#555] hover:bg-black/6 transition-colors ml-1"
              >
                {isMobileOpen ? (
                  <X className="w-4.5 h-4.5" />
                ) : (
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h9"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {isMobileOpen && (
          <div className="md:hidden bg-white border-t border-black/8 px-4 pt-4 pb-6 animate-[slideDown_0.12s_ease_both]">
            <div className="space-y-1 mb-4">
              <p className="text-xs font-semibold text-[#bbb] mb-2 px-1">
                Store
              </p>
              <Link
                href="/games"
                onClick={() => setIsMobileOpen(false)}
                className="block px-3 py-2.5 text-[14px] font-semibold text-[#444] rounded-lg no-underline hover:bg-black/4 hover:text-[#111] transition-colors"
              >
                All Products
              </Link>
              {STORE_CATEGORIES.map((c) => (
                <Link
                  key={c.name}
                  href={c.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-3 py-2.5 text-[14px] font-semibold text-[#444] rounded-lg no-underline hover:bg-black/4 hover:text-[#111] transition-colors"
                >
                  {c.name}
                  <span className="ml-2 text-[11px] font-medium text-[#999]">
                    {c.description}
                  </span>
                </Link>
              ))}
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-3 py-2.5 text-[14px] font-semibold text-[#444] rounded-lg no-underline hover:bg-black/4 hover:text-[#111] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-black/8 pt-4">
              <p className="text-xs font-semibold text-[#bbb] mb-2 px-1">
                Browse by Genre
              </p>
              <div className="grid grid-cols-2 gap-1">
                {GENRES.map((g) => (
                  <Link
                    key={g.name}
                    href={g.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="block px-3 py-2 text-[13px] font-medium text-[#444] rounded-lg bg-black/4 hover:bg-black/8 no-underline transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
            {user && (
              <div className="border-t border-black/8 pt-4 mt-4">
                <p className="text-xs font-semibold text-[#bbb] mb-2 px-1">
                  Account
                </p>
                {[
                  { href: "/profile", label: "Profile Dashboard" },
                  { href: "/orders", label: "My Orders" },
                  { href: "/settings", label: "Settings" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-[#444] rounded-lg no-underline hover:bg-black/4 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-red-600 bg-transparent cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── SEARCH MODAL ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[6px] animate-[fadeIn_0.18s_ease_both]"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative z-10 w-full max-w-125 bg-white border border-black/10 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.18)] overflow-hidden animate-[modalIn_0.12s_ease_both]">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/8">
              <Search className="w-4 h-4 text-[#aaa] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, genres, platforms…"
                className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-[#111] placeholder-[#bbb] caret-[#111]"
              />
              <div className="flex items-center gap-2">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#bbb] animate-spin" />
                ) : (
                  <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-black/10 bg-black/4 text-[10px] font-bold text-[#bbb] font-mono">
                    ESC
                  </kbd>
                )}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-center w-6 h-6 rounded-lg bg-black/5 text-[#999] hover:bg-black/10 hover:text-[#111] transition-colors cursor-pointer border-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="max-h-90 overflow-y-auto p-2">
              {!searchQuery && (
                <div className="py-10 px-4 text-center">
                  <p className="text-[13px] font-semibold text-[#888]">
                    Search the full catalog
                  </p>
                  <p className="text-[11px] text-[#ccc] mt-1">
                    Games · Genres · Platforms
                  </p>
                </div>
              )}
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="py-10 px-4 text-center">
                  <p className="text-[13px] font-semibold text-[#888]">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-[11px] text-[#ccc] mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
              {searchResults.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline transition-colors hover:bg-black/4 group"
                >
                  <img
                    src={game.imageUrl || "/placeholder-game.png"}
                    alt={game.title}
                    className="w-9 h-11 object-cover rounded-lg shrink-0 border border-black/8"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#111] truncate group-hover:text-black">
                      {game.title}
                    </p>
                    <p className="text-[11px] font-medium text-[#aaa] mt-0.5 capitalize">
                      {game.category}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-[#111] font-mono shrink-0 pl-2">
                    {game.priceNaira
                      ? `₦${game.priceNaira.toLocaleString()}`
                      : "Free"}
                  </span>
                </Link>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-black/8 bg-black/2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#ccc]">
                {searchResults.length > 0
                  ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                  : "Gamestacks"}
              </span>
              <div className="flex items-center gap-1">
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-black/10 bg-black/4 text-[10px] font-bold text-[#ccc] font-mono">
                  ↑↓
                </kbd>
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-black/10 bg-black/4 text-[10px] font-bold text-[#ccc] font-mono">
                  ↵
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

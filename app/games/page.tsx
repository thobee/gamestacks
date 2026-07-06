// app/games/page.tsx
// Games listing page — GAMEHUBNG store layout (nav, sidebar filters, product grid, pagination, footer)

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGames, useCategories } from "@/hooks/useGames";
import { useCart } from "@/hooks/useCart";
import { formatNaira } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "rating", label: "Most Popular" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

// Presentational only for now — hardware-spec filtering (GPU/RAM/CPU) isn't in useGames'
// query params yet, though the fields already exist on the game detail model
// (systemRequirementsGpu/Ram/Cpu). Wire these into useGames once the API supports it.
const VIDEO_MEMORY_OPTIONS = ["2GB", "4GB", "6GB", "8GB+"];
const SYSTEM_MEMORY_OPTIONS = ["4GB Standard", "8GB Performance", "16GB Ultra"];
const PROCESSOR_OPTIONS = ["Core i3", "Core i5", "Core i7"];

const GENRE_ICONS: Record<string, string> = {
  action: "⚡",
  "role-playing": "🗡️",
  rpg: "🗡️",
  "sports & racing": "🏁",
  sports: "🏁",
  racing: "🏁",
  strategy: "🎯",
  "open world": "🌐",
};

function getCategoryValue(cat: any): string {
  if (typeof cat === "string") return cat;
  return cat?.slug ?? cat?.name ?? String(cat);
}
function getCategoryLabel(cat: any): string {
  if (typeof cat === "string") return cat;
  return cat?.name ?? cat?.slug ?? String(cat);
}
function getGenreIcon(label: string): string {
  return GENRE_ICONS[label.toLowerCase()] ?? "•";
}

// Normalizes a game record regardless of camelCase / snake_case field naming,
// mirroring the pattern already used on the game detail page.
function normalizeGame(g: any) {
  const cover = g.coverImageUrl ?? g.cover_image_url ?? null;
  const price = g.salePrice ?? g.sale_price ?? g.priceNaira ?? g.price_naira ?? 0;
  const original = (g.salePrice ?? g.sale_price) ? (g.priceNaira ?? g.price_naira) : null;
  const discountPct = original ? Math.round(((original - price) / original) * 100) : 0;
  const itemType = g.itemType ?? g.item_type ?? "game";
  const isPreOrder = itemType === "pre-order" || g.isPreOrder === true;
  const deliveryLabel = g.deliveryType ?? (itemType === "game" ? "PC Offline" : null);

  const badges: string[] = [];
  if (isPreOrder) badges.push("PRE-ORDER");
  else if (discountPct > 0 || g.isHot) badges.push("HOT");
  if (deliveryLabel) badges.push(deliveryLabel.toUpperCase());

  const genreLabel: string = Array.isArray(g.genres) && g.genres.length > 0
    ? g.genres.join(" / ")
    : (g.category ?? "");

  return {
    id: g.id,
    slug: g.slug,
    title: g.title,
    cover,
    price,
    original,
    badges,
    genreLabel,
    isPreOrder,
  };
}

function GamesContent() {
  const searchParams = useSearchParams();
  const cartApi = useCart() as any;
  const addItem = cartApi.addItem;
  const cartCount = cartApi.items?.length ?? cartApi.itemCount ?? 0;

  const [sortBy, setSortBy] = useState("rating");
  const [page, setPage] = useState(1);
  const search = searchParams.get("search") || undefined;

  const { games, loading, error, pagination } = useGames({
    search,
    sortBy,
    page,
    limit: 20,
  });

  const getPageRange = (): (number | "ellipsis")[] => {
    const total = pagination.totalPages;
    const current = page;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const range: (number | "ellipsis")[] = [1, 2, 3];
    if (current > 4) range.push("ellipsis");
    range.push(total);
    return range;
  };

  const pad2 = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-white text-black">


      <main className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="w-full">



          {/* ── Content ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight leading-none">LIBRARY</h1>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  {pagination.total.toLocaleString()} Premium Titles / Windows PC
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="appearance-none cursor-pointer border border-neutral-200 rounded-md py-2 pl-3.5 pr-8 text-[11px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>


            </div>

            {/* Error */}
            {error && (
              <div className="mb-8 rounded-md border border-red-200 bg-red-50 p-5 text-red-700">
                <p className="font-extrabold text-sm uppercase tracking-wider text-red-600">Error Loading Games</p>
                <p className="mt-1 text-sm text-neutral-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-wide px-4 py-2 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading skeleton grid */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-neutral-100 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-9 w-full bg-neutral-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && games.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center border border-dashed border-neutral-200 rounded-md py-24 px-6">
                <span className="text-4xl mb-3">🔍</span>
                <p className="text-base font-bold text-neutral-800 mb-1">No games match your search</p>
                <p className="text-sm text-neutral-400">Try a different genre or search term.</p>
              </div>
            )}

            {/* Product grid */}
            {!loading && games.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {games.map((raw: any) => {
                  const g = normalizeGame(raw);
                  return (
                    <div key={g.id} className="group">
                      <Link href={`/games/${g.slug}`} className="block relative aspect-[3/4] rounded overflow-hidden bg-neutral-50 border border-neutral-100 mb-3.5">
                        {g.cover ? (
                          <img src={g.cover} alt={g.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">🎮</div>
                        )}
                        {g.badges.length > 0 && (
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                            {g.badges.map((b) => (
                              <span key={b} className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm w-fit">
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>

                      <Link href={`/games/${g.slug}`}>
                        <h3 className="text-[13px] font-black uppercase leading-snug mb-1 line-clamp-2 hover:underline underline-offset-2">
                          {g.title}
                        </h3>
                      </Link>
                      {g.genreLabel && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                          {g.genreLabel}
                        </p>
                      )}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-[15px] font-black">{formatNaira(g.price)}</span>
                        {g.original && (
                          <span className="text-[12px] text-neutral-400 line-through font-medium">{formatNaira(g.original)}</span>
                        )}
                      </div>

                      {g.isPreOrder ? (
                        <button className="w-full py-2.5 border border-black text-black text-[10.5px] font-black uppercase tracking-widest rounded hover:bg-black hover:text-white transition">
                          Reserve Copy
                        </button>
                      ) : (
                        <button
                          onClick={() => addItem(raw)}
                          className="w-full py-2.5 bg-black text-white text-[10.5px] font-black uppercase tracking-widest rounded hover:bg-neutral-800 transition"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-40 disabled:hover:border-neutral-200 transition"
                  aria-label="Previous page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-4">
                  {getPageRange().map((item, i) =>
                    item === "ellipsis" ? (
                      <span key={`e-${i}`} className="text-neutral-300 text-sm select-none">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`text-[13px] font-bold transition ${
                          item === page
                            ? "text-black underline underline-offset-4 decoration-2"
                            : "text-neutral-400 hover:text-neutral-700"
                        }`}
                      >
                        {pad2(item)}
                      </button>
                    ),
                  )}
                </div>

                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 disabled:opacity-40 transition"
                  aria-label="Next page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>



      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-10">
        <div>
          <p className="text-base font-black tracking-tight mb-4">
            GAMEHUB<span className="text-neutral-400">NG</span>
          </p>
          <p className="text-[13px] text-neutral-500 leading-relaxed max-w-xs">
            Nigeria's premier destination for high-performance PC gaming. We curate the best titles with optimized hardware profiles for a seamless experience.
          </p>
          <div className="flex items-center gap-3 mt-5 text-neutral-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.6} /><path strokeWidth={1.6} d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z" /></svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.6} /><path strokeWidth={1.6} d="M8 12h8M12 8v8" /></svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.6} /><path strokeWidth={1.6} d="M10 9l5 3-5 3V9z" /></svg>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4">Shop</p>
          <ul className="space-y-2.5 text-[13px] text-neutral-500">
            <li><Link href="/games" className="hover:text-black transition">All Games</Link></li>
            <li><Link href="/games?sortBy=newest" className="hover:text-black transition">New Releases</Link></li>
            <li><Link href="/games?sortBy=rating" className="hover:text-black transition">Best Sellers</Link></li>
            <li><Link href="/hardware-tools" className="hover:text-black transition">Hardware Tools</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4">Service</p>
          <ul className="space-y-2.5 text-[13px] text-neutral-500">
            <li><Link href="/help" className="hover:text-black transition">Help Center</Link></li>
            <li><Link href="/refund-policy" className="hover:text-black transition">Refund Policy</Link></li>
            <li><Link href="/contact" className="hover:text-black transition">Contact Us</Link></li>
            <li><Link href="/legal" className="hover:text-black transition">Legal</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4">Insights</p>
          <p className="text-[13px] text-neutral-500 mb-4 max-w-xs">
            Join the elite for early access to discounts and pre-order alerts.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center border border-neutral-200 rounded-md overflow-hidden max-w-xs"
          >
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="flex-1 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wide placeholder:text-neutral-400 focus:outline-none"
            />
            <button type="submit" className="bg-black text-white px-3.5 py-2.5" aria-label="Subscribe">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-neutral-100">
        <div className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-neutral-400 uppercase tracking-widest">
            © {new Date().getFullYear()} GAMEHUBNG. Premium Gaming Experience.
          </p>
          <div className="flex items-center gap-3 text-neutral-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.6} d="M12 3v18M5 8l7-5 7 5M5 8v10M19 8v10" /></svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.6} d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" /></svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.6} /><path strokeWidth={1.6} d="M9 12l2 2 4-4" /></svg>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GamesLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[70px] border-b border-neutral-200" />
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="w-full">
          <div className="h-10 w-56 bg-neutral-100 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-neutral-100 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<GamesLoadingSkeleton />}>
      <GamesContent />
    </Suspense>
  );
}
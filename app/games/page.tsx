// app/games/page.tsx
// Games listing page — sidebar filters + product grid

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGames } from "@/hooks/useGames";
import { useCart } from "@/hooks/useCart";
import { GameCard } from "@/components/GameCard";
import { STOREFRONT_GENRE_LIST } from "@/lib/catalog";
import { Footer } from "@/components/Footer";

/* ── Constants ─────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "rating",       label: "Most Popular" },
  { value: "newest",       label: "Newest Arrivals" },
  { value: "price",        label: "Price: Low to High" },
  { value: "best-sellers", label: "Best Sellers" },
];

const GENRE_LIST = STOREFRONT_GENRE_LIST;

const PRICE_PRESETS = [
  { label: "Under ₦5,000",  min: 0,     max: 5000  },
  { label: "₦5k – ₦15k",   min: 5000,  max: 15000 },
  { label: "₦15k – ₦30k",  min: 15000, max: 30000 },
  { label: "Above ₦30k",   min: 30000, max: 999999 },
];

/** Navbar store categories that show a simple grid with no sidebar filters */
const FILTERS_HIDDEN_CATEGORIES = new Set([
  "PlayStation",
  "Gamepads",
  "Accessories",
]);

function shouldShowStoreFilters(category: string | null): boolean {
  // Filters only for PC (and general browse). Hide for hardware/console store sections.
  if (!category) return true;
  if (category === "PC") return true;
  return !FILTERS_HIDDEN_CATEGORIES.has(category);
}

/* ── Helpers ────────────────────────────────────────────────────── */
/** Normalize raw API output → a Game-compatible shape safe for GameCard */
function toGameShape(g: any) {
  const priceNaira  = Number(g.priceNaira ?? g.price_naira ?? 0);
  const salePrice   = g.salePrice != null ? Number(g.salePrice) :
                      g.sale_price != null ? Number(g.sale_price) : null;
  const discountPct = (salePrice != null && priceNaira > 0)
    ? Math.round(((priceNaira - salePrice) / priceNaira) * 100)
    : Number(g.discountPercentage ?? g.discount_percentage ?? 0);

  return {
    ...g,
    // ensure required numeric fields are never undefined
    priceNaira,
    salePrice,
    discountPercentage: discountPct,
    coverImageUrl: g.coverImageUrl ?? g.cover_image_url ?? null,
    genres: Array.isArray(g.genres) ? g.genres : [],
    category: g.category ?? "",
    slug: g.slug ?? "",
    title: g.title ?? "",
  };
}


/* ── Genre SVG icons ─────────────────────────────────────────────── */
const GENRE_ICONS: Record<string, React.ReactNode> = {
  "Action": (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <path d="M13.5 2.5L10 6l1.5 1.5L15 4l-1.5-1.5zM6 10L2.5 13.5 4 15l3.5-3.5L6 10zM8 1L1 8l2 2 7-7-2-2zM11 8l-2 2 2 2 2-2-2-2z"/>
    </svg>
  ),
  "Adventure": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4L8 2z"/>
    </svg>
  ),
  "Action RPG": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M8 2L10 6H14L11 9L12 13L8 11L4 13L5 9L2 6H6L8 2Z"/>
    </svg>
  ),
  "Role Playing": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M4 2h8v12H4V2zm2 2v2h4V4H6zm0 4v6h4V8H6z"/>
    </svg>
  ),
  "Shooter": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="8" cy="8" r="3"/><path d="M8 1v3M8 12v3M1 8h3M12 8h3"/>
    </svg>
  ),
  "Racing": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/>
      <path d="M2 8h12l-1.5-4H3.5L2 8z"/>
    </svg>
  ),
  "Sports": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="8" cy="8" r="6"/><path d="M5 5l6 6M11 5l-6 6"/>
    </svg>
  ),
  "Soccer": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="8" cy="8" r="6"/><path d="M8 2l2 4H6l2-4zm-4 6l2 2-1 4m8-6l-2 2 1 4M6 8h4"/>
    </svg>
  ),
  "Fighting": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M3 13L8 4l5 9H3z"/>
    </svg>
  ),
  "Horror": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M8 1L3 6v5l2 1 1-2 2 2 2-2 1 2 2-1V6L8 1z"/>
    </svg>
  ),
  "Open World": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2a10 10 0 010 12M8 2a10 10 0 000 12"/>
    </svg>
  ),
  "Simulation": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <rect x="2" y="6" width="12" height="8" rx="1"/><path d="M5 6V4a3 3 0 016 0v2"/>
      <circle cx="8" cy="10" r="1.5"/>
    </svg>
  ),
  "Arcade": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <rect x="3" y="2" width="10" height="12" rx="1"/><circle cx="6" cy="10" r="1"/><circle cx="10" cy="10" r="1"/><path d="M6 6h4"/>
    </svg>
  ),
  "Offline Multiplayer": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="5" cy="6" r="2"/><circle cx="11" cy="6" r="2"/><path d="M1 13c0-2 1.5-3 4-3s4 1 4 3M7 13c0-2 1.5-3 4-3s4 1 4 3"/>
    </svg>
  ),
  "First Person": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="1.5"/><path d="M8 3v2M8 11v2M3 8h2M11 8h2"/>
    </svg>
  ),
  "Third Person": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="8" cy="4" r="2"/><path d="M5 14v-4a3 3 0 016 0v4M4 8h8"/>
    </svg>
  ),
  "Cars": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M2 10l1.5-4h9L14 10H2z"/><circle cx="5" cy="11" r="1.5"/><circle cx="11" cy="11" r="1.5"/><path d="M2 10h12v2H2z"/>
    </svg>
  ),
  "Driving": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2"/>
    </svg>
  ),
  "Stealth": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="1.5"/><path d="M3 3l10 10"/>
    </svg>
  ),
};

/* ── Sidebar ─────────────────────────────────────────────────────── */
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="block w-0.5 h-3 bg-[#111] rounded-full shrink-0" />
      <h3 className="text-xs font-semibold text-[#111]">{label}</h3>
    </div>
  );
}

function Sidebar({
  selectedGenre,
  selectedPricePreset,
  onGenre,
  onPricePreset,
  onClearAll,
}: {
  selectedGenre: string | null;
  selectedPricePreset: number | null;
  onGenre: (v: string | null) => void;
  onPricePreset: (index: number | null) => void;
  onClearAll: () => void;
}) {
  const hasFilters = selectedGenre || selectedPricePreset !== null;

  return (
    <aside className="hidden lg:block w-52 shrink-0 pt-10 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto pb-10 pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#111 transparent" }}>
      <div className="space-y-6">

        {/* Clear all */}
        {hasFilters && (
          <button
            onClick={onClearAll}
            className="w-full flex items-center gap-1.5 text-xs font-semibold text-[#888] hover:text-[#111] transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
              <path d="M12 4L4 12M4 4l8 8"/>
            </svg>
            Clear all filters
          </button>
        )}

        {/* ── Price Range (TOP) ─────────────── */}
        <section>
          <SectionHeader label="Price Range" />
          <div className="grid grid-cols-2 gap-1.5">
            {PRICE_PRESETS.map(({ label }, i) => {
              const active = selectedPricePreset === i;
              return (
                <button
                  key={i}
                  onClick={() => onPricePreset(active ? null : i)}
                  className={`px-2 py-1.5 text-[10px] font-semibold border transition-all duration-150 text-center ${
                    active
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#888] border-[#e0e0e0] hover:border-[#111] hover:text-[#111]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-[#ebebeb]" />

        {/* ── Genre ────────────────────────── */}
        <section>
          <SectionHeader label="Genre" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {GENRE_LIST.map(({ label }) => {
              const active = selectedGenre === label;
              const Icon = GENRE_ICONS[label];
              return (
                <button
                  key={label}
                  onClick={() => onGenre(active ? null : label)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all duration-200 group relative select-none rounded-full text-[10px] font-medium ${
                    active
                      ? "bg-[#FDD835] text-[#111] border-[#111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] translate-y-0"
                      : "bg-[#fcfcfc] text-[#666] border-[#ebebeb] hover:border-[#111] hover:text-[#111] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]"
                  }`}
                >
                  <span className={`shrink-0 transition-transform duration-200 [&>svg]:w-3.5 [&>svg]:h-3.5 group-hover:scale-110 ${
                    active ? "text-[#111]" : "text-[#999] group-hover:text-[#111]"
                  }`}>
                    {Icon}
                  </span>
                  <span>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </aside>
  );
}


/* ── Mobile filter bar ────────────────────────────────────────────── */
function MobileFilterBar({
  selectedGenre, selectedPricePreset,
  onGenre, onPricePreset, onClearAll,
}: {
  selectedGenre: string | null; selectedPricePreset: number | null;
  onGenre: (v: string | null) => void;
  onPricePreset: (i: number | null) => void; onClearAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasFilters = selectedGenre || selectedPricePreset !== null;

  return (
    <div className="lg:hidden mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 border border-[#111] px-4 py-2 text-xs font-bold transition-colors hover:bg-[#111] hover:text-white"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6M12 16h0" />
          </svg>
          Filters {hasFilters && `(active)`}
        </button>
        {hasFilters && (
          <button onClick={onClearAll} className="text-xs font-semibold text-[#888] hover:text-[#111] underline">
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 border border-[#e5e5e5] p-5 space-y-6 bg-white">
          <div>
            <p className="text-xs font-semibold mb-3 text-[#111]">Genre</p>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_LIST.map(({ label }) => {
                const active = selectedGenre === label;
                const Icon = GENRE_ICONS[label];
                return (
                  <button
                    key={label}
                    onClick={() => onGenre(active ? null : label)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all duration-150 rounded-full select-none text-[10px] font-medium ${
                      active
                        ? "bg-[#FDD835] text-[#111] border-[#111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]"
                        : "bg-[#fcfcfc] text-[#555] border-[#ebebeb] hover:border-[#111] hover:text-[#111]"
                    }`}
                  >
                    <span className={`shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 ${active ? "text-[#111]" : "text-[#999]"}`}>
                      {Icon}
                    </span>
                    <span>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-3 text-[#111]">Price Range</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map(({ label }, i) => (
                <button key={i} onClick={() => onPricePreset(selectedPricePreset === i ? null : i)}
                  className={`px-3 py-1.5 text-[11px] font-bold border transition-colors ${selectedPricePreset === i ? "bg-[#111] text-white border-[#111]" : "border-[#ddd] text-[#666] hover:border-[#111]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main content ─────────────────────────────────────────────────── */
function GamesContent() {
  const searchParams = useSearchParams();
  const cartApi = useCart() as any;
  const addItem = cartApi.addItem;

  const [sortBy, setSortBy]                   = useState("rating");
  const [page, setPage]                       = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") ?? null
  );
  const [selectedGenre, setSelectedGenre]         = useState<string | null>(
    searchParams.get("genre") ?? null
  );
  const [selectedPricePreset, setSelectedPricePreset] = useState<number | null>(null);

  const categoryParam = searchParams.get("category");
  const genreParam = searchParams.get("genre");

  // Keep filters in sync when navigating via navbar Store / Genres links
  useEffect(() => {
    setSelectedCategory(categoryParam ?? null);
    setSelectedGenre(genreParam ?? null);
    setPage(1);
    // Hardware store sections don't use genre/price filters
    if (categoryParam && FILTERS_HIDDEN_CATEGORIES.has(categoryParam)) {
      setSelectedGenre(null);
      setSelectedPricePreset(null);
    }
  }, [categoryParam, genreParam]);

  const showFilters = shouldShowStoreFilters(selectedCategory);

  const search     = searchParams.get("search") || undefined;
  const collection = searchParams.get("collection") || undefined;
  const priceMin   =
    showFilters && selectedPricePreset !== null
      ? PRICE_PRESETS[selectedPricePreset].min
      : undefined;
  const priceMax   =
    showFilters && selectedPricePreset !== null
      ? PRICE_PRESETS[selectedPricePreset].max
      : undefined;

  const { games: rawGames, loading, error, pagination } = useGames({
    search,
    collection,
    category: selectedCategory ?? undefined,
    genre: showFilters ? (selectedGenre ?? undefined) : undefined,
    minPrice: priceMin,
    maxPrice: priceMax,
    sortBy,
    page,
    limit: 20,
  });

  const games = rawGames;

  const handleClearAll = () => {
    setSelectedGenre(null);
    setSelectedPricePreset(null);
    setPage(1);
  };

  const handleGenre    = (v: string | null) => { setSelectedGenre(v);    setPage(1); };
  const handlePrice    = (i: number | null) => { setSelectedPricePreset(i); setPage(1); };

  const pad2 = (n: number) => n.toString().padStart(2, "0");

  const getPageRange = (): (number | "ellipsis")[] => {
    const total = pagination.totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const range: (number | "ellipsis")[] = [1, 2, 3];
    if (page > 4) range.push("ellipsis");
    range.push(total);
    return range;
  };

  const pageTitle = selectedCategory || "Library";
  const pageSubtitle = selectedCategory
    ? `${pagination.total.toLocaleString()} items in ${selectedCategory}`
    : `${pagination.total.toLocaleString()} Premium Titles`;

  return (
    <div className="min-h-screen bg-white text-black" style={{ paddingTop: 64 }}>
      <main className="max-w-[1440px] mx-auto px-6 flex gap-8">

        {/* ── Sidebar (PC / browse only) ── */}
        {showFilters && (
          <Sidebar
            selectedGenre={selectedGenre}
            selectedPricePreset={selectedPricePreset}
            onGenre={handleGenre}
            onPricePreset={handlePrice}
            onClearAll={handleClearAll}
          />
        )}

        {/* ── Content ── */}
        <section className="flex-1 min-w-0 pt-12 pb-20">

          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-[38px] font-bold tracking-tighter leading-none mb-2">
                {pageTitle}
              </h1>
              <p className="text-xs font-medium text-[#999]">
                {pageSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#999]">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="appearance-none cursor-pointer border-b border-[#111] bg-transparent py-1 pl-0 pr-6 text-xs font-semibold focus:outline-none"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile filter bar — PC / browse only */}
          {showFilters && (
            <MobileFilterBar
              selectedGenre={selectedGenre} selectedPricePreset={selectedPricePreset}
              onGenre={handleGenre} onPricePreset={handlePrice} onClearAll={handleClearAll}
            />
          )}

          {/* Active filter chips — genre / price only (category comes from navbar) */}
          {showFilters && (selectedGenre || selectedPricePreset !== null) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedGenre && (
                <span className="flex items-center gap-1.5 bg-[#111] text-white text-[10px] font-semibold px-3 py-1.5">
                  {selectedGenre}
                  <button onClick={() => handleGenre(null)} className="hover:opacity-60 transition-opacity">×</button>
                </span>
              )}
              {selectedPricePreset !== null && (
                <span className="flex items-center gap-1.5 bg-[#111] text-white text-[10px] font-semibold px-3 py-1.5">
                  {PRICE_PRESETS[selectedPricePreset].label}
                  <button onClick={() => handlePrice(null)} className="hover:opacity-60 transition-opacity">×</button>
                </span>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-8 border border-red-200 bg-red-50 p-5">
              <p className="font-bold text-sm text-red-600">Error Loading Games</p>
              <p className="mt-1 text-sm text-neutral-500">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 border border-red-200 bg-white text-red-600 hover:bg-red-100 font-bold text-xs px-4 py-2 transition">
                Try Again
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col bg-white border border-[#e5e5e5]" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.04)" }}>
                  <div className="aspect-[3/4] bg-[#f0f0f0] animate-pulse" />
                  <div className="p-2 space-y-1.5">
                    <div className="h-2 w-16 bg-[#ebebeb] animate-pulse rounded-sm" />
                    <div className="h-3 w-full bg-[#ebebeb] animate-pulse rounded-sm" />
                    <div className="h-4 w-20 bg-[#ebebeb] animate-pulse rounded-sm mt-2" />
                  </div>
                  <div className="h-8 bg-[#ebebeb] animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && games.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center border border-dashed border-[#ddd] py-24 px-6">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-base font-bold tracking-tight mb-1">No games found</p>
              <p className="text-sm text-[#999]">Try adjusting your filters or search term.</p>
            </div>
          )}

          {/* Product grid */}
          {!loading && games.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {games.map((raw: any) => (
                <GameCard
                  key={raw.id}
                  game={toGameShape(raw) as any}
                  onAddToCart={() => addItem(raw)}
                  variant="grid"
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="mt-16 flex justify-center items-center gap-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                className="p-2 border border-[#ddd] hover:border-[#111] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:hover:border-[#ddd] transition"
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-4">
                {getPageRange().map((item, i) =>
                  item === "ellipsis" ? (
                    <span key={`e-${i}`} className="text-[#ccc] text-sm select-none font-bold">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`text-[13px] font-bold transition ${
                        item === page
                          ? "text-[#111] border-b-2 border-[#111] pb-0.5"
                          : "text-[#bbb] hover:text-[#111]"
                      }`}
                    >
                      {pad2(item)}
                    </button>
                  )
                )}
              </div>

              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                className="p-2 bg-[#111] text-white hover:bg-neutral-800 disabled:opacity-30 transition"
                aria-label="Next page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}


function GamesLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 64 }}>
      <div className="max-w-[1440px] mx-auto px-6 flex gap-8">
        <div className="hidden lg:block w-60 pt-12">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-[#f0f0f0] animate-pulse rounded-sm" style={{ width: `${60 + i * 5}%` }} />
            ))}
          </div>
        </div>
        <div className="flex-1 pt-12">
          <div className="h-10 w-48 bg-[#f0f0f0] animate-pulse mb-10" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-x-5 gap-y-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] bg-[#f0f0f0] animate-pulse" />
                <div className="h-3 w-3/4 bg-[#f0f0f0] animate-pulse" />
                <div className="h-8 bg-[#f0f0f0] animate-pulse" />
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
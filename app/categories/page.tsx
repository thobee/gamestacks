// app/categories/page.tsx
// Categories Explorer — Kinetic Noir

"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useCategories } from "@/hooks/useGames";
import { CATALOG_CATEGORIES } from "@/lib/catalog";
import { Footer } from "@/components/Footer";

interface CategoryMeta {
  description: string;
  tagline: string;
}

const CATEGORY_DETAILS: Record<string, CategoryMeta> = {
  "PC": {
    description: "PC games for download and play — offline and online titles.",
    tagline: "PC Games",
  },
  "Game Keys Online": {
    description: "Digital license keys delivered instantly after purchase.",
    tagline: "Instant Digital Codes",
  },
  "Consoles": {
    description: "PlayStation, Xbox, Switch and other gaming systems.",
    tagline: "Console Hardware",
  },
  "Gamepads": {
    description: "Controllers and gamepads for high-performance play.",
    tagline: "Tactile Hardware",
  },
  "Accessories": {
    description: "Headsets, cables, stands and gaming peripherals.",
    tagline: "Gear & Peripherals",
  },
  "PlayStation": {
    description: "PlayStation digital games, accounts, and subscriptions.",
    tagline: "PS Digital & Loads",
  },
  "Xbox": {
    description: "Xbox games, Game Pass, and console digital content.",
    tagline: "Xbox Library",
  },
  "Nintendo Switch": {
    description: "Switch physical and digital titles for on-the-go play.",
    tagline: "Portable Nintendo",
  },
  "Other": {
    description: "Everything else in the Gamestacks catalog.",
    tagline: "More Collections",
  },
};

const DEFAULT_META: CategoryMeta = {
  description: "Explore premium digital items and top-rated products in this category.",
  tagline: "Premium Collections",
};

function CategoriesContent() {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
        <p className="text-xs font-medium text-[#999]">Loading Categories...</p>
      </div>
    );
  }

  const allCategoryNames = Array.from(
    new Set([...CATALOG_CATEGORIES, ...categories])
  ).filter(
    (cat) =>
      cat &&
      cat !== "Featured" &&
      cat !== "Other" &&
      cat !== "PC Offline" &&
      cat !== "PC Online",
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allCategoryNames.map((catName) => {
        const meta = CATEGORY_DETAILS[catName] || DEFAULT_META;
        return (
          <Link
            key={catName}
            href={`/games?category=${encodeURIComponent(catName)}`}
            className="group border border-[#e5e5e5] bg-white p-6 hover:border-[#111] transition-all no-underline"
            style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-medium text-[#999] mb-2">{meta.tagline}</p>
            <h3 className="text-lg font-bold text-[#111] tracking-tight group-hover:opacity-70 transition-opacity">
              {catName}
            </h3>
            <p className="mt-2 text-[13px] text-[#888] leading-relaxed">{meta.description}</p>
            <p className="mt-4 text-xs font-semibold text-[#111] opacity-0 group-hover:opacity-100 transition-opacity">
              Browse →
            </p>
          </Link>
        );
      })}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 64 }}>
      <main className="max-w-[1440px] mx-auto px-4 md:px-16 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-0.5 h-4 bg-[#111]" />
            <h1 className="text-3xl font-bold tracking-tight text-[#111]">Categories</h1>
          </div>
          <p className="text-sm text-[#6b6b6b] ml-3">
            Browse the full Gamestacks catalog by product line
          </p>
        </div>
        <Suspense fallback={null}>
          <CategoriesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

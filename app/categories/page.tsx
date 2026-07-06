// app/categories/page.tsx
// Categories Explorer page with custom visual cards

"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useCategories } from "@/hooks/useGames";

interface CategoryMeta {
  description: string;
  icon: string;
  color: string; // border hover / text accent gradient styles
  tagline: string;
}

const CATEGORY_DETAILS: Record<string, CategoryMeta> = {
  "PC Offline": {
    description: "Direct play offline PC games. High compressions, simple installers, no activation needed.",
    icon: "🖥️",
    color: "from-green-500/15 to-green-500/5 hover:border-green-500/30 border-green-500/10 text-green-400",
    tagline: "Unrestricted Offline Play",
  },
  "PlayStation": {
    description: "PlayStation digital games, downloads, account loads, and subscriptions.",
    icon: "🎮",
    color: "from-blue-500/15 to-blue-500/5 hover:border-blue-500/30 border-blue-500/10 text-blue-400",
    tagline: "Console Digital & Loads",
  },
  "Action": {
    description: "Fast-paced adrenaline-pumping shooters, combat games, and adventure quests.",
    icon: "💥",
    color: "from-red-500/15 to-red-500/5 hover:border-red-500/30 border-red-500/10 text-red-400",
    tagline: "Pure Adrenaline & Combat",
  },
  "Sports": {
    description: "Football, basketball, wrestling, and other competitive sports simulations.",
    icon: "⚽",
    color: "from-yellow-500/15 to-yellow-500/5 hover:border-yellow-500/30 border-yellow-500/10 text-yellow-400",
    tagline: "Championship Simulations",
  },
  "Racing": {
    description: "High-octane arcade racers, track simulations, and street drifting games.",
    icon: "🏎️",
    color: "from-orange-500/15 to-orange-500/5 hover:border-orange-500/30 border-orange-500/10 text-orange-400",
    tagline: "Speed & Precision Driving",
  },
  "RPG": {
    description: "Immersive role-playing games with rich story, characters, and open worlds.",
    icon: "⚔️",
    color: "from-purple-500/15 to-purple-500/5 hover:border-purple-500/30 border-purple-500/10 text-purple-400",
    tagline: "Epic Stories & Quests",
  },
  "Strategy": {
    description: "Tactical planning, resource management, and command RTS/turn-based battles.",
    icon: "🧠",
    color: "from-cyan-500/15 to-cyan-500/5 hover:border-cyan-500/30 border-cyan-500/10 text-cyan-400",
    tagline: "Tactical Strategy & Brainpower",
  },
  "Gamepads": {
    description: "Premium controllers, triggers, and gamepads for high-performance play.",
    icon: "🕹️",
    color: "from-emerald-500/15 to-emerald-500/5 hover:border-emerald-500/30 border-emerald-500/10 text-emerald-400",
    tagline: "Tactile Gaming Hardware",
  },
};

const DEFAULT_META: CategoryMeta = {
  description: "Explore premium digital items and top-rated games in this category.",
  icon: "📦",
  color: "from-zinc-500/15 to-zinc-500/5 hover:border-yellow-400/30 border-slate-800 text-zinc-400",
  tagline: "Premium Collections",
};

function CategoriesContent() {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-zinc-800 border-t-yellow-400" />
        <p className="text-sm font-bold uppercase tracking-wider text-zinc-600">Loading Categories...</p>
      </div>
    );
  }

  // Ensure unique list (merge DB categories with our preset metadata categories just in case some aren't seeded yet)
  const allCategoryNames = Array.from(
    new Set([...categories, ...Object.keys(CATEGORY_DETAILS)])
  ).filter(cat => cat && cat !== "Featured");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allCategoryNames.map((catName) => {
        const meta = CATEGORY_DETAILS[catName] || DEFAULT_META;
        return (
          <Link
            key={catName}
            href={`/games?category=${encodeURIComponent(catName)}`}
            className={`group relative overflow-hidden rounded-2xl border bg-slate-900/40 p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 shadow-xl ${meta.color.split(" ").slice(0, 3).join(" ")}`}
          >
            {/* Ambient Background Gradient for Hover Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${meta.color.split(" ").slice(0, 2).join(" ")}`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl select-none transition-transform duration-300 group-hover:scale-110 block">
                  {meta.icon}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 group-hover:text-yellow-400 transition-colors">
                  {meta.tagline}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                {catName}
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {meta.description}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-yellow-400 group-hover:text-yellow-300 relative z-10">
              <span>View catalog</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Radial background glow decoration */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-radial-gradient from-yellow-500/5 via-transparent to-transparent pointer-events-none z-0" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 text-center max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-3">
            Browse Store <span className="text-yellow-400">Categories</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            Curated platforms, hardware gear, and game genres to match your style of play.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-zinc-500 py-24 flex flex-col items-center justify-center gap-3">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-zinc-800 border-t-yellow-400" />
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-600">Loading catalog...</p>
            </div>
          }
        >
          <CategoriesContent />
        </Suspense>
      </div>
    </div>
  );
}

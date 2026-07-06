// components/GameFilters.tsx
// Filter sidebar for game listing

import React from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

interface GameFiltersProps {
  categories: string[];
  onCategoryChange: (category: string | null) => void;
  onPriceChange: (min: number, max: number) => void;
  onSort: (sort: string) => void;
  selectedCategory: string | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function GameFilters({
  categories,
  onCategoryChange,
  onPriceChange,
  onSort,
  selectedCategory,
  searchQuery = "",
  onSearchChange,
}: GameFiltersProps) {
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [sortBy, setSortBy] = React.useState("rating");

  const handlePriceFilter = () => {
    onPriceChange(
      minPrice ? parseInt(minPrice) : 0,
      maxPrice ? parseInt(maxPrice) : 999999,
    );
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSort(value);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      {onSearchChange && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Search</h3>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Categories</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onCategoryChange(null)}
            className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              selectedCategory === null
                ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold"
                : "text-zinc-400 border border-transparent hover:bg-slate-900/60 hover:text-white"
            }`}
          >
            All Games
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold"
                  : "text-zinc-400 border border-transparent hover:bg-slate-900/60 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Price Range</h3>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Min (₦)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-slate-950/60 border-slate-800 text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-xl"
          />
          <Input
            type="number"
            placeholder="Max (₦)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-slate-950/60 border-slate-800 text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-xl"
          />
          <Button
            variant="secondary"
            className="w-full rounded-xl bg-slate-900/60 hover:bg-slate-850 hover:border-yellow-400/40 text-sm font-bold transition duration-200 border-slate-800"
            onClick={handlePriceFilter}
          >
            Apply Range
          </Button>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 cursor-pointer"
        >
          <option value="rating" className="bg-slate-950 text-white">Highest Rated</option>
          <option value="price" className="bg-slate-950 text-white">Price: Low to High</option>
          <option value="downloads" className="bg-slate-950 text-white">Most Downloaded</option>
          <option value="newest" className="bg-slate-950 text-white">Newest</option>
        </select>
      </div>
    </div>
  );
}


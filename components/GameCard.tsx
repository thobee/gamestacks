// components/GameCard.tsx
// Kinetic Noir style — white card, portrait cover, black ADD TO CART button

"use client";

import React from "react";
import Link from "next/link";
import { Game } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

interface GameCardProps {
  game: Game;
  onAddToCart?: (game: Game) => void;
  variant?: "grid" | "carousel";
}

function GameCardComponent({ game, onAddToCart, variant = "grid" }: GameCardProps) {
  // Defensive coercion — raw API data may use snake_case or be missing fields
  const priceNaira   = Number((game as any).priceNaira ?? (game as any).price_naira ?? 0);
  const salePrice    = game.salePrice != null ? Number(game.salePrice) : null;
  const discountPct  = Number(game.discountPercentage ?? 0);

  const displayPrice = salePrice ?? priceNaira;
  const hasDiscount  = salePrice != null && salePrice < priceNaira;

  const rawCategory = game.category || "PC";
  // Legacy store categories — display as PC on cards
  const badgeText =
    rawCategory === "PC Offline" || rawCategory === "PC Online"
      ? "PC"
      : rawCategory;

  // Derive genres/tags to display (max 2)
  const genres: string[] = Array.isArray((game as any).genres)
    ? (game as any).genres.slice(0, 2)
    : [];

  return (
    <div
      className={`group flex flex-col bg-white border border-[#e5e5e5] hover:border-[#111] transition-all duration-200 cursor-pointer ${
        variant === "carousel" ? "w-56 shrink-0" : ""
      }`}
      style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.04)" }}
    >
      <Link href={`/games/${game.slug}`} className="flex flex-col flex-1 no-underline">
        {/* ── Cover image (3:4 portrait) ── */}
        <div className="relative overflow-hidden bg-[#f0f0f0] aspect-[3/4]">
          <img
            src={game.coverImageUrl || "https://placehold.co/300x400/f0f0f0/aaa?text=No+Cover"}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Category badge — top left */}
          <span className="absolute top-3 left-3 bg-[#111] text-white text-[10px] font-semibold px-2 py-1">
            {badgeText}
          </span>

          {/* Discount badge — top right */}
          {hasDiscount && discountPct > 0 && (
            <span className="absolute top-3 right-3 bg-white text-[#111] text-[10px] font-semibold px-2 py-1 border border-[#111]">
              -{discountPct}%
            </span>
          )}

          {/* Gradient overlay at bottom for title readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* ── Info area ── */}
        <div className="flex flex-col flex-1 p-2">
          {/* Genre tags */}
          {genres.length > 0 && (
            <div className="flex gap-1 mb-1 flex-wrap">
              {genres.map((g) => (
                <span
                  key={g}
                  className="text-[10px] font-medium text-[#888]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-bold text-[#111] leading-snug tracking-tight group-hover:underline underline-offset-2 mb-2 line-clamp-2">
            {game.title}
          </h3>

          {/* Price */}
          <div className="flex items-end gap-1.5 mt-auto mb-2">
            <span className="text-[13px] font-bold text-[#111] leading-none">
              {formatNaira(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-[#bbb] line-through leading-none mb-px">
                {formatNaira(priceNaira)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* ── Add to Cart button (full width, below link) ── */}
      {onAddToCart ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(game);
          }}
          className="w-full bg-[#111] text-white text-xs font-bold py-2 border-2 border-[#111] hover:bg-white hover:text-[#111] transition-all duration-150 cursor-pointer"
        >
          Add to Cart
        </button>
      ) : (
        <Link
          href={`/games/${game.slug}`}
          className="block w-full bg-[#111] text-white text-xs font-bold py-2 border-2 border-[#111] hover:bg-white hover:text-[#111] transition-all duration-150 text-center no-underline"
        >
          View Game
        </Link>
      )}
    </div>
  );
}

export const GameCard = React.memo(GameCardComponent);

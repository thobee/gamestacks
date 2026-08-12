// components/GameGrid.tsx
// Grid layout for multiple game cards — Kinetic Noir style

import React from "react";
import { Game } from "@/lib/types";
import { GameCard } from "@/components/GameCard";

interface GameGridProps {
  games: Game[];
  onAddToCart?: (game: Game) => void;
  loading?: boolean;
  cols?: number;
}

function GameGridComponent({
  games,
  onAddToCart,
  loading = false,
  cols = 4,
}: GameGridProps) {
  const colsClass: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  };

  const gridClass = colsClass[cols] ?? colsClass[4];

  if (loading) {
    return (
    <div className={`grid gap-3 ${gridClass}`}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-white border border-[#e5e5e5]" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.04)" }}>
            {/* Image skeleton */}
            <div className="aspect-[3/4] bg-[#f0f0f0] animate-pulse" />
            {/* Info skeleton */}
            <div className="p-3 space-y-2">
              <div className="h-2.5 w-16 bg-[#ebebeb] animate-pulse rounded-sm" />
              <div className="h-4 w-full bg-[#ebebeb] animate-pulse rounded-sm" />
              <div className="h-4 w-3/4 bg-[#ebebeb] animate-pulse rounded-sm" />
              <div className="h-5 w-24 bg-[#ebebeb] animate-pulse rounded-sm mt-3" />
            </div>
            {/* Button skeleton */}
            <div className="h-11 bg-[#ebebeb] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[#6b6b6b]">No games found</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onAddToCart={onAddToCart}
          variant="grid"
        />
      ))}
    </div>
  );
}

export const GameGrid = React.memo(GameGridComponent);

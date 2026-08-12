// components/GameCarousel.tsx
// Full-width cinematic hero carousel — GameHubNG style

"use client";

import React, { useState, useEffect } from "react";
import { Game } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

interface GameCarouselProps {
  games: Game[];
  onAddToCart?: (game: Game) => void;
  autoPlay?: boolean;
  interval?: number;
}

export function GameCarousel({
  games,
  onAddToCart,
  autoPlay = true,
  interval = 5000,
}: GameCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoPlay || games.length === 0) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % games.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, games]);

  if (games.length === 0) return null;

  const game = games[current];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#111]"
      style={{ height: "420px" }}
    >
      {/* Background Images */}
      {games.map((g, index) => (
        <div
          key={g.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={
              g.coverImageUrl ||
              "https://placehold.co/1400x420/111111/333?text=GameHub"
            }
            alt={g.title}
            className="h-full w-full object-cover object-center"
          />
          {/* Dark gradient — heavy on left, fades right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.1) 100%)",
            }}
          />
        </div>
      ))}

      {/* Content — left aligned */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-16 max-w-xl">
        {/* Trending badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Trending Now
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-4xl font-bold leading-tight text-white md:text-5xl">
          {game.title}
        </h1>

        {/* Description */}
        <p className="mb-6 line-clamp-2 text-sm text-gray-300 md:text-base max-w-sm">
          {game.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center gap-5">
          <div>
            {game.originalPriceNaira && game.discountPercentage > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatNaira(game.originalPriceNaira)}
              </p>
            )}
            <p className="text-2xl font-bold text-yellow-400">
              {formatNaira(game.priceNaira)}
            </p>
          </div>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(game)}
              className="rounded-full bg-yellow-400 px-8 py-3 text-xs font-bold text-black transition-all hover:bg-yellow-300 active:scale-95"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>

      {/* Dot indicators — bottom right */}
      {games.length > 1 && (
        <div className="absolute bottom-6 right-8 flex items-center gap-2">
          {games.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "h-2 w-8 bg-yellow-400"
                  : "h-2 w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

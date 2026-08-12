// hooks/useGames.ts
// Custom hook for fetching games

import { useState, useEffect } from "react";
import { Game } from "@/lib/types";

interface UseGamesOptions {
  category?: string;
  genre?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
  search?: string;
  itemType?: string;
  vram?: string;
  ram?: string;
  cpu?: string;
}

export function useGames(options: UseGamesOptions = {}) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.collection) params.append("collection", options.collection);
        if (options.category) params.append("category", options.category);
        if (options.genre) params.append("genre", options.genre);
        if (options.minPrice)
          params.append("minPrice", options.minPrice.toString());
        if (options.maxPrice)
          params.append("maxPrice", options.maxPrice.toString());
        if (options.sortBy) params.append("sortBy", options.sortBy);
        if (options.page) params.append("page", options.page.toString());
        if (options.limit) params.append("limit", options.limit.toString());
        if (options.search) params.append("search", options.search);
        if (options.itemType) params.append("itemType", options.itemType);
        if (options.vram) params.append("vram", options.vram);
        if (options.ram) params.append("ram", options.ram);
        if (options.cpu) params.append("cpu", options.cpu);

        const response = await fetch(`/api/games?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }

        const data = await response.json();
        setGames(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [
    options.collection,
    options.category,
    options.genre,
    options.minPrice,
    options.maxPrice,
    options.sortBy,
    options.page,
    options.limit,
    options.search,
    options.itemType,
    options.vram,
    options.ram,
    options.cpu,
  ]);

  return { games, loading, error, pagination };
}

export function useFeaturedGames(limit: number = 6) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/featured?limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch featured games");
        const data = await response.json();
        setGames(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { games, loading, error };
}

export function useGameDetail(gameId?: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(!!gameId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) throw new Error("Failed to fetch game");
        const data = await response.json();
        setGame(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  return { game, loading, error };
}

export function useSearchGames(query: string) {
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/games/search?q=${encodeURIComponent(query)}`,
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchGames, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/games/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}

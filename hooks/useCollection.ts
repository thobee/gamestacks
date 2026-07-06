// hooks/useCollection.ts
// Fetches games for a specific homepage collection key

import { useState, useEffect } from "react";
import { Game } from "@/lib/types";

export function useCollection(collectionKey: string, limit: number = 8) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionKey) return;

    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/games?collection=${encodeURIComponent(collectionKey)}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Failed to fetch collection");
        const data = await res.json();
        setGames(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionKey, limit]);

  return { games, loading, error };
}

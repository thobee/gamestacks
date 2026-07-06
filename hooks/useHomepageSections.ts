// hooks/useHomepageSections.ts
// Fetches the admin-controlled homepage section config

import { useState, useEffect } from "react";
import { HomepageSection } from "@/lib/types";

export function useHomepageSections() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/homepage-sections");
        if (!res.ok) throw new Error("Failed to load sections");
        const data = await res.json();
        // Only return visible sections, sorted by order
        const visible = (data.data as HomepageSection[])
          .filter((s) => s.isVisible)
          .sort((a, b) => a.order - b.order);
        setSections(visible);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  return { sections, loading, error };
}

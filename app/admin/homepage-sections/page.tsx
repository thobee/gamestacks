"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  key: string;
  label: string;
  type: string;
  isVisible: boolean;
  order: number;
}

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/homepage-sections");
      const json = await res.json();
      if (json.error) setError(json.error.message);
      else setSections(json.data || []);
    } catch {
      setError("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggleVisible = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)),
    );
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/homepage-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s, i) => ({
            id: s.id,
            isVisible: s.isVisible,
            order: i + 1,
          })),
        }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setSections(json.data || sections);
      }
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = sections.filter((s) => s.isVisible).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#000] leading-none mb-2">
            Homepage
          </h1>
          <p className="font-label-mono text-[#5e5e5e] uppercase tracking-widest">
            {visibleCount} of {sections.length} sections visible · Reorder as
            needed
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="noir-btn-primary px-8 py-4 inline-flex items-center gap-2 uppercase tracking-wide text-xs cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>✓ Saved</>
          ) : (
            <>Save Changes</>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 noir-card border-[#ba1a1a]/30 text-[#ba1a1a] text-sm flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="p-4 noir-card text-[#191c1d] text-sm flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#000] shrink-0" />
          <span>
            Homepage sections saved. Changes are live on the storefront.
          </span>
        </div>
      )}

      {/* Sections List */}
      <div className="noir-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#cfc4c5] border-t-[#000]" />
            <span className="font-label-mono text-[#5e5e5e] uppercase">
              Loading...
            </span>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[32px_1fr_100px_100px_80px] gap-4 px-5 py-3 noir-table-head font-label-mono uppercase tracking-widest text-xs">
              <span />
              <span>Section</span>
              <span>Type</span>
              <span className="text-center">Visible</span>
              <span className="text-center">Order</span>
            </div>

            <div className="divide-y divide-[#cfc4c5]">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`grid grid-cols-[32px_1fr_100px_100px_80px] gap-4 items-center px-5 py-4 transition-colors duration-150 ${section.isVisible ? "" : "opacity-50"}`}
                >
                  {/* Drag handle / position indicator */}
                  <div className="font-label-mono text-[#5e5e5e] text-center select-none">
                    {idx + 1}
                  </div>

                  {/* Section info */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-[#000]">
                      {section.label}
                    </span>
                    <span className="font-label-mono text-[#5e5e5e]">
                      /api/games?collection={section.key}
                    </span>
                  </div>

                  {/* Type badge */}
                  <div>
                    <span className="inline-flex items-center gap-2 font-label-mono text-[#191c1d]">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          section.type === "automatic"
                            ? "bg-[#000]"
                            : "bg-[#5e5e5e]"
                        }`}
                      />
                      {section.type === "automatic" ? "Auto" : "Curated"}
                    </span>
                  </div>

                  {/* Visibility toggle */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(section.id)}
                      className={`relative inline-flex h-6 w-11 items-center transition-colors duration-200 cursor-pointer focus:outline-none border border-[#cfc4c5] ${
                        section.isVisible ? "bg-[#000]" : "bg-[#e1e3e4]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform bg-white border border-[#cfc4c5] transition-transform duration-200 ${
                          section.isVisible ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Order arrows */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, "up")}
                      disabled={idx === 0}
                      className="p-1 hover:bg-[#f8f9fa] text-[#5e5e5e] hover:text-[#000] disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move up"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, "down")}
                      disabled={idx === sections.length - 1}
                      className="p-1 hover:bg-[#f8f9fa] text-[#5e5e5e] hover:text-[#000] disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move down"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="noir-card p-5 text-sm text-[#5e5e5e] space-y-2">
        <p className="font-bold text-[#000] text-sm mb-3">How It Works</p>
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center gap-2 font-label-mono text-[#191c1d] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#000]" />
            Auto
          </span>
          <span className="text-xs text-[#5e5e5e]">
            Automatically populated by database queries. No manual curation
            needed.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center gap-2 font-label-mono text-[#191c1d] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e5e5e]" />
            Curated
          </span>
          <span className="text-xs text-[#5e5e5e]">
            Shows games where you enabled the matching flag (Featured,
            Editor&apos;s Choice, etc.) in the catalog editor.
          </span>
        </div>
      </div>
    </div>
  );
}

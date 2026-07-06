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

  useEffect(() => { fetchSections(); }, []);

  const handleToggleVisible = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Homepage Sections
          </h1>
          <p className="mt-2 text-xs font-semibold text-neutral-450 uppercase tracking-wider">
            {visibleCount} of {sections.length} sections visible · Drag to reorder
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xs transition duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 cursor-pointer"
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Homepage sections saved. Changes are live on the storefront.</span>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading...</span>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[32px_1fr_100px_100px_80px] gap-4 px-5 py-3 border-b border-neutral-100 bg-neutral-50/60 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
              <span />
              <span>Section</span>
              <span>Type</span>
              <span className="text-center">Visible</span>
              <span className="text-center">Order</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`grid grid-cols-[32px_1fr_100px_100px_80px] gap-4 items-center px-5 py-4 transition-colors duration-150 ${section.isVisible ? "" : "opacity-50"}`}
                >
                  {/* Drag handle / position indicator */}
                  <div className="text-xs font-bold text-neutral-300 text-center select-none">
                    {idx + 1}
                  </div>

                  {/* Section info */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-neutral-800">{section.label}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">/api/games?collection={section.key}</span>
                  </div>

                  {/* Type badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      section.type === "automatic"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-purple-50 text-purple-700 border-purple-100"
                    }`}>
                      {section.type === "automatic" ? "⚡ Auto" : "✋ Curated"}
                    </span>
                  </div>

                  {/* Visibility toggle */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(section.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                        section.isVisible ? "bg-emerald-500" : "bg-neutral-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
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
                      className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, "down")}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
      <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5 text-sm text-neutral-600 space-y-2">
        <p className="font-bold text-neutral-700 text-xs uppercase tracking-wider mb-3">How it works</p>
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">⚡ Auto</span>
          <span className="text-xs text-neutral-500">Automatically populated by database queries. No manual curation needed.</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 shrink-0">✋ Curated</span>
          <span className="text-xs text-neutral-500">Shows games where you enabled the matching flag (Featured, Editor&apos;s Choice, etc.) in the catalog editor.</span>
        </div>
      </div>
    </div>
  );
}

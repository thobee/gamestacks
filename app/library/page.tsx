"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { UserDashboardLayout } from "@/components/UserDashboardNav";
import { useToast } from "@/components/Toast";

interface LibraryEntry {
  id: string;
  purchased_at: string;
  delivery_status: string;
  delivery_method: string;
  game: {
    id: string;
    title: string;
    slug: string;
    cover_image_url: string | null;
    item_type: string;
    platform: string | null;
  };
  access: {
    is_digital: boolean;
    is_game_key: boolean;
    game_key: string | null;
    download_link: string | null;
  };
}

export default function LibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { success, error: toastError } = useToast();

  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?next=/library");
      return;
    }

    if (!user) return;

    fetch("/api/library")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.error?.message || "Failed to load library");
        return json;
      })
      .then((json) => setEntries(json.data || []))
      .catch((err) => setErrMsg(err.message || "Failed to load library"))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const keyCount = useMemo(
    () => entries.filter((entry) => entry.access.is_game_key).length,
    [entries],
  );

  const revealKey = (id: string) => {
    setRevealedIds((prev) => new Set(prev).add(id));
  };

  const copyKey = async (key: string | null) => {
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      success("Game key copied to clipboard.");
    } catch {
      toastError("Could not copy key. Please copy manually.");
    }
  };

  if (authLoading || loading) {
    return (
      <UserDashboardLayout
        title="My Library"
        subtitle="Your purchased games and keys"
      >
        <div className="flex items-center justify-center py-20">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout
      title="My Library"
      subtitle={`${entries.length} purchased title${entries.length === 1 ? "" : "s"} · ${keyCount} game key${keyCount === 1 ? "" : "s"}`}
    >
      {errMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errMsg}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="noir-card border-dashed p-10 text-center">
          <p className="text-base font-bold text-gray-900">No purchases yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Buy a game to unlock downloads and keys here.
          </p>
          <Link
            href="/games"
            className="mt-5 inline-flex items-center rounded-lg bg-[#111] px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Browse Games
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {entries.map((entry) => {
            const showKey = revealedIds.has(entry.id);
            const hasKey = !!entry.access.game_key;

            return (
              <div
                key={entry.id}
                className="noir-card p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    {entry.game.cover_image_url ? (
                      <img
                        src={entry.game.cover_image_url}
                        alt={entry.game.title}
                        className="h-16 w-12 border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="h-16 w-12 border border-gray-200 bg-gray-100" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {entry.game.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        {entry.game.item_type} · {entry.game.platform || "PC"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Purchased{" "}
                        {new Date(entry.purchased_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {entry.access.is_game_key ? (
                      <>
                        <button
                          onClick={() => revealKey(entry.id)}
                          className="rounded-lg border border-[#111] px-3 py-2 text-sm font-bold text-[#111] hover:bg-[#111] hover:text-white"
                        >
                          {showKey ? "Key Visible" : "View Game Key"}
                        </button>
                        {showKey && hasKey && (
                          <button
                            onClick={() => copyKey(entry.access.game_key)}
                            className="rounded-lg bg-[#111] px-3 py-2 text-sm font-bold text-white hover:bg-neutral-800"
                          >
                            Copy Key
                          </button>
                        )}
                      </>
                    ) : entry.access.download_link ? (
                      <a
                        href={entry.access.download_link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-[#111] px-3 py-2 text-sm font-bold text-white hover:bg-neutral-800"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="rounded-lg border border-gray-300 px-3 py-2 text-[10px] font-semibold text-gray-500">
                        Processing
                      </span>
                    )}
                  </div>
                </div>

                {entry.access.is_game_key && showKey && (
                  <div className="mt-4 rounded-xl border border-[#111] bg-neutral-50 px-3 py-3">
                    <p className="text-xs font-semibold text-gray-500">
                      Your Game Key
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900">
                      {entry.access.game_key || "Key not available yet"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </UserDashboardLayout>
  );
}

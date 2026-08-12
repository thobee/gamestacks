"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { AdminPageHeader } from "@/components/AdminPageHeader";

type CommentNotification = {
  id: string;
  sourceType?: "comment" | "review";
  reviewId: string;
  gameId: string;
  gameTitle: string;
  gameSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
  repliesCount: number;
  unread: boolean;
  isPinned?: boolean;
  pinnedGlobal?: boolean;
  pinnedForGame?: boolean;
};

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<CommentNotification[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyById, setReplyById] = useState<Record<string, string>>({});
  const [savingById, setSavingById] = useState<Record<string, boolean>>({});
  const { success, error: notifyError, info } = useToast();

  const REFRESH_MS = 10000;

  const load = async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);

    if (!silent) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const res = await fetch("/api/admin/comments/notifications");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed to load notifications");
      setItems(json.data.notifications || []);
    } catch (err) {
      if (!silent) {
        notifyError(
          err instanceof Error ? err.message : "Failed to load notifications",
        );
      }
    } finally {
      if (!silent) setInitialLoading(false);
      if (silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();

    const interval = window.setInterval(() => {
      void load({ silent: true });
    }, REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const markRead = async (commentId: string) => {
    setSavingById((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await fetch("/api/admin/comments/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, markReadOnly: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed");
      await load({ silent: true });
      info("Notification marked as read.");
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : "Could not mark as read",
      );
    } finally {
      setSavingById((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const sendReply = async (commentId: string) => {
    const reply = (replyById[commentId] || "").trim();
    if (!reply) return;

    setSavingById((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await fetch("/api/admin/comments/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, reply }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed");
      setReplyById((prev) => ({ ...prev, [commentId]: "" }));
      await load({ silent: true });
      success("Reply sent successfully.");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not send reply");
    } finally {
      setSavingById((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment and its admin replies?")) return;

    setSavingById((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await fetch("/api/admin/comments/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-comment",
          commentId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed");
      await load({ silent: true });
      success("Comment deleted.");
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : "Could not delete comment",
      );
    } finally {
      setSavingById((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const setReviewPin = async (
    commentId: string,
    action: "pin-review" | "unpin-review",
    pinScope: "global" | "game" | "all",
  ) => {
    setSavingById((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await fetch("/api/admin/comments/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          commentId,
          pinScope,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed");
      await load({ silent: true });
      if (action === "pin-review") {
        success(
          pinScope === "global"
            ? "Review pinned for all pages."
            : "Review pinned for this game page.",
        );
      } else {
        info("Review unpinned.");
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not update pin");
    } finally {
      setSavingById((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-72 bg-[#e1e3e4] animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#e1e3e4] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        subtitle={
          refreshing
            ? "Updating feedback stream..."
            : "Track user feedback and reply from one stream"
        }
      />

      {items.length === 0 ? (
        <div className="p-8 noir-card text-sm text-[#5e5e5e]">
          No review or comment notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`noir-card p-5 ${item.unread ? "border-[#000]" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#000]">
                  {item.authorName}
                </span>
                <span className="font-label-mono text-[#5e5e5e] uppercase border border-[#cfc4c5] px-1.5 py-0.5">
                  {item.sourceType === "review" ? "Review" : "Comment"}
                </span>
                {item.unread && (
                  <span className="inline-flex items-center gap-1.5 font-label-mono text-[#191c1d]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#000]" />
                    Unread
                  </span>
                )}
                {item.pinnedGlobal && (
                  <span className="font-label-mono text-[#5e5e5e] border border-[#cfc4c5] px-1.5 py-0.5 uppercase">
                    Pinned (All)
                  </span>
                )}
                {item.pinnedForGame && (
                  <span className="font-label-mono text-[#5e5e5e] border border-[#cfc4c5] px-1.5 py-0.5 uppercase">
                    Pinned (Page)
                  </span>
                )}
                <span className="font-label-mono text-[#5e5e5e] ml-auto">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-[#191c1d] leading-relaxed">
                {item.content}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs">
                <Link
                  href={item.gameSlug ? `/games/${item.gameSlug}` : "/games"}
                  className="font-bold text-[#000] hover:underline"
                >
                  {item.gameTitle}
                </Link>
                <span className="font-label-mono text-[#5e5e5e]">
                  Replies: {item.repliesCount}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={replyById[item.id] || ""}
                  onChange={(e) =>
                    setReplyById((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  className="flex-1 border border-[#cfc4c5] bg-[#f8f9fa] px-3 py-2 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                  placeholder="Write admin reply..."
                />
                <button
                  onClick={() => sendReply(item.id)}
                  disabled={
                    savingById[item.id] || !(replyById[item.id] || "").trim()
                  }
                  className="noir-btn-primary px-4 py-2 text-xs uppercase tracking-wide disabled:opacity-40"
                >
                  Reply
                </button>
                <button
                  onClick={() => markRead(item.id)}
                  disabled={savingById[item.id]}
                  className="noir-btn-outline px-4 py-2 text-xs uppercase tracking-wide disabled:opacity-40"
                >
                  Mark Read
                </button>
                {item.sourceType === "comment" && (
                  <button
                    onClick={() => deleteComment(item.id)}
                    disabled={savingById[item.id]}
                    className="px-4 py-2 border border-[#ba1a1a]/40 text-xs font-bold text-[#ba1a1a] uppercase tracking-wide disabled:opacity-40"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-[#cfc4c5] pt-3">
                <button
                  onClick={() => setReviewPin(item.id, "pin-review", "global")}
                  disabled={savingById[item.id] || Boolean(item.pinnedGlobal)}
                  className="noir-btn-outline px-3 py-1.5 text-xs uppercase tracking-wide disabled:opacity-40"
                >
                  Pin All Pages
                </button>
                <button
                  onClick={() => setReviewPin(item.id, "pin-review", "game")}
                  disabled={savingById[item.id] || Boolean(item.pinnedForGame)}
                  className="noir-btn-outline px-3 py-1.5 text-xs uppercase tracking-wide disabled:opacity-40"
                >
                  Pin This Page
                </button>
                <button
                  onClick={() => setReviewPin(item.id, "unpin-review", "all")}
                  disabled={
                    savingById[item.id] ||
                    (!item.pinnedGlobal && !item.pinnedForGame)
                  }
                  className="noir-btn-outline px-3 py-1.5 text-xs uppercase tracking-wide disabled:opacity-40"
                >
                  Unpin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

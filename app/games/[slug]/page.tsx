// app/games/[slug]/page.tsx
// Game / product detail page — Kinetic Noir design system (refined)

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/Toast";
import { formatNaira } from "@/lib/utils";
import { Game } from "@/lib/types";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/Footer";
import { isDigitalItemType, isPhysicalOnlyItemType } from "@/lib/catalog";

/* ── Types ──────────────────────────────────────────────────────── */

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  isPinned?: boolean;
  pinnedGlobal?: boolean;
  pinnedForGame?: boolean;
}

interface ReviewComment {
  id: string;
  reviewId: string;
  content: string;
  parentCommentId: string | null;
  isAdminReply: boolean;
  authorName: string;
  createdAt: string;
}

interface RelatedGame {
  id: string;
  slug: string;
  title: string;
  price_naira: number;
  sale_price: number | null;
  cover_image_url: string | null;
  rating: number;
  item_type: string;
  platform?: string;
  category?: string;
  genres?: string[];
}

interface GameDetail extends Game {
  reviews: Review[];
  relatedGames: RelatedGame[];
}

/* ── Design tokens (Kinetic Noir) ──────────────────────────────────
   ink       #111111  primary text / fills
   paper     #FFFFFF  background
   hairline  #E5E5E5  borders / dividers
   muted     #8C8C89  secondary text
   faint     #BBBBBB  tertiary text / placeholders
   surface   #F8F9FA  recessed panels
   accent    #FDD835  signature yellow (rating, highlights, delivery)
   good      #059669  verified / success
   warn      #F59E0B  admin / pinned
   bad       #DC2626  errors
   shadow    4px 4px 0px 0px rgba(0,0,0,0.04) — signature offset card shadow
------------------------------------------------------------------- */

const CARD_SHADOW = "4px 4px 0px 0px rgba(0,0,0,0.05)";
const CARD_SHADOW_LG = "8px 8px 0px 0px rgba(0,0,0,0.08)";

/* ── Helpers ────────────────────────────────────────────────────── */

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const stars = Math.round(rating);
  const cls = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={cls}
          fill={i <= stars ? "#FDD835" : "none"}
          stroke={i <= stars ? "#FDD835" : "#ccc"}
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </span>
  );
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= (hovered || value);
        return (
          <svg
            key={i}
            className="w-5.5 h-5.5 cursor-pointer transition-transform duration-150 hover:scale-115"
            fill={filled ? "#FDD835" : "none"}
            stroke={filled ? "#FDD835" : "#ccc"}
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
            role="button"
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        );
      })}
    </span>
  );
}

/* Distribution bars for the review summary — a professional-store staple
   that gives the aggregate rating credibility at a glance. */
function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => Math.round(r.rating) === star).length,
  );
  if (total === 0) return null;
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star, i) => {
        const count = counts[i];
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold text-[#999] w-2.5 text-right">
              {star}
            </span>
            <svg
              className="w-3 h-3 shrink-0"
              fill="#FDD835"
              stroke="#FDD835"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            <div className="flex-1 h-1.5 bg-[#f0f0f0] overflow-hidden">
              <div
                className="h-full bg-[#111] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-[#bbb] w-7 text-right tabular-nums">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function extractYouTubeId(url: string): string {
  const m = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?/\s]{11})/,
  );
  return m ? m[1] : "";
}

function youtubeEmbedSrc(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

function SectionLabel({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[#e5e5e5] pb-3.5 mb-6">
      <span className="block w-1 h-4 bg-[#FDD835] shrink-0" />
      <h2 className="text-sm font-bold tracking-tight text-[#111]">
        {children}
      </h2>
      {typeof count === "number" && (
        <span className="text-xs font-medium text-[#999] tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}

function formatStorageLabel(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const raw = String(value).trim();
  if (/gb|tb|mb/i.test(raw)) return raw;
  return `${raw} GB`;
}

function ReqIcon({ kind }: { kind: "os" | "cpu" | "gpu" | "ram" | "storage" }) {
  const paths: Record<typeof kind, React.ReactNode> = {
    os: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    cpu: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
      />
    ),
    gpu: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="1" />
        <path strokeLinecap="round" d="M7 10h2M11 10h2M15 10h2M7 14h4M13 14h4" />
      </>
    ),
    ram: (
      <>
        <rect x="2" y="7" width="20" height="10" rx="1" />
        <path strokeLinecap="round" d="M6 7V5M10 7V5M14 7V5M18 7V5M6 17v2M10 17v2M14 17v2M18 17v2" />
      </>
    ),
    storage: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    ),
  };
  return (
    <svg
      className="w-4 h-4 text-[#111]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}

/* Skeleton loader — reads as an intentional, branded loading state
   rather than a generic spinner, and previews the final layout. */
function DetailSkeleton() {
  const pulse = "animate-pulse bg-[#efefef]";
  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 64 }}>
      <div className="max-w-360 mx-auto px-4 md:px-16 py-8">
        <div className={`h-3 w-56 ${pulse} mb-8`} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className={`w-full md:w-60 aspect-3/4 shrink-0 ${pulse}`} />
              <div className="grow space-y-4">
                <div className={`h-3 w-24 ${pulse}`} />
                <div className={`h-9 w-3/4 ${pulse}`} />
                <div className={`h-4 w-32 ${pulse}`} />
                <div className={`h-8 w-40 ${pulse}`} />
                <div className={`h-20 w-full ${pulse}`} />
                <div className="flex gap-2 pt-4">
                  <div className={`h-12 w-40 ${pulse}`} />
                  <div className={`h-12 w-40 ${pulse}`} />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-3">
            <div className={`h-3 w-32 ${pulse} mb-4`} />
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-14 w-full ${pulse}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { success } = useToast();

  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { data: session } = useSession();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());
  const [commentsByReview, setCommentsByReview] = useState<
    Record<string, ReviewComment[]>
  >({});
  const [commentInputByReview, setCommentInputByReview] = useState<
    Record<string, string>
  >({});
  const [commentSubmittingByReview, setCommentSubmittingByReview] = useState<
    Record<string, boolean>
  >({});
  const [commentErrorByReview, setCommentErrorByReview] = useState<
    Record<string, string>
  >({});
  const [openCommentsFor, setOpenCommentsFor] = useState<Set<string>>(
    new Set(),
  );
  const preloadedReviews: Review[] = game?.reviews || [];

  const loadComments = async (reviewId: string) => {
    try {
      const res = await fetch(
        `/api/games/${slug}/comments?reviewId=${encodeURIComponent(reviewId)}`,
      );
      const json = await res.json();
      if (!res.ok) return;
      setCommentsByReview((prev) => ({ ...prev, [reviewId]: json.data || [] }));
    } catch {
      // Non-blocking UI path.
    }
  };

  useEffect(() => {
    if (!slug) return;
    const fetchGame = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/games/${slug}`);
        if (!res.ok) {
          if (res.status === 404) router.push("/games");
          throw new Error("Failed to load game");
        }
        const data = await res.json();
        const g = data.data as GameDetail;
        setGame(g);
        setActiveImage(g.coverImageUrl || (g as any).cover_image_url || null);
        setActiveIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [slug, router]);

  useEffect(() => {
    preloadedReviews.slice(0, 10).forEach((r) => {
      if (!commentsByReview[r.id]) {
        loadComments(r.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, preloadedReviews.length]);

  const handleAddToCart = () => {
    if (!game) return;
    addItem(game as any);
    setAddedToCart(true);
    success(`${game.title} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const coverImageCandidate =
    game?.coverImageUrl || (game as any)?.cover_image_url;
  const coverImage =
    typeof coverImageCandidate === "string" &&
    coverImageCandidate.trim().length > 0
      ? coverImageCandidate
      : null;
  const screenshotCandidates =
    game?.screenshotsUrls || (game as any)?.screenshots_urls || [];
  const screenshots: string[] = Array.isArray(screenshotCandidates)
    ? screenshotCandidates.filter(
        (url): url is string =>
          typeof url === "string" && url.trim().length > 0,
      )
    : [];
  const allImages = [coverImage, ...screenshots].filter(Boolean) as string[];

  const goToImage = useCallback(
    (dir: 1 | -1) => {
      if (allImages.length === 0) return;
      const next = (activeIndex + dir + allImages.length) % allImages.length;
      setActiveIndex(next);
      setActiveImage(allImages[next]);
    },
    [activeIndex, allImages],
  );

  // Keyboard nav inside the lightbox.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") goToImage(1);
      if (e.key === "ArrowLeft") goToImage(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goToImage]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !game) {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center"
        style={{ paddingTop: 64 }}
      >
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 border-2 border-[#111] mx-auto mb-5 flex items-center justify-center rotate-45">
            <span className="-rotate-45 text-xl font-bold">!</span>
          </div>
          <p className="text-2xl font-bold text-[#111] tracking-tight mb-2">
            Not Found
          </p>
          <p className="text-sm text-[#6b6b6b] leading-relaxed mb-6">
            This item might have been removed or the link is invalid.
          </p>
          <Link
            href="/games"
            className="inline-block text-sm font-bold text-[#111] border-b-2 border-[#111] hover:opacity-50 transition-opacity"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const effectivePriceRaw =
    game.salePrice ?? game.priceNaira ?? (game as any).price_naira;
  const effectivePrice = Number.isFinite(Number(effectivePriceRaw))
    ? Number(effectivePriceRaw)
    : 0;
  const originalPriceRaw = game.salePrice
    ? (game.priceNaira ?? (game as any).price_naira)
    : null;
  const originalPrice =
    originalPriceRaw !== null && Number.isFinite(Number(originalPriceRaw))
      ? Number(originalPriceRaw)
      : null;
  const discountPct =
    originalPrice && originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const cpu =
    game.systemRequirementsCpu || (game as any).system_requirements_cpu;
  const ram =
    game.systemRequirementsRam || (game as any).system_requirements_ram;
  const gpu =
    game.systemRequirementsGpu || (game as any).system_requirements_gpu;
  const storage =
    game.systemRequirementsStorage ||
    (game as any).system_requirements_storage_gb;
  const os =
    game.systemRequirementsOs || (game as any).system_requirements_os;
  const hasSystemReqs = Boolean(cpu || ram || gpu || storage || os);
  const descriptionText =
    game.longDescription || game.description || null;
  const systemReqItems = [
    os ? { key: "os" as const, label: "Operating System", value: String(os) } : null,
    cpu ? { key: "cpu" as const, label: "Processor", value: String(cpu) } : null,
    gpu ? { key: "gpu" as const, label: "Graphics", value: String(gpu) } : null,
    ram ? { key: "ram" as const, label: "Memory", value: String(ram) } : null,
    storage
      ? {
          key: "storage" as const,
          label: "Storage",
          value: formatStorageLabel(storage),
        }
      : null,
  ].filter(Boolean) as {
    key: "os" | "cpu" | "gpu" | "ram" | "storage";
    label: string;
    value: string;
  }[];

  const genres: string[] = game.genres || [];
  const reviews: Review[] = [...(game.reviews || [])].sort((a, b) => {
    const aPinned = a.isPinned ? 1 : 0;
    const bPinned = b.isPinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const relatedGames: RelatedGame[] = game.relatedGames || [];
  const videoUrl: string | null =
    (game as any).videoUrl ||
    (game as any).video_url ||
    game.installationGuideUrl ||
    (game as any).installation_guide_url ||
    null;
  const safeVideoUrl =
    typeof videoUrl === "string" && videoUrl.trim().length > 0
      ? videoUrl
      : null;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : Number(game.rating) || 0;
  const verifiedCount = reviews.filter((r) => r.isVerifiedPurchase).length;

  const resolvedItemType = game.itemType || (game as any).item_type || "game";
  const showDownload = isDigitalItemType(resolvedItemType);
  const physicalOnly = isPhysicalOnlyItemType(resolvedItemType);
  const mediaItems = [
    ...(safeVideoUrl ? [{ kind: "video" as const, url: safeVideoUrl }] : []),
    ...screenshots.map((url: string) => ({ kind: "image" as const, url })),
  ];

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    if (!session) {
      router.push(
        "/auth/login?callbackUrl=" +
          encodeURIComponent(window.location.pathname),
      );
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      const res = await fetch(`/api/games/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reviewText, rating: reviewRating }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Could not post review");

      setReviewText("");
      const refreshed = await fetch(`/api/games/${slug}`);
      if (refreshed.ok) {
        const data = await refreshed.json();
        const g = data.data as GameDetail;
        setGame(g);
      }
      success("Review submitted");
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Could not post review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const submitComment = async (reviewId: string) => {
    const content = (commentInputByReview[reviewId] || "").trim();
    if (!content) return;
    if (!session) {
      router.push(
        "/auth/login?callbackUrl=" +
          encodeURIComponent(window.location.pathname),
      );
      return;
    }

    try {
      setCommentSubmittingByReview((prev) => ({ ...prev, [reviewId]: true }));
      setCommentErrorByReview((prev) => ({ ...prev, [reviewId]: "" }));
      const res = await fetch(`/api/games/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, content }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Could not post comment");

      setCommentInputByReview((prev) => ({ ...prev, [reviewId]: "" }));
      await loadComments(reviewId);
    } catch (err) {
      setCommentErrorByReview((prev) => ({
        ...prev,
        [reviewId]:
          err instanceof Error ? err.message : "Could not post comment",
      }));
    } finally {
      setCommentSubmittingByReview((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-[#111]"
      style={{ paddingTop: 64 }}
    >
      {/* ── Breadcrumb ── */}
      <div className="max-w-360 mx-auto px-4 md:px-16 pt-8 pb-2">
                <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium tracking-wide text-[#999]"
        >
          <Link href="/" className="hover:text-[#111] transition-colors">
            Home
          </Link>
          <span aria-hidden="true" className="text-[#ccc]">
            /
          </span>
          <Link href="/games" className="hover:text-[#111] transition-colors">
            Store
          </Link>
          <span aria-hidden="true" className="text-[#ccc]">
            /
          </span>
          <span className="text-[#111] truncate max-w-50">{game.title}</span>
        </nav>
      </div>

      {/* ── Main ── */}
      <main className="max-w-360 mx-auto px-4 md:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Left col: details (8 cols) ── */}
          <section className="lg:col-span-8 space-y-9">
            {/* ── Cover + core details (screenshot-style arrangement) ── */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div
                className="border border-[#e5e5e5] overflow-hidden relative cursor-zoom-in group w-full max-w-60"
                style={{ boxShadow: CARD_SHADOW }}
                onClick={() => setLightboxOpen(true)}
              >
                {activeImage ? (
                  <img
                    alt={game.title}
                    className="w-full h-auto aspect-3/4 object-cover transition-transform duration-500 group-hover:scale-105"
                    src={activeImage}
                  />
                ) : (
                  <div className="w-full aspect-3/4 flex items-center justify-center text-[#ccc] text-4xl bg-[#f5f5f5]">
                    🎮
                  </div>
                )}
                {discountPct > 0 && (
                  <span className="absolute top-2 left-2 bg-[#111] text-white text-[10px] font-semibold px-2 py-0.5">
                    -{discountPct}%
                  </span>
                )}
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Zoom
                </span>
              </div>

              {/* ── Title / description / meta ── */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#8c8c89] mb-2.5">
                  {game.category || game.platform || "Game"}
                </p>

                <h1 className="text-[1.75rem] md:text-[2.35rem] font-bold tracking-tight leading-[1.15] mb-3.5 text-[#111] text-balance">
                  {game.title}
                </h1>

                {game.rating > 0 && (
                  <div className="flex items-center gap-2.5 mb-6">
                    <StarRating rating={game.rating} />
                    <span className="text-sm font-semibold text-[#555] tabular-nums">
                      {game.rating.toFixed(1)}
                    </span>
                    {reviews.length > 0 && (
                      <span className="text-sm text-[#999]">
                        · {reviews.length} review
                        {reviews.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}

                {/* ── Price + actions (compact, left-aligned) ── */}
                <div className="flex items-baseline gap-3 flex-wrap mb-4">
                  <span className="text-3xl md:text-[2.1rem] font-bold text-[#111] tabular-nums tracking-tight">
                    {formatNaira(effectivePrice)}
                  </span>
                  {originalPrice && (
                    <span className="text-base text-[#aaa] line-through font-medium tabular-nums">
                      {formatNaira(originalPrice)}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="text-xs font-bold text-[#111] bg-[#FDD835] px-2 py-0.5">
                      Save {discountPct}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap mb-8">
                  <button
                    onClick={handleAddToCart}
                    className={`flex items-center justify-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                      addedToCart
                        ? "bg-emerald-600 text-white border-2 border-emerald-600"
                        : "bg-[#111] text-white border-2 border-[#111] hover:bg-white hover:text-[#111]"
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      {addedToCart ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      )}
                    </svg>
                    {addedToCart ? "Added" : "Add to Cart"}
                  </button>

                  {showDownload && (
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FDD835] text-[#111] border-2 border-[#111] font-bold text-xs uppercase tracking-wider hover:bg-[#111] hover:text-[#FDD835] transition-all duration-150 active:scale-[0.98]"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (!session)
                        router.push(
                          "/auth/login?callbackUrl=" +
                            encodeURIComponent(window.location.pathname),
                        );
                      else setShowOrderModal(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#111] text-[#111] hover:bg-[#111] hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 active:scale-[0.98]"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {physicalOnly ? "Buy / Deliver" : "Home Delivery"}
                  </button>
                </div>

                {/* ── About / description ── */}
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-[#111] mb-2.5">
                    About this game
                  </h2>
                  <p className="text-[15px] md:text-base font-normal text-[#3a3a3a] leading-[1.75] whitespace-pre-line max-w-2xl">
                    {descriptionText ||
                      "No description available for this title yet."}
                  </p>
                </div>

                <div className="border-t border-[#ebebeb] pt-5">
                  <h2 className="text-sm font-bold text-[#111] mb-3.5">
                    Details
                  </h2>
                  <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[8.5rem_1fr] gap-x-4 gap-y-3.5 text-sm">
                    {genres.length > 0 && (
                      <>
                        <span className="text-[#8c8c89] font-medium pt-0.5">
                          Genre
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {genres.map((g) => (
                            <Link
                              key={g}
                              href={`/games?genre=${encodeURIComponent(g)}`}
                              className="border border-[#ddd] px-2.5 py-1 text-xs font-medium text-[#333] hover:border-[#111] hover:text-[#111] transition-colors no-underline"
                            >
                              {g}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                    {game.platform && (
                      <>
                        <span className="text-[#8c8c89] font-medium">
                          Platform
                        </span>
                        <span className="text-[#222] font-medium">
                          {game.platform}
                        </span>
                      </>
                    )}
                    {game.deliveryType && (
                      <>
                        <span className="text-[#8c8c89] font-medium">
                          Delivery
                        </span>
                        <span className="text-[#222] font-medium">
                          {game.deliveryType}
                        </span>
                      </>
                    )}
                    {game.region && (
                      <>
                        <span className="text-[#8c8c89] font-medium">
                          Region
                        </span>
                        <span className="text-[#222] font-medium">
                          {game.region}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {hasSystemReqs && (
                  <div className="border-t border-[#ebebeb] mt-6 pt-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-block w-1.5 h-1.5 bg-[#FDD835]" />
                        <h2 className="text-sm font-bold text-[#111]">
                          Minimum Requirements
                        </h2>
                      </div>
                      <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-xl">
                        Recommended specs so the game runs smoothly. Check these
                        against your PC before you buy or download.
                      </p>
                    </div>

                    <div
                      className="bg-[#f8f9fa] border border-[#e8e8e8] p-4 sm:p-5"
                      style={{ boxShadow: CARD_SHADOW }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {systemReqItems.map((item) => (
                          <div
                            key={item.key}
                            className="flex gap-3 bg-white border border-[#ebebeb] p-3.5"
                          >
                            <div className="w-8 h-8 shrink-0 bg-[#f5f5f5] border border-[#ebebeb] flex items-center justify-center">
                              <ReqIcon kind={item.key} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#8c8c89] mb-0.5">
                                {item.label}
                              </p>
                              <p className="text-sm font-medium text-[#1a1a1a] leading-snug break-words">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Screenshots + Video ── */}
            {mediaItems.length > 0 && (
              <div>
                <SectionLabel>Screenshots &amp; Video</SectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mediaItems.map((item, i) => {
                    if (item.kind === "video") {
                      return (
                        <div
                          key={`video-${i}`}
                          className="border border-[#e5e5e5] overflow-hidden aspect-video bg-[#f5f5f5]"
                        >
                          {(() => {
                            const isYouTube =
                              item.url.includes("youtube.com") ||
                              item.url.includes("youtu.be") ||
                              item.url.includes("youtube-nocookie.com");
                            const embedSrc = isYouTube
                              ? youtubeEmbedSrc(item.url)
                              : null;

                            if (isYouTube && embedSrc) {
                              return (
                                <iframe
                                  src={embedSrc}
                                  title={`${game.title} video`}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  referrerPolicy="strict-origin-when-cross-origin"
                                  loading="lazy"
                                />
                              );
                            }

                            if (isYouTube && !embedSrc) {
                              return (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[#888] p-4 text-center">
                                  Video link could not be loaded. Check the
                                  YouTube URL in admin.
                                </div>
                              );
                            }

                            return (
                              <video
                                controls
                                className="w-full h-full object-cover"
                                src={item.url}
                              />
                            );
                          })()}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={`image-${i}`}
                        onClick={() => {
                          setActiveImage(item.url);
                          setLightboxOpen(true);
                        }}
                        className="border border-[#e5e5e5] overflow-hidden aspect-video group cursor-zoom-in hover:border-[#111] transition-all relative"
                      >
                        <img
                          src={item.url}
                          alt={`${game.title} screenshot ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Reviews ── */}
            <div>
              <SectionLabel count={reviews.length || undefined}>
                Reviews
              </SectionLabel>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-7 pb-7 border-b border-[#ebebeb]">
                  <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 shrink-0">
                    <span className="text-4xl font-bold text-[#111] leading-none">
                      {avgRating.toFixed(1)}
                    </span>
                    <div className="flex flex-col gap-1">
                      <StarRating rating={avgRating} size="lg" />
                      <span className="text-xs font-medium text-[#999]">
                        {reviews.length} rating{reviews.length !== 1 && "s"}
                        {verifiedCount > 0 && ` · ${verifiedCount} verified`}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <RatingBreakdown reviews={reviews} />
                  </div>
                </div>
              )}

              {/* Write a review */}
              <div
                className="bg-[#f8f9fa] border border-[#e5e5e5] p-5 space-y-4 mb-6"
                style={{ boxShadow: CARD_SHADOW }}
              >
                <p className="text-sm font-semibold text-[#111]">
                  Write a Review
                </p>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-white border border-[#e5e5e5] p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111] transition-colors min-h-22.5 placeholder:text-[#ccc] resize-none"
                  placeholder="Share your experience with this product..."
                  aria-label="Review content"
                />
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#888]">
                      Your rating
                    </span>
                    <InteractiveStarRating
                      value={reviewRating}
                      onChange={setReviewRating}
                    />
                  </div>
                  <button
                    disabled={!reviewText.trim() || reviewSubmitting}
                    onClick={submitReview}
                    className="bg-[#111] text-white font-bold text-sm px-5 py-2.5 hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {reviewSubmitting ? "Posting..." : "Post Review"}
                  </button>
                </div>
                {reviewError && (
                  <p className="text-[11px] text-red-600 font-semibold">
                    {reviewError}
                  </p>
                )}
              </div>

              {/* Review list */}
              {reviews.length > 0 ? (
                <div className="space-y-5">
                  {reviews.map((review) => {
                    const commentCount = (commentsByReview[review.id] || [])
                      .length;
                    const commentsOpen = openCommentsFor.has(review.id);
                    return (
                      <div
                        key={review.id}
                        className="border-b border-[#ebebeb] pb-5 last:border-0"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-9 h-9 bg-[#111] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {(review.title || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="grow">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-[#111] tracking-tight">
                                {review.title || "Anonymous"}
                              </p>
                              {review.isVerifiedPurchase && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 inline-flex items-center gap-0.5">
                                  <svg
                                    className="w-2.5 h-2.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Verified
                                </span>
                              )}
                              {review.isPinned && (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5">
                                  {review.pinnedGlobal
                                    ? "Pinned · All Pages"
                                    : "Pinned"}
                                </span>
                              )}
                              <span className="text-xs text-[#bbb] ml-auto">
                                {timeAgo(review.createdAt)}
                              </span>
                            </div>
                            <div className="mt-1">
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                        </div>
                        <p className="text-[15px] text-[#444] leading-[1.7] ml-12">
                          {review.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 ml-12">
                          <button
                            onClick={() => {
                              setHelpfulIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(review.id)) next.delete(review.id);
                                else next.add(review.id);
                                return next;
                              });
                            }}
                            className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                              helpfulIds.has(review.id)
                                ? "text-[#111]"
                                : "text-[#bbb] hover:text-[#555]"
                            }`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill={
                                helpfulIds.has(review.id)
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            Helpful (
                            {review.helpfulCount +
                              (helpfulIds.has(review.id) ? 1 : 0)}
                            )
                          </button>
                          <button
                            onClick={() =>
                              setOpenCommentsFor((prev) => {
                                const next = new Set(prev);
                                if (next.has(review.id)) next.delete(review.id);
                                else next.add(review.id);
                                return next;
                              })
                            }
                            className="flex items-center gap-1 text-xs font-semibold text-[#bbb] hover:text-[#555] transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.083 0-2.12-.17-3.08-.484L3 21l1.5-4.5C3.55 15.267 3 13.686 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            Comments ({commentCount})
                          </button>
                        </div>

                        {commentsOpen && (
                          <div className="ml-12 mt-4 border-t border-[#f0f0f0] pt-3">
                            <div className="space-y-2 mb-3">
                              {(commentsByReview[review.id] || []).map(
                                (comment) => (
                                  <div
                                    key={comment.id}
                                    className={`border px-3 py-2 text-xs ${comment.isAdminReply ? "border-[#111] bg-[#fafafa]" : "border-[#e5e5e5] bg-white"}`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-xs text-[#111]">
                                        {comment.authorName}
                                      </span>
                                      {comment.isAdminReply && (
                                        <span className="text-[10px] font-semibold text-[#F59E0B]">
                                          Admin
                                        </span>
                                      )}
                                      <span className="text-xs text-[#bbb] ml-auto">
                                        {timeAgo(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-[#6b6b6b] leading-relaxed">
                                      {comment.content}
                                    </p>
                                  </div>
                                ),
                              )}
                              {(commentsByReview[review.id] || []).length ===
                                0 && (
                                <p className="text-[11px] text-[#bbb]">
                                  No comments yet.
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={commentInputByReview[review.id] || ""}
                                onChange={(e) =>
                                  setCommentInputByReview((prev) => ({
                                    ...prev,
                                    [review.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add a comment..."
                                className="flex-1 bg-white border border-[#e5e5e5] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111]"
                              />
                              <button
                                onClick={() => submitComment(review.id)}
                                disabled={
                                  commentSubmittingByReview[review.id] ||
                                  !(
                                    commentInputByReview[review.id] || ""
                                  ).trim()
                                }
                                className="bg-[#111] text-white px-3 py-2 text-xs font-bold disabled:opacity-40 hover:bg-neutral-800 transition-colors"
                              >
                                {commentSubmittingByReview[review.id]
                                  ? "Sending"
                                  : "Comment"}
                              </button>
                            </div>
                            {commentErrorByReview[review.id] && (
                              <p className="mt-2 text-[11px] text-red-600 font-semibold">
                                {commentErrorByReview[review.id]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-[#ddd]">
                  <p className="text-sm text-[#6b6b6b] leading-relaxed">
                    No reviews yet — be the first!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Right col: related games only (4 cols) ── */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <SectionLabel>You May Also Like</SectionLabel>

            {relatedGames.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {relatedGames.slice(0, 6).map((rg) => {
                  const rgPrice = rg.sale_price ?? rg.price_naira;
                  return (
                    <div
                      key={rg.id}
                      className="group border border-[#e5e5e5] hover:border-[#111] transition-colors bg-white"
                      style={{ boxShadow: CARD_SHADOW }}
                    >
                      <Link
                        href={`/games/${rg.slug}`}
                        className="block relative aspect-3/4 overflow-hidden border-b border-[#e5e5e5]"
                      >
                        {rg.cover_image_url ? (
                          <img
                            alt={rg.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            src={rg.cover_image_url}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5] text-2xl">
                            🎮
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(rg as any);
                          }}
                          title="Add to cart"
                          className="absolute bottom-1 right-1 w-5.5 h-5.5 bg-[#111] text-white flex items-center justify-center hover:bg-[#FDD835] hover:text-[#111] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-2.5 h-2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </Link>
                      <div className="p-1.5">
                        <Link href={`/games/${rg.slug}`}>
                          <h3
                            className="font-semibold text-[11px] leading-snug line-clamp-2 text-[#111] hover:text-[#555] transition-colors min-h-7"
                            title={rg.title}
                          >
                            {rg.title}
                          </h3>
                        </Link>
                        <p className="text-xs font-bold text-[#111] mt-1 tabular-nums">
                          {formatNaira(rgPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#bbb]">No similar items found.</p>
            )}
          </aside>
        </div>
      </main>

      <Footer />

      {/* ── Lightbox ── */}
      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white font-bold text-2xl w-10 h-10 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>

          {allImages.length > 1 && (
            <>
              <button
                className="absolute left-2 md:left-6 text-white/70 hover:text-white w-10 h-10 flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(-1);
                }}
                aria-label="Previous image"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="absolute right-2 md:right-6 text-white/70 hover:text-white w-10 h-10 flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(1);
                }}
                aria-label="Next image"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-semibold">
                {activeIndex + 1} / {allImages.length}
              </span>
            </>
          )}

          <img
            src={activeImage}
            alt={game.title}
            className="max-w-full max-h-[85vh] transition-transform"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Download Modal ── */}
      {showDownloadModal && (
        <DownloadModal
          game={game}
          onClose={() => setShowDownloadModal(false)}
          session={session}
          router={router}
        />
      )}

      {/* ── Home Delivery Modal ── */}
      {showOrderModal && session?.user && (
        <DeliveryDetailsModal
          game={game}
          session={session}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}

/* Shared modal chrome — used by both modals below so the "checkout"
   moments feel like one consistent, deliberate flow rather than two
   separately-built forms. */
function useEscToClose(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

/* ── Download Modal ─────────────────────────────────────────────── */

function DownloadModal({
  game,
  onClose,
  session,
  router,
}: {
  game: GameDetail;
  onClose: () => void;
  session: any;
  router: any;
}) {
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEscToClose(onClose);

  const effectivePriceRaw =
    game.salePrice ?? game.priceNaira ?? (game as any).price_naira;
  const effectivePrice = Number.isFinite(Number(effectivePriceRaw))
    ? Number(effectivePriceRaw)
    : 0;
  const originalPriceRaw = game.salePrice
    ? (game.priceNaira ?? (game as any).price_naira)
    : null;
  const originalPrice =
    originalPriceRaw !== null && Number.isFinite(Number(originalPriceRaw))
      ? Number(originalPriceRaw)
      : null;
  const discountPct =
    originalPrice && originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(
        "/auth/login?callbackUrl=" +
          encodeURIComponent(window.location.pathname),
      );
      return;
    }

    if (!email.trim() || !fullName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        items: [{ gameId: game.id }],
        customerFullName: fullName,
        customerEmail: email,
        customerWhatsapp: whatsapp || null,
        customerPhone: null,
        deliveryMethod: "digital",
      };

      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to initialize payment");
      window.location.href = data.data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div
        className="bg-white text-[#111] w-full max-w-3xl border border-[#dcdcdc] overflow-hidden max-h-[92vh] flex flex-col"
        style={{ boxShadow: CARD_SHADOW_LG }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#1f1f1f] shrink-0 bg-[#111] text-white">
          <div>
            <h2
              id="download-modal-title"
              className="text-base font-bold"
            >
              Download Access
            </h2>
            <p className="mt-1 text-sm text-white/65 leading-relaxed">
              Enter contact details to continue
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 border border-white/80 bg-white text-[#111] font-semibold">
                Step 1: Contact
              </span>
              <span className="text-[10px] px-2 py-1 border border-white/30 bg-transparent font-semibold text-white/60">
                Step 2: Payment
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-white/30 text-white/75 hover:text-white hover:border-white transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-6 bg-[#f5f6f7]">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 border border-[#e5e5e5] bg-white p-4 md:p-5 h-fit">
              <div className="flex items-start gap-3">
                {(game as any).cover_image_url || game.coverImageUrl ? (
                  <img
                    src={(game as any).cover_image_url || game.coverImageUrl}
                    alt={game.title}
                    className="w-12 h-15 object-cover border border-[#e5e5e5]"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-[#111] leading-tight line-clamp-2">
                    {game.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-1 border border-[#111] font-semibold text-[#111]">
                      Digital Delivery
                    </span>
                    {discountPct > 0 && (
                      <span className="text-[10px] px-2 py-1 border border-[#f0d96a] bg-[#fff8d9] font-semibold text-[#8b6d00]">
                        -{discountPct}% Off
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#ededed]">
                <p className="text-xs font-semibold text-[#777]">
                  Total
                </p>
                <p className="mt-1 text-lg font-bold text-[#111] leading-none">
                  {formatNaira(effectivePrice)}
                </p>
                {originalPrice && (
                  <p className="mt-1 text-xs font-medium text-[#b1b1b1] line-through">
                    {formatNaira(originalPrice)}
                  </p>
                )}
              </div>
              <p className="mt-3 text-sm text-[#6b6b6b] leading-relaxed">
                Download link will be available immediately after successful
                payment confirmation.
              </p>
            </div>
            <div className="lg:col-span-3">
              {error && (
                <p className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
                  {error}
                </p>
              )}

              <form
                id="download-form"
                onSubmit={handleProceed}
                className="space-y-5"
              >
                <div className="border border-[#e5e5e5] bg-white p-4 md:p-5">
                  <p className="text-sm font-bold text-[#111] mb-3">
                    Contact Details
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#777] mb-2">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border border-[#dcdcdc] text-[#111] px-4 py-3 text-sm font-medium focus:border-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-colors placeholder:text-[#bdbdbd]"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#777] mb-2">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-[#dcdcdc] text-[#111] px-4 py-3 text-sm font-medium focus:border-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-colors placeholder:text-[#bdbdbd]"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#777] mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        required
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full bg-white border border-[#dcdcdc] text-[#111] px-3 py-3 text-sm font-medium focus:border-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-colors placeholder:text-[#bdbdbd]"
                        placeholder="080..."
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 border-t border-[#e5e5e5] shrink-0 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              form="download-form"
              type="submit"
              disabled={isSubmitting || !email.trim() || !whatsapp.trim()}
              className="w-full sm:w-auto min-w-64 bg-[#111] text-white font-bold py-3.5 px-6 text-sm hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Home Delivery Modal ─────────────────────────────────────────── */

function DeliveryDetailsModal({
  game,
  session,
  onClose,
}: {
  game: GameDetail;
  session: any;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: session.user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEscToClose(onClose);

  const effectivePriceRaw =
    game.salePrice ?? game.priceNaira ?? (game as any).price_naira;
  const effectivePrice = Number.isFinite(Number(effectivePriceRaw))
    ? Number(effectivePriceRaw)
    : 0;
  const originalPriceRaw = game.salePrice
    ? (game.priceNaira ?? (game as any).price_naira)
    : null;
  const originalPrice =
    originalPriceRaw !== null && Number.isFinite(Number(originalPriceRaw))
      ? Number(originalPriceRaw)
      : null;
  const discountPct =
    originalPrice && originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const formattedAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`;
      const payload = {
        items: [{ gameId: game.id }],
        customerFullName: formData.fullName,
        customerEmail: session.user?.email || "",
        customerPhone: formData.phone,
        deliveryMethod: "home",
        deliveryAddress: formattedAddress,
        notes: formData.notes,
      };
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to initialize payment");
      window.location.href = data.data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-white border border-[#dcdcdc] text-[#111] px-4 py-3 text-sm font-medium focus:border-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-colors placeholder:text-[#bdbdbd]";
  const labelCls =
    "block text-xs font-semibold text-[#777] mb-2";

  return (
    <div
      className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-modal-title"
    >
      <div
        className="bg-white text-[#111] w-full max-w-2xl border border-[#dcdcdc] flex flex-col max-h-[92vh] overflow-hidden"
        style={{ boxShadow: CARD_SHADOW_LG }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#e5e5e5] shrink-0 bg-linear-to-r from-[#fcfcfc] to-[#f7f7f7]">
          <div>
            <h2
              id="delivery-modal-title"
              className="text-base font-bold"
            >
              Buy and Deliver
            </h2>
            <p className="mt-1 text-sm text-[#6b6b6b] leading-relaxed">
              Confirm delivery details before payment
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 border border-[#111] bg-white font-semibold text-[#111]">
                Step 1: Address
              </span>
              <span className="text-[10px] px-2 py-1 border border-[#d8d8d8] bg-white font-semibold text-[#8f8f8f]">
                Step 2: Payment
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-[#dcdcdc] text-[#9b9b9b] hover:text-[#111] hover:border-[#111] transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-5 md:p-6 bg-[#fafafa]">
          <div className="border border-[#e5e5e5] bg-white p-4 md:p-5 mb-5">
            <div className="flex items-start gap-3">
              {(game as any).cover_image_url || game.coverImageUrl ? (
                <img
                  src={(game as any).cover_image_url || game.coverImageUrl}
                  alt={game.title}
                  className="w-12 h-15 object-cover border border-[#e5e5e5]"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[#111] leading-tight line-clamp-2">
                  {game.title}
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-1 border border-[#111] font-semibold text-[#111]">
                    Home Delivery
                  </span>
                  {discountPct > 0 && (
                    <span className="text-[10px] px-2 py-1 border border-[#f0d96a] bg-[#fff8d9] font-semibold text-[#8b6d00]">
                      -{discountPct}% Off
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-[#111] leading-none">
                  {formatNaira(effectivePrice)}
                </p>
                {originalPrice && (
                  <p className="mt-1 text-xs font-medium text-[#b1b1b1] line-through">
                    {formatNaira(originalPrice)}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-[#6b6b6b] leading-relaxed">
              We will confirm your order and contact you before dispatch.
              Delivery timeline depends on your location.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <form
            id="delivery-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="border border-[#e5e5e5] bg-white p-4 md:p-5">
              <p className="text-sm font-bold text-[#111] mb-3">
                Contact
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={inputCls}
                    placeholder="e.g. 08012345678"
                  />
                </div>
              </div>
            </div>

            <div className="border border-[#e5e5e5] bg-white p-4 md:p-5">
              <p className="text-sm font-bold text-[#111] mb-3">
                Delivery Address
              </p>
              <div>
                <label className={labelCls}>Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                  placeholder="Street address, house number..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelCls}>City *</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className={inputCls}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className={labelCls}>State *</label>
                  <input
                    required
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className={inputCls}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelCls}>Additional Notes (optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                  placeholder="Landmark, special instructions..."
                />
              </div>
            </div>
          </form>
        </div>
        <div className="p-5 md:p-6 border-t border-[#e5e5e5] shrink-0 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              form="delivery-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-64 bg-[#111] text-white font-bold py-3.5 px-6 text-sm hover:bg-neutral-800 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

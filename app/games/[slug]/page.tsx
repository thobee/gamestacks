// app/games/[id]/page.tsx
// Full game / product detail page with premium, minimalist, editorial layout

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/Toast";
import { formatNaira } from "@/lib/utils";
import { Game } from "@/lib/types";
import { useSession } from "next-auth/react";

/* ── Types ─────────────────────────────────────────────────────────── */

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
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

/* ── Helpers ────────────────────────────────────────────────────────── */

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const stars = Math.round(rating);
  const cls = size === "lg" ? "w-4.5 h-4.5" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={cls} fill={i <= stars ? "#f5c518" : "none"} stroke={i <= stars ? "#f5c518" : "#ccc"} strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </span>
  );
}

const ITEM_TYPE_ICONS: Record<string, string> = {
  "game":      "🎮",
  "console":   "🕹️",
  "gamepad":   "🎯",
  "disc":      "💿",
  "game-key":  "🔑",
  "accessory": "🎧",
};

/* ── Main Component ─────────────────────────────────────────────────── */

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { success } = useToast();

  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { data: session } = useSession();
  const [showOrderModal, setShowOrderModal] = useState(false);

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
        const cover = g.coverImageUrl || g.cover_image_url || null;
        setActiveImage(cover);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [slug, router]);

  const handleAddToCart = () => {
    if (!game) return;
    addItem(game as any);
    setAddedToCart(true);
    success(`${game.title} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <p className="text-2xl font-black text-neutral-900 tracking-tight mb-2">Product Not Found</p>
          <p className="text-sm text-neutral-500 mb-6">This item might have been removed or the link is invalid.</p>
          <Link href="/games" className="inline-block text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const coverImage = game.coverImageUrl || (game as any).cover_image_url;
  const screenshots = game.screenshotsUrls || (game as any).screenshots_urls || [];
  const allImages = [coverImage, ...screenshots].filter(Boolean) as string[];
  const effectivePrice = game.salePrice ?? game.priceNaira ?? (game as any).price_naira;
  const originalPrice = game.salePrice ? (game.priceNaira ?? (game as any).price_naira) : null;
  const discountPct = originalPrice
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

  const hasSystemReqs =
    game.systemRequirementsCpu ||
    game.systemRequirementsRam ||
    game.systemRequirementsGpu ||
    game.systemRequirementsStorage ||
    (game as any).system_requirements_cpu ||
    (game as any).system_requirements_ram ||
    (game as any).system_requirements_gpu ||
    (game as any).system_requirements_storage_gb;

  const cpu = game.systemRequirementsCpu || (game as any).system_requirements_cpu;
  const ram = game.systemRequirementsRam || (game as any).system_requirements_ram;
  const gpu = game.systemRequirementsGpu || (game as any).system_requirements_gpu;
  const storage = game.systemRequirementsStorage || (game as any).system_requirements_storage_gb;
  const itemTypeIcon = ITEM_TYPE_ICONS[game.itemType || (game as any).item_type || "game"] || "🎮";

  const genres: string[] = game.genres || [];
  const reviews: Review[] = game.reviews || [];
  const relatedGames: RelatedGame[] = game.relatedGames || [];

  const isPhysical = ["console", "gamepad", "disc", "accessory"].includes(game.itemType || (game as any).item_type);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased selection:bg-red-600 selection:text-white">
      
      {/* ── Main Details Grid ── */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── Left Column: Game Details (col-span-8) ── */}
          <section className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Game Cover & Media Gallery */}
              <div className="w-full md:w-1/3 flex-shrink-0 space-y-4">
                <div 
                  className="rounded-lg overflow-hidden shadow-sm border border-neutral-200 relative cursor-zoom-in group"
                  onClick={() => setLightboxOpen(true)}
                >
                  {activeImage ? (
                    <img alt={game.title} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" src={activeImage} />
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center text-neutral-300 text-5xl bg-neutral-50">🎮</div>
                  )}
                  {discountPct > 0 && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      -{discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Media Gallery (Thumbnails) */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allImages.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(url)}
                        className={`shrink-0 rounded overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                          activeImage === url
                            ? "border-red-600 scale-95"
                            : "border-neutral-200 hover:border-neutral-350"
                        }`}
                        style={{ width: 64, height: 48 }}
                      >
                        <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-grow">
                <h1 className="text-4xl font-bold mb-4 text-neutral-900">{game.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {game.platform || "PC Offline"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-semibold text-neutral-900">{formatNaira(effectivePrice)}</span>
                    {originalPrice && (
                      <span className="text-lg text-neutral-400 line-through font-medium">{formatNaira(originalPrice)}</span>
                    )}
                  </div>
                  {game.rating > 0 && (
                    <div className="flex items-center gap-1.5 ml-auto text-yellow-500 bg-neutral-50 px-3 py-1.5 rounded text-sm font-bold border border-neutral-200">
                      <StarRating rating={game.rating} />
                      <span className="text-neutral-900">{game.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-neutral-500 text-sm mb-6">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Highly anticipated item.</span>
                </div>

                <div className="space-y-4 text-neutral-600 leading-relaxed text-sm mb-8 whitespace-pre-line">
                  {game.longDescription || game.description || "No description available."}
                </div>

                {/* Metadata Table */}
                <div className="border-t border-neutral-200 pt-6">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    {genres.length > 0 && (
                      <>
                        <div className="text-neutral-400 uppercase tracking-wider font-semibold">Genre:</div>
                        <div className="text-neutral-700">{genres.join(", ")}</div>
                      </>
                    )}
                    
                    <div className="text-neutral-400 uppercase tracking-wider font-semibold">Platform:</div>
                    <div className="text-neutral-700 flex items-center gap-2">
                      <span className="bg-neutral-100 px-1 rounded text-[10px] text-neutral-700">Hub</span> {game.platform || "PC"}
                    </div>

                    {game.deliveryType && (
                      <>
                        <div className="text-neutral-400 uppercase tracking-wider font-semibold">Delivery Type:</div>
                        <div className="text-neutral-700">{game.deliveryType}</div>
                      </>
                    )}

                    {game.region && (
                      <>
                        <div className="text-neutral-400 uppercase tracking-wider font-semibold">Region:</div>
                        <div className="text-neutral-700">{game.region}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* System Requirements Section */}
                {hasSystemReqs && (
                  <div className="border-t border-neutral-200 pt-6 mt-6">
                    <h3 className="text-neutral-400 uppercase tracking-wider font-semibold mb-4 text-sm">System Requirements</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      {cpu && (
                        <>
                          <div className="text-neutral-400">CPU:</div>
                          <div className="text-neutral-700">{cpu}</div>
                        </>
                      )}
                      {gpu && (
                        <>
                          <div className="text-neutral-400">GPU:</div>
                          <div className="text-neutral-700">{gpu}</div>
                        </>
                      )}
                      {ram && (
                        <>
                          <div className="text-neutral-400">RAM:</div>
                          <div className="text-neutral-700">{ram}</div>
                        </>
                      )}
                      {(game.systemRequirementsOs || (game as any).system_requirements_os) && (
                        <>
                          <div className="text-neutral-400">OS:</div>
                          <div className="text-neutral-700">{game.systemRequirementsOs || (game as any).system_requirements_os}</div>
                        </>
                      )}
                      {storage && (
                        <>
                          <div className="text-neutral-400">Storage:</div>
                          <div className="text-neutral-700">{storage} GB</div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Main CTA */}
                <div className="mt-10 flex flex-wrap gap-4">
                  {isPhysical ? (
                    <>
                      <button 
                        onClick={() => {
                          if (!session) router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname));
                          else setShowOrderModal(true);
                        }}
                        className="w-full md:w-auto px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded transition-colors uppercase tracking-wider"
                      >
                        Order Now
                      </button>
                      <button 
                        onClick={handleAddToCart}
                        className={`w-full md:w-auto px-10 py-4 font-extrabold text-sm rounded transition-colors uppercase tracking-wider ${
                          addedToCart ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-yellow-400 hover:bg-yellow-500 text-black"
                        }`}
                      >
                        {addedToCart ? "Added to Cart" : "Add to Cart"}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleAddToCart}
                      className={`w-full md:w-auto px-16 py-4 font-extrabold text-lg rounded-sm transition-colors uppercase ${
                        addedToCart ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-yellow-400 hover:bg-yellow-500 text-black"
                      }`}
                    >
                      {addedToCart ? "Added to Cart" : "Add to Cart"}
                    </button>
                  )}
                </div>

              </div>
            </div>
          </section>

          {/* ── Right Column: Similar Games (col-span-4) ── */}
          <aside className="lg:col-span-4">
            <h2 className="text-2xl font-bold mb-6 border-b border-neutral-200 pb-4 text-neutral-900">Similar Games</h2>
            
            {relatedGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                {relatedGames.slice(0, 6).map((rg) => {
                  const effectiveRgPrice = rg.sale_price ?? rg.price_naira;
                  return (
                    <div key={rg.id} className="bg-white rounded overflow-hidden border border-neutral-200 group hover:border-neutral-300 hover:shadow-sm transition-all flex flex-col">
                      <Link href={`/games/${rg.slug}`} className="relative aspect-[3/4] block">
                        {rg.cover_image_url ? (
                          <img alt={rg.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={rg.cover_image_url} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-neutral-50">🎮</div>
                        )}
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">
                          {rg.platform || "PC"}
                        </span>
                      </Link>
                      <div className="p-3 flex flex-col flex-grow justify-between">
                        <div>
                          <Link href={`/games/${rg.slug}`}>
                            <h3 className="font-bold text-[13px] leading-tight mb-1.5 line-clamp-2 text-neutral-900 hover:text-red-600 transition-colors" title={rg.title}>
                              {rg.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] mb-3">
                            <span className="uppercase font-semibold tracking-wider truncate">{rg.category || "Game"}</span>
                            {rg.genres && rg.genres.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-neutral-500 truncate">{rg.genres.slice(0, 2).join(", ")}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-end justify-between mt-1 pt-3 border-t border-neutral-100">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-neutral-400 font-medium uppercase tracking-widest mb-0.5">Price</span>
                            <span className="font-bold text-[13px] text-neutral-900 leading-none">{formatNaira(effectiveRgPrice)}</span>
                          </div>
                          <button 
                            onClick={() => addItem(rg as any)}
                            className="bg-red-600 text-white text-[9px] font-bold px-2.5 py-1.5 rounded uppercase tracking-wider hover:bg-red-700 transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No similar games found.</p>
            )}
          </aside>

        </div>
      </main>

      {/* ── Image Lightbox ── */}
      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          <img
            src={activeImage}
            alt={game.title}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl transition-transform"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Purchase modal ── */}
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

/* ── Custom Layout components ────────────────────────────────────────── */

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900 pb-3 border-b border-neutral-100">
      {title}
    </h3>
  );
}

function RequirementCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-4.5 border-b border-neutral-100 last:border-0">
      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-neutral-800 leading-snug break-words">{value}</p>
      </div>
    </div>
  );
}

function DeliveryDetailsModal({ game, session, onClose }: { game: GameDetail; session: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: session.user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formattedAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`;
      const payload = {
        items: [{ gameId: game.id }],
        customerFullName: formData.fullName,
        customerEmail: session.user?.email || "guest@example.com",
        customerPhone: formData.phone,
        deliveryMethod: "home",
        deliveryAddress: formattedAddress,
        notes: formData.notes
      };

      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to initialize payment");

      window.location.href = data.data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white text-neutral-900 w-full max-w-md rounded-2xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">📦 Delivery Details</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors text-xl">✕</button>
        </div>
        
        <div className="overflow-y-auto p-5 custom-scrollbar">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-655 text-sm font-medium">{error}</div>}
          
          <form id="delivery-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
              <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-neutral-400" placeholder="Your full name" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">Phone Number *</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-neutral-400" placeholder="e.g. 08012345678" />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">Delivery Address *</label>
              <textarea required rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-neutral-400 resize-none" placeholder="Street address, house number..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">City *</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-neutral-400" placeholder="City" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">State *</label>
                <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-neutral-400" placeholder="State" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">Country *</label>
              <select required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none cursor-pointer">
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">Additional Notes (optional)</label>
              <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-neutral-400 resize-none" placeholder="Landmark, special instructions..." />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-neutral-100 shrink-0 bg-neutral-50 rounded-b-2xl">
          <button form="delivery-form" type="submit" disabled={isSubmitting} className="w-full bg-yellow-400 hover:bg-yellow-350 text-black font-extrabold py-3.5 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm">
            {isSubmitting ? "Processing..." : "Continue to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
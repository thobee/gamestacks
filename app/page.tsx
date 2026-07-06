"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useCollection } from "@/hooks/useCollection";
import { GameGrid } from "@/components/GameGrid";
import { HomepageSection, Game } from "@/lib/types";

/* ── Hero slides ─────────────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    image: "/cyberpunk.png",
    tag: "MOST POPULAR",
    title: "Cyberpunk 2077",
    subtitle: "Experience Night City in stunning detail. Includes all DLCs, offline installer, and step-by-step setup guide.",
    price: "₦18,500",
  },
  {
    image: "/eldenring.png",
    tag: "BEST RPG",
    title: "Elden Ring",
    subtitle: "FromSoftware's masterpiece. Explore the Lands Between with our optimized PC offline build — runs even on 8GB RAM.",
    price: "₦22,000",
  },
  {
    image: "/fifa25.jpg",
    tag: "NEW RELEASE",
    title: "EA FC 25",
    subtitle: "The ultimate football experience. Updated squads, Nigerian league support, and instant digital delivery.",
    price: "₦12,500",
  },
];

/* ── Trust bar ────────────────────────────────────────────────────────── */
const TRUST_FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Official Games",
    desc: "100% genuine licenses",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
    title: "Lifetime Access",
    desc: "Buy once, play forever",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    title: "Direct Downloads",
    desc: "High-speed CDN links",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Install Guides",
    desc: "Step-by-step tutorials",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-2.25h7.5" />
      </svg>
    ),
    title: "Home Delivery",
    desc: "Flash drive / disc shipping",
  },
];

/* ── Category grid ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { name: "PC Games",     sub: "Offline & Online Access",   href: "/games?category=PC+Offline",  dark: true  },
  { name: "PlayStation",  sub: "Consoles & Digital Codes",  href: "/games?category=PlayStation",  dark: false },
  { name: "Gamepads",     sub: "Wired & Wireless",          href: "/games?category=Gamepads",     dark: true  },
  { name: "Accessories",  sub: "Headsets & More",           href: "/games?category=Accessories",  dark: false },
];

/* ── Why us ──────────────────────────────────────────────────────────── */
const WHY_US = [
  { icon: "🔐", title: "Secure Payments",  desc: "Paystack-powered. Bank-grade encryption on every transaction." },
  { icon: "💬", title: "24/7 Support",     desc: "Real humans — not bots — available around the clock to help." },
  { icon: "🎁", title: "Loyalty Rewards",  desc: "Earn points on every purchase. Redeem for discounts." },
];

/* ── Stats ──────────────────────────────────────────────────────────── */
const STATS = [
  { value: "10,000+", label: "Happy Gamers" },
  { value: "500+",    label: "Game Titles" },
  { value: "99.9%",   label: "Uptime" },
  { value: "24h",     label: "Delivery Speed" },
];

/* ── Collection section ─────────────────────────────────────────────── */
function CollectionSection({
  section,
  onAddToCart,
}: {
  section: HomepageSection;
  onAddToCart: (game: Game) => void;
}) {
  const { games, loading } = useCollection(section.key, 8);
  if (!loading && games.length === 0) return null;

  const subtitleMap: Record<string, string> = {
    "best-sellers":   "Most purchased this week",
    "new-releases":   "Freshly added to the catalog",
    "discounts":      "Limited-time price drops",
    "featured":       "Handpicked top titles",
    "editors-choice": "Recommended by our editors",
    "coming-soon":    "Upcoming releases",
    "staff-picks":    "Loved by the Gamestacks team",
    "weekend-deals":  "Weekend only — prices drop soon",
    "under-10000":    "Great games, wallet-friendly prices",
    "under-20000":    "Premium titles under ₦20,000",
    "under-5000":     "Budget picks under ₦5,000",
    "top-rated":      "Highest rated by our community",
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-16 pt-16 pb-6">
      {/* Section header */}
      <div className="flex justify-between items-end border-b border-black/10 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#111] uppercase">
            {section.label}
          </h2>
          {subtitleMap[section.key] && (
            <p className="text-[11px] mt-1 text-[#999] font-bold uppercase tracking-[0.08em]">
              {subtitleMap[section.key]}
            </p>
          )}
        </div>
        <Link
          href={`/games?collection=${section.key}`}
          className="hidden md:inline-flex items-center gap-1 text-[11px] font-black text-[#111] uppercase tracking-[0.08em] hover:opacity-50 transition-opacity no-underline"
        >
          VIEW ALL <span className="text-sm ml-0.5">→</span>
        </Link>
      </div>

      <GameGrid games={games} onAddToCart={onAddToCart} cols={4} loading={loading} />

      <div className="text-center mt-6 md:hidden">
        <Link
          href={`/games?collection=${section.key}`}
          className="inline-flex items-center gap-1 text-[11px] font-black text-[#111] uppercase tracking-[0.08em] no-underline"
        >
          VIEW ALL →
        </Link>
      </div>
    </section>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function Home() {
  const { addItem } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { sections, loading: sectionsLoading } = useHomepageSections();

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#f8f9fa]" style={{ paddingTop: 64 }}>

      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track { animation: tickerScroll 28s linear infinite; }
        .kinetic-cat {
          transition: all 0.25s ease;
        }
        .kinetic-cat:hover .cat-label-arrow { opacity: 1; transform: translateX(0); }
        .cat-label-arrow { opacity: 0; transform: translateX(-6px); transition: all 0.22s ease; }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-white">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <Image src={s.image} alt={s.title} fill className="object-cover object-center" priority={i === 0} />
          </div>
        ))}

        {/* Left-to-right gradient — white bleeds from left */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to right, rgba(255,255,255,1) 30%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0) 90%)" }} />
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to top, rgba(255,255,255,0.25) 0%, transparent 50%)" }} />

        {/* Content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-16 w-full py-20">
          <div key={currentSlide} className="max-w-xl" style={{ animation: "heroFadeIn 0.65s ease-out forwards" }}>
            <span className="inline-block bg-[#111] text-white px-4 py-1.5 text-[10px] font-black tracking-[0.15em] uppercase mb-5">
              {slide.tag}
            </span>
            <h1 className="text-5xl md:text-[72px] font-black text-[#111] leading-[1.0] tracking-tight mb-4">
              {slide.title}
            </h1>
            <p className="text-base text-[#555] mb-3 max-w-md leading-relaxed font-medium">
              {slide.subtitle}
            </p>
            <div className="text-[28px] font-black text-[#111] mb-8">{slide.price}</div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 text-[11px] font-black tracking-[0.1em] uppercase no-underline border-2 border-[#111] hover:bg-white hover:text-[#111] transition-all duration-150 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v.75a.75.75 0 01-1.5 0v-.75a1.5 1.5 0 00-3 0v.75a.75.75 0 01-1.5 0v-.75z" clipRule="evenodd" />
                </svg>
                SHOP NOW
              </Link>
              <Link
                href="#collections"
                className="inline-flex items-center gap-2 px-8 py-4 text-[11px] font-black tracking-[0.1em] uppercase text-[#111] border-2 border-[#111] no-underline hover:bg-[#111] hover:text-white transition-all duration-150 active:scale-[0.98]"
              >
                BROWSE CATALOG
              </Link>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 h-[2px] rounded-full ${i === currentSlide ? "w-10 bg-[#111]" : "w-4 bg-[#111]/20"}`}
            />
          ))}
        </div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────── */}
      <div className="bg-[#111] text-white py-3 overflow-hidden">
        <div className="flex whitespace-nowrap ticker-track">
          {[0, 1].map((r) => (
            <div key={r} className="flex shrink-0">
              {["OFFICIAL GAMES", "LIFETIME ACCESS", "DIRECT DOWNLOADS", "INSTALL GUIDES", "HOME DELIVERY", "24/7 SUPPORT", "PAYSTACK SECURE", "NIGERIA'S #1 GAME STORE"].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-5 px-6 text-[10px] font-black tracking-[0.16em] uppercase">
                  <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUST BAR ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-black/8 py-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10">
            {TRUST_FEATURES.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2.5 group cursor-default">
                <div className="w-11 h-11 flex items-center justify-center border border-black/10 bg-[#f5f5f5] text-[#111] group-hover:bg-[#111] group-hover:text-white group-hover:border-[#111] transition-all duration-200">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[11px] font-black tracking-[0.1em] uppercase text-[#111]">{f.title}</p>
                  <p className="text-[11px] text-[#999] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DYNAMIC COLLECTION SECTIONS ─────────────────────────── */}
      <div id="collections" className="bg-[#f8f9fa]">
        {sectionsLoading ? (
          <section className="max-w-[1440px] mx-auto px-4 md:px-16 pt-16 pb-6">
            <div className="border-b border-black/10 pb-4 mb-6">
              <div className="h-6 w-48 bg-black/6 animate-pulse rounded-sm" />
              <div className="h-3 w-32 bg-black/4 animate-pulse rounded-sm mt-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-[#e5e5e5]" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.04)" }}>
                  <div className="aspect-[3/4] bg-[#f0f0f0] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-16 bg-[#ebebeb] animate-pulse rounded-sm" />
                    <div className="h-4 w-full bg-[#ebebeb] animate-pulse rounded-sm" />
                    <div className="h-5 w-20 bg-[#ebebeb] animate-pulse rounded-sm mt-2" />
                  </div>
                  <div className="h-11 bg-[#ebebeb] animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        ) : (
          sections.map((section) => (
            <CollectionSection key={section.key} section={section} onAddToCart={addItem} />
          ))
        )}
      </div>

      {/* ── BROWSE BY CATEGORY ──────────────────────────────────── */}
      <section className="bg-[#f3f4f5] border-y border-black/8 py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-16">
          {/* Header */}
          <div className="flex justify-between items-end border-b border-black/10 pb-4 mb-8">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#111] uppercase">Browse by Category</h2>
            <Link href="/games" className="hidden md:block text-[11px] font-black text-[#111] uppercase tracking-[0.08em] hover:opacity-50 transition-opacity no-underline">
              All Products →
            </Link>
          </div>

          {/* 4-card grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className={`kinetic-cat group relative flex flex-col justify-end h-48 overflow-hidden no-underline border ${
                  cat.dark
                    ? "bg-[#111] border-[#111]"
                    : "bg-white border-[#e5e5e5] hover:border-[#111]"
                } transition-all duration-200`}
                style={cat.dark ? {} : { boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.04)" }}
              >
                <div className="p-5">
                  <h3 className={`text-base font-black uppercase tracking-tight ${cat.dark ? "text-white" : "text-[#111]"}`}>
                    {cat.name}
                  </h3>
                  <p className={`text-[11px] font-semibold mt-0.5 ${cat.dark ? "text-white/50" : "text-[#999]"}`}>
                    {cat.sub}
                  </p>
                  <p className={`cat-label-arrow text-[10px] font-black uppercase tracking-[0.08em] mt-3 ${cat.dark ? "text-white/60" : "text-[#111]/60"}`}>
                    SHOP NOW →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY GAMESTACKS ─────────────────────────────────────── */}
      <section className="bg-white border-b border-black/8 py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.18em] uppercase text-[#bbb] mb-2">Our Promise</p>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#111] uppercase">Why Choose Gamestacks?</h2>
          </div>
          {/* 3 bordered panels */}
          <div className="grid sm:grid-cols-3 border border-black/10 divide-y sm:divide-y-0 sm:divide-x divide-black/10">
            {WHY_US.map((item, i) => (
              <div key={i} className="group p-8 md:p-10 hover:bg-[#111] transition-colors duration-200 cursor-default">
                <span className="text-3xl mb-5 block">{item.icon}</span>
                <h3 className="font-black text-sm uppercase tracking-tight text-[#111] mb-2 group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#888] group-hover:text-white/60 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section className="bg-[#111] text-white py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] uppercase text-white/30 mb-4">Premium Gaming Marketplace</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.0] mb-6">
                YOUR GAME,<br />YOUR RULES.
              </h2>
              <p className="text-sm text-white/50 mb-10 max-w-md leading-relaxed">
                Join thousands of Nigerian gamers who trust Gamestacks for fast, affordable, and authentic game keys delivered instantly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 bg-white text-[#111] px-8 py-4 text-[11px] font-black tracking-[0.1em] uppercase no-underline hover:bg-[#f5f5f5] transition-all duration-150 active:scale-[0.98]"
                >
                  EXPLORE ALL GAMES →
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 border-2 border-white/20 text-white px-8 py-4 text-[11px] font-black tracking-[0.1em] uppercase no-underline hover:border-white hover:bg-white hover:text-[#111] transition-all duration-150 active:scale-[0.98]"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            </div>

            {/* Right stats grid */}
            <div className="hidden md:grid grid-cols-2 gap-px bg-white/10">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-[#111] p-8 hover:bg-white/5 transition-colors cursor-default">
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/30">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-black/8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
                  <rect width="34" height="34" rx="8" fill="#111111"/>
                  <rect x="5.5" y="13.5" width="5" height="7" rx="1.2" fill="white"/>
                  <rect x="14.5" y="13.5" width="5" height="7" rx="1.2" fill="white"/>
                  <rect x="8.5" y="10.5" width="7" height="5" rx="1.2" fill="white"/>
                  <rect x="8.5" y="18.5" width="7" height="5" rx="1.2" fill="white"/>
                  <circle cx="25.5" cy="13" r="2" fill="white"/>
                  <circle cx="28.5" cy="17" r="2" fill="white"/>
                  <circle cx="25.5" cy="21" r="2" fill="white"/>
                  <circle cx="22.5" cy="17" r="2" fill="white"/>
                </svg>
                <span className="text-[13px] font-black tracking-[0.12em] text-[#111] uppercase">GAMESTACKS</span>
              </div>
              <p className="text-[13px] text-[#999] leading-relaxed mb-6 max-w-[200px]">
                Nigeria's premium destination for PC games and gaming accessories.
              </p>
              <div className="flex gap-2">
                {[
                  <svg key="web" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>,
                  <svg key="email" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>,
                  <svg key="phone" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>,
                ].map((icon, idx) => (
                  <a key={idx} href="#" className="w-8 h-8 flex items-center justify-center border border-black/10 text-[#999] hover:text-[#111] hover:border-[#111] transition-all">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-[10px] font-black tracking-[0.14em] uppercase text-[#111] mb-5">Shop</h4>
              <ul className="space-y-3">
                {[
                  ["All Games",    "/games"],
                  ["New Releases", "/games?collection=new-releases"],
                  ["Best Sellers", "/games?collection=best-sellers"],
                  ["PC Offline",   "/games?category=PC+Offline"],
                  ["PlayStation",  "/games?category=PlayStation"],
                  ["Gamepads",     "/games?category=Gamepads"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-[13px] text-[#888] hover:text-[#111] transition-colors no-underline font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-[10px] font-black tracking-[0.14em] uppercase text-[#111] mb-5">Support</h4>
              <ul className="space-y-3">
                {["Help Center", "Contact Us", "Shipping Policy", "Returns & Refunds", "Privacy Policy", "Terms of Service"].map((label) => (
                  <li key={label}>
                    <a href="#" className="text-[13px] text-[#888] hover:text-[#111] transition-colors no-underline font-medium">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-[10px] font-black tracking-[0.14em] uppercase text-[#111] mb-5">Newsletter</h4>
              <p className="text-[13px] text-[#999] mb-5 leading-relaxed">Get the latest drops and exclusive deals in your inbox.</p>
              <div className="flex border border-black/15 focus-within:border-[#111] transition-colors">
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-transparent border-none outline-none text-[13px] text-[#111] placeholder-[#ccc] px-3 py-3 flex-1 min-w-0 font-medium"
                />
                <button className="bg-[#111] text-white px-4 text-sm font-black hover:bg-black transition-colors cursor-pointer border-none">
                  →
                </button>
              </div>
              <p className="text-[11px] text-[#ccc] mt-2">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/8">
          <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-[#bbb] font-medium tracking-wide">© 2026 GAMESTACKS NIGERIA. ALL RIGHTS RESERVED.</span>
            <span className="text-[11px] text-[#bbb] font-medium">MADE WITH ❤️ FOR NIGERIAN GAMERS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
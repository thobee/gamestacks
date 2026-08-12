"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-black/8 w-full mt-24">
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
              <span className="text-sm font-bold text-[#111]">Gamestacks</span>
            </div>
            <p className="text-[13px] text-[#999] leading-relaxed mb-6 max-w-[200px]">
              Nigeria&apos;s premium destination for PC games and gaming accessories.
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
            <h4 className="text-sm font-bold text-[#111] mb-5">Shop</h4>
            <ul className="space-y-3 p-0 list-none">
              {[
                ["All Games",    "/games"],
                ["New Releases", "/games?collection=new-releases"],
                ["Best Sellers", "/games?collection=best-sellers"],
                ["PC",           "/games?category=PC"],
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
            <h4 className="text-sm font-bold text-[#111] mb-5">Support</h4>
            <ul className="space-y-3 p-0 list-none">
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
            <h4 className="text-sm font-bold text-[#111] mb-5">Newsletter</h4>
            <p className="text-[13px] text-[#999] mb-5 leading-relaxed">Get the latest drops and exclusive deals in your inbox.</p>
            <div className="flex border border-black/15 focus-within:border-[#111] transition-colors">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-none outline-none text-[13px] text-[#111] placeholder-[#ccc] px-3 py-3 flex-1 min-w-0 font-medium"
              />
              <button className="bg-[#111] text-white px-4 text-sm font-bold hover:bg-black transition-colors cursor-pointer border-none">
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
          <span className="text-xs text-[#bbb] font-medium">© 2026 Gamestacks Nigeria. All rights reserved.</span>
          <span className="text-xs text-[#bbb] font-medium">Made with ❤️ for Nigerian gamers</span>
        </div>
      </div>
    </footer>
  );
}

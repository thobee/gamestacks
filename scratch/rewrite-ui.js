const fs = require('fs');

const path = "C:/Users/DELL/Documents/GAME/gamestacks/app/games/[slug]/page.tsx";
const content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');

const newUI = `      {/* ── Main Details Grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[300px_1fr_320px] gap-8 lg:gap-10 items-start">

          {/* Left Column: Media */}
          <div className="space-y-6">
            <div
              className="relative w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 cursor-zoom-in aspect-[3/4] shadow-sm shadow-neutral-100/50 hover:shadow-md transition-shadow duration-300"
              onClick={() => setLightboxOpen(true)}
            >
              {activeImage ? (
                <img src={activeImage} alt={game.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <span className="text-7xl">🎮</span>
                </div>
              )}
              {discountPct > 0 && (
                <div className="absolute top-4 left-4 bg-[#E50914] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                  -{discountPct}% OFF
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(url)}
                    className={\`shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer \${
                      activeImage === url
                        ? "border-neutral-900 scale-95"
                        : "border-neutral-100 hover:border-neutral-300"
                    }\`}
                    style={{ width: 56, height: 42 }}
                  >
                    <img src={url} alt={\`View \${i + 1}\`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {screenshots.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Media Gallery</h3>
                <div className="grid grid-cols-2 gap-2">
                  {screenshots.slice(0, 4).map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImage(url); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="rounded-xl overflow-hidden border border-neutral-100 hover:border-neutral-350 transition duration-200 cursor-pointer aspect-video"
                    >
                      <img src={url} alt={\`Screenshot \${i + 1}\`} className="w-full h-full object-cover transition-transform duration-305 hover:scale-105" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Middle Column: Details & Action */}
          <div className="space-y-6 lg:border-r lg:border-neutral-100 lg:pr-8 xl:pr-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                  {game.platform || "Platform"}
                </span>
                {game.category && (
                  <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                    {game.category}
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-neutral-900 leading-tight mb-4">
                {game.title}
              </h1>
              
              <div className="flex items-center gap-4 border-b border-neutral-100 pb-5 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#E50914]">{formatNaira(effectivePrice)}</span>
                  {originalPrice && (
                    <span className="text-sm text-neutral-400 line-through font-bold">{formatNaira(originalPrice)}</span>
                  )}
                </div>
                {game.rating > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-bold ml-auto bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                    <StarRating rating={game.rating} />
                    <span>{game.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {game.deliveryType && (
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex items-center gap-3">
                    <span className="text-xl">📦</span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Delivery</p>
                      <p className="text-xs font-bold text-neutral-800">{game.deliveryType}</p>
                    </div>
                  </div>
                )}
                {game.region && (
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex items-center gap-3">
                    <span className="text-xl">🌍</span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Region</p>
                      <p className="text-xs font-bold text-neutral-800">{game.region}</p>
                    </div>
                  </div>
                )}
                {game.developerName && (
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex items-center gap-3">
                    <span className="text-xl">🛠️</span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Developer</p>
                      <p className="text-xs font-bold text-neutral-800 truncate">{game.developerName}</p>
                    </div>
                  </div>
                )}
                {game.fileSizeGb && (
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex items-center gap-3">
                    <span className="text-xl">💾</span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Size</p>
                      <p className="text-xs font-bold text-neutral-800">{game.fileSizeGb} GB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isPhysical ? (
                <>
                  <button
                    onClick={() => {
                      if (!session) {
                        router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname));
                      } else {
                        setShowOrderModal(true);
                      }
                    }}
                    className="flex-1 py-4 bg-[#E50914] hover:bg-[#c40810] active:scale-95 text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-150 shadow-md shadow-red-500/20"
                  >
                    Order Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className={\`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition duration-150 active:scale-95 border \${
                      addedToCart
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-900 hover:shadow-lg hover:shadow-neutral-900/20"
                    }\`}
                  >
                    {addedToCart ? "Added!" : "Add to Cart"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className={\`w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl transition duration-150 active:scale-95 border \${
                    addedToCart
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-[#E50914] hover:bg-[#c40810] text-white border-[#E50914] shadow-md shadow-red-500/20"
                  }\`}
                >
                  {addedToCart ? "Added to Cart!" : "Add to Cart"}
                </button>
              )}
            </div>

            <div className="pt-6 border-t border-neutral-100">
              <p className="text-[13px] text-neutral-600 leading-relaxed font-normal whitespace-pre-line line-clamp-[8]">
                {game.longDescription || game.description || "No description available."}
              </p>
            </div>

            {/* Hardware Checklist */}
            {hasSystemReqs && (
              <div className="pt-6 border-t border-neutral-100">
                <h4 className="text-[10px] font-black tracking-widest uppercase text-neutral-400 mb-4">
                  System Requirements
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {cpu && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">CPU</p>
                      <p className="text-[11px] font-bold text-neutral-800 leading-snug">{cpu}</p>
                    </div>
                  )}
                  {gpu && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">GPU</p>
                      <p className="text-[11px] font-bold text-neutral-800 leading-snug">{gpu}</p>
                    </div>
                  )}
                  {ram && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">RAM</p>
                      <p className="text-[11px] font-bold text-neutral-800 leading-snug">{ram}</p>
                    </div>
                  )}
                  {(game.systemRequirementsOs || (game as any).system_requirements_os) && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">OS</p>
                      <p className="text-[11px] font-bold text-neutral-800 leading-snug">{game.systemRequirementsOs || (game as any).system_requirements_os}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recommended Products Sidebar */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pb-3 border-b border-neutral-100">
              Similar Games
            </h3>
            
            <div className="space-y-4">
              {relatedGames.slice(0, 5).map((rg) => {
                const effectiveRgPrice = rg.sale_price ?? rg.price_naira;
                return (
                  <div key={rg.id} className="flex gap-4 items-center pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                    <Link href={\`/games/\${rg.slug}\`} className="shrink-0 w-[72px] aspect-[3/4] bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden block group">
                      {rg.cover_image_url ? (
                        <img src={rg.cover_image_url} alt={rg.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xl">🎮</div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Link href={\`/games/\${rg.slug}\`} className="text-xs font-bold text-neutral-800 hover:text-blue-650 transition-colors line-clamp-2 leading-snug">
                        {rg.title}
                      </Link>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-black text-neutral-900">{formatNaira(effectiveRgPrice)}</p>
                        <button 
                          onClick={() => addItem(rg as any)}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 p-1.5 rounded-md transition-colors"
                          title="Quick Add"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>`;

// Find where Main Details Grid starts (line 186 in 1-based index)
const startIndex = lines.findIndex(l => l.includes('{/* ── Main Details Grid ── */}'));
// Find where Similar Games block ends (div before {/* ── Image Lightbox ── */})
const endIndex = lines.findIndex(l => l.includes('{/* ── Image Lightbox ── */}'));

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex, newUI);
  fs.writeFileSync(path, lines.join('\\n'));
  console.log("UI Successfully updated!");
} else {
  console.log("Could not find start or end index", startIndex, endIndex);
}

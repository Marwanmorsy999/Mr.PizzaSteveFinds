import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const IG = "https://ig.me/m/mr.pizzastevefinds";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string;
  images?: string[]; condition?: string; description?: string;
}

export const Route = createFileRoute("/product/$id")({ component: ProductPage });

const CONDITION_COLORS: Record<string, { badge: string; border: string }> = {
  "Deadstock": { badge: "bg-emerald-500/20 text-emerald-400", border: "border-emerald-500" },
  "Excellent": { badge: "bg-blue-500/20 text-blue-400",    border: "border-blue-500" },
  "Great":     { badge: "bg-cyan-500/20 text-cyan-400",    border: "border-cyan-500" },
  "Good":      { badge: "bg-yellow-500/20 text-yellow-400", border: "border-yellow-500" },
  "Fair":      { badge: "bg-orange-500/20 text-orange-400", border: "border-orange-500" },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800 rounded-lg ${className}`} />;
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Skeleton className="w-28 h-4 mb-8" />
        <div className="grid md:grid-cols-2 gap-10 mt-4">
          <div>
            <Skeleton className="aspect-square rounded-2xl mb-3" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-16 h-16 rounded-lg flex-shrink-0" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-1/3 h-10" />
            <Skeleton className="w-full h-px" />
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-full h-16 mt-4" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [shared, setShared] = useState(false);

  // Swipe state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/api/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const allImages = product
    ? [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[]
    : [];

  const prevImage = useCallback(() => {
    setActiveImg(i => (i - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const nextImage = useCallback(() => {
    setActiveImg(i => (i + 1) % allImages.length);
  }, [allImages.length]);

  // Touch swipe handlers
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (allImages.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger horizontal swipe if it's more horizontal than vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) nextImage(); else prevImage();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevImage, nextImage]);

  async function handleShare() {
    const url = window.location.href;
    const title = product?.name || "Mr. Pizza Steve Finds";
    const text = `Check this out: ${title}`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  }

  if (loading) return <ProductSkeleton />;
  if (!product) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-400 mb-4">Item not found</p>
        <Link to="/shop" className="text-orange-400 hover:text-orange-300 text-sm font-bold tracking-widest">← BACK TO SHOP</Link>
      </div>
    </div>
  );

  const condStyle = product.condition ? (CONDITION_COLORS[product.condition] || { badge: "bg-zinc-700/50 text-zinc-300", border: "border-zinc-500" }) : null;
  const igMessage = encodeURIComponent(`Hi! I want to reserve: ${product.name}${product.size ? ` (Size: ${product.size})` : ""}`);
  const igLink = `${IG}?text=${igMessage}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Back + Share row */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/shop" className="text-zinc-500 hover:text-orange-400 text-sm tracking-widest inline-flex items-center gap-2 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            BACK TO SHOP
          </Link>
          <button onClick={handleShare}
            className="flex items-center gap-2 text-zinc-500 hover:text-orange-400 text-xs font-bold tracking-widest transition-colors">
            {shared ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                SHARE
              </>
            )}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image gallery with swipe */}
          <div>
            <div
              ref={imgContainerRef}
              className={`aspect-square bg-zinc-900 rounded-2xl overflow-hidden mb-3 relative select-none cursor-grab active:cursor-grabbing ${condStyle ? `ring-2 ring-offset-2 ring-offset-zinc-950 ${condStyle.border}` : ""}`}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {allImages.length > 0 ? (
                <>
                  <img
                    key={activeImg}
                    src={allImages[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-200"
                  />
                  {/* 1 of 1 badge */}
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded tracking-widest shadow-lg">
                    1 OF 1
                  </span>
                  {/* Condition badge */}
                  {product.condition && condStyle && (
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded border ${condStyle.badge} border-current`}>
                      {product.condition}
                    </span>
                  )}
                  {/* Arrow buttons (desktop) */}
                  {allImages.length > 1 && (
                    <>
                      <button onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors hidden md:flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                      </button>
                      <button onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors hidden md:flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                      </button>
                    </>
                  )}
                  {/* Dot indicators */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button key={i} onClick={() => setActiveImg(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? "bg-orange-500 w-4" : "bg-white/50 hover:bg-white/80"}`}
                          aria-label={`Image ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">{product.emoji}</div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-orange-500" : "border-zinc-700 hover:border-zinc-500"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Swipe hint on mobile */}
            {allImages.length > 1 && (
              <p className="text-zinc-600 text-xs text-center mt-2 md:hidden">← Swipe to browse →</p>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {product.tag && (
              <span className="text-orange-400 text-xs font-bold tracking-widest mb-2">{product.tag}</span>
            )}
            <h1 className="text-2xl font-black leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <span className={`text-3xl font-black ${product.status === "sold" ? "text-zinc-600" : "text-orange-400"}`}>
                {product.status === "sold" ? "SOLD" : product.price ? `${product.price} EGP` : product.priceLabel || "DM for price"}
              </span>
              {product.status === "available" && (
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-black px-2 py-1 rounded tracking-widest">
                  ONLY 1 LEFT
                </span>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3 mb-6">
              {product.size && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm w-20">Size</span>
                  <span className="bg-zinc-800 text-white text-sm font-bold px-3 py-1 rounded">{product.size}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm w-20">Condition</span>
                  {condStyle ? (
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${condStyle.badge}`}>{product.condition}</span>
                  ) : (
                    <span className="text-white text-sm">{product.condition}</span>
                  )}
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 border-l-2 border-zinc-700 pl-4">{product.description}</p>
            )}

            {product.status === "available" ? (
              <a href={igLink} target="_blank" rel="noreferrer"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-center py-4 rounded-xl tracking-widest transition-all hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 text-sm">
                DM TO RESERVE →
              </a>
            ) : (
              <div className="w-full bg-zinc-800 text-zinc-500 font-black text-center py-4 rounded-xl tracking-widest text-sm">
                SOLD OUT
              </div>
            )}

            <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="mt-3 w-full border border-zinc-700 hover:border-orange-500 text-zinc-400 hover:text-orange-400 font-bold text-center py-3 rounded-xl tracking-widest transition-colors text-sm">
              FOLLOW @mr.pizzastevefinds
            </a>

            <p className="text-zinc-600 text-xs text-center mt-4">Every piece is 1 of 1. DM fast to hold yours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

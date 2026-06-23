import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const IG = "https://ig.me/m/mr.pizzastevefinds";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string;
  images?: string[]; condition?: string; description?: string;
}

// ── Condition badge colors ───────────────────────────────────────────────────
const CONDITION_COLORS: Record<string, string> = {
  "Deadstock": "text-emerald-400 bg-emerald-900/40 border-emerald-700",
  "Excellent": "text-sky-400 bg-sky-900/40 border-sky-700",
  "Great":     "text-cyan-400 bg-cyan-900/40 border-cyan-700",
  "Good":      "text-zinc-300 bg-zinc-800 border-zinc-600",
  "Fair":      "text-yellow-400 bg-yellow-900/40 border-yellow-700",
};

export const Route = createFileRoute("/product/$id")({ component: ProductPage });

function cloudImg(url: string, width = 600) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

function ProductPage() {
  const { id } = Route.useParams();
  const cart = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const isInCart = product ? cart.items.some((item) => item.id === product.id) : false;

  function handleAddToCart() {
    if (product) {
      cart.add({
        id: product.id,
        name: product.name,
        price: product.price,
        priceLabel: product.priceLabel,
        imageUrl: product.imageUrl,
        size: product.size,
        emoji: product.emoji,
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    fetch(`${API}/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        setProduct(d);
        setLoading(false);
        // Fetch related (same tag, exclude current)
        fetch(`${API}/api/products`)
          .then(r => r.json())
          .then((all: Product[]) => {
            const rel = all
              .filter(p => p.id !== id && p.status === "available" && (!d.tag || p.tag === d.tag))
              .slice(0, 4);
            setRelated(rel.length >= 2 ? rel : all.filter(p => p.id !== id && p.status === "available").slice(0, 4));
          });
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-zinc-800 border-t-orange-400 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center flex-col gap-4">
      <p className="text-zinc-400">item not found 😔 it probably got snatched already</p>
      <Link to="/shop" className="text-zinc-100 text-sm font-bold tracking-widest hover:underline">← back to shop, find something else</Link>
    </div>
  );

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];
  const igMessage = encodeURIComponent(`Hi! I want to reserve: ${product.name}${product.size ? ` (Size: ${product.size})` : ""}`);
  const igLink = `${IG}?text=${igMessage}`;
  const condColorClass = product.condition ? (CONDITION_COLORS[product.condition] || "text-zinc-300 bg-zinc-800 border-zinc-600") : "";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Zoom overlay */}
      {zoom && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-zoom-out" onClick={() => setZoom(false)}>
          <img src={cloudImg(allImages[activeImg], 800)} alt={product.name} className="max-h-screen max-w-full object-contain" />
        </div>
      )}

      <div className="max-w-3xl mx-auto md:px-4 md:py-8">
        <div className="grid md:grid-cols-2 md:gap-6">
          {/* ── Image — swipeable carousel on mobile, thumbnails at md+ ── */}
          <div>
            <div
              className="relative aspect-[3/4] md:aspect-square bg-zinc-900 overflow-hidden"
              onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
              onTouchMove={(e) => { if (touchStart !== null) e.preventDefault(); }}
              onTouchEnd={(e) => {
                if (touchStart === null) return;
                const diff = e.changedTouches[0].clientX - touchStart;
                if (Math.abs(diff) > 30) {
                  if (diff > 0 && activeImg > 0) setActiveImg(activeImg - 1);
                  else if (diff < 0 && activeImg < allImages.length - 1) setActiveImg(activeImg + 1);
                }
                setTouchStart(null);
              }}
            >
              {allImages.length > 0
                ? <img src={cloudImg(allImages[activeImg], 800)} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-8xl">{product.emoji}</div>}

              {/* back button */}
              <Link
                to="/shop"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center bg-black/55 active:scale-90 transition-transform z-10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>

              {/* zoom icon */}
              <button onClick={() => allImages.length > 0 && setZoom(true)} className="absolute bottom-3 right-3 z-10 bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10.5" cy="10.5" r="7.5" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>

            {/* Dot indicators */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-1.5 pt-3">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${activeImg === i ? "bg-white" : "bg-zinc-600 hover:bg-zinc-500"}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnails — hidden on mobile */}
            {allImages.length > 1 && (
              <div className="hidden md:flex gap-2 overflow-x-auto px-0 pt-3 pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors active:scale-95 ${activeImg === i ? "border-zinc-200" : "border-zinc-700 hover:border-zinc-500"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col px-3 pt-4 md:px-0 md:pt-0">
            {product.condition && (
              <span className={`inline-block self-start text-xs font-bold px-2 py-0.5 border mb-3 ${condColorClass}`}>
                {product.condition}
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-black leading-[1.05] mb-2">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-3xl font-black ${product.status === "sold" ? "text-zinc-600" : "text-primary"}`}>
                {product.status === "sold"
                  ? "SOLD"
                  : product.price
                    ? product.price
                    : (product.priceLabel || "DM for price")}
              </span>
              {product.status !== "sold" && product.price ? (
                <span className="text-sm font-bold tracking-wider text-zinc-500">EGP</span>
              ) : null}
            </div>

            {/* Size */}
            {product.size && (
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-zinc-800 border border-zinc-700 text-white text-sm font-black px-4 py-1.5 tracking-widest">{product.size}</span>
              </div>
            )}

            {product.description && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 border-l-2 border-zinc-700 pl-4">
                {product.description}
              </p>
            )}

            {/* CTA */}
            {product.status === "available" ? (
              isInCart ? (
                <Link to="/cart"
                  onClick={() => {}}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-center py-3 tracking-widest transition-colors text-xs mb-2 block">
                  ADDED! VIEW CART →
                </Link>
              ) : (
                <button onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-secondary active:scale-95 text-primary-foreground font-black text-center py-3 tracking-widest transition-colors text-xs mb-2">
                  ADD TO CART
                </button>
              )
            ) : (
              <div className="w-full bg-zinc-800 text-zinc-500 font-black text-center py-3 tracking-widest text-xs mb-2">
                GONE 💀 (someone was faster than u)
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="px-4 md:px-0 mt-16">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-sm font-black tracking-widest">don't sleep on these either 👇</h2>
              <Link to="/shop" className="text-zinc-100 hover:text-zinc-100 active:scale-95 text-xs font-bold tracking-widest transition-colors">
                VIEW ALL →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group active:scale-95 transition-transform duration-100">
                  <div className="aspect-square bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden mb-2 hover:border-zinc-650 transition-colors">
                    {p.imageUrl
                      ? <img src={cloudImg(p.imageUrl ?? '')} alt={p.name} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">{p.emoji}</div>}
                  </div>
                  <p className="text-white text-xs font-bold line-clamp-2 group-hover:underline mb-1">{p.name}</p>
                  <p className="text-zinc-100 text-xs font-black">
                    {p.price ? (
                      <>
                        {p.price}{" "}
                        <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
                      </>
                    ) : (
                      "DM"
                    )}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
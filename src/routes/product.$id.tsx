import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const IG = "https://ig.me/m/mr.pizzastevefinds";
const SITE_URL = "https://mrpizzastevefinds.com";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string;
  images?: string[]; condition?: string; description?: string;
}

export const Route = createFileRoute("/product/$id")({
  // Loader fetches product server-side so head() can use real data
  loader: async ({ params }) => {
    try {
      const res = await fetch(`${API}/api/products/${params.id}`);
      if (!res.ok) return null;
      return (await res.json()) as Product;
    } catch {
      return null;
    }
  },
  head: ({ loaderData: product }) => {
    if (!product) return { meta: [{ title: "Item Not Found – Mr. Pizza Steve Finds" }] };
    const title = `${product.name} – Mr. Pizza Steve Finds`;
    const description = product.description
      ? product.description
      : `${product.name}${product.size ? ` · Size ${product.size}` : ""}${product.condition ? ` · ${product.condition}` : ""} · Curated vintage & thrift by Steve dos Santos, Zamalek Cairo.`;
    const image = product.imageUrl || `${SITE_URL}/og-default.jpg`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `${SITE_URL}/product/${product.id}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
    };
  },
  component: ProductPage,
});

const CONDITION_COLORS: Record<string, string> = {
  "Deadstock": "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  "Excellent": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  "Great":     "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  "Good":      "bg-zinc-700/50 text-zinc-300 border-zinc-600",
  "Fair":      "bg-orange-500/20 text-orange-400 border-orange-500/40",
};

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-4 w-24 bg-zinc-300 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-200 border border-zinc-300" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-20 bg-zinc-300" />
            <div className="h-8 w-3/4 bg-zinc-300" />
            <div className="h-10 w-1/3 bg-zinc-300" />
            <div className="h-4 w-1/2 bg-zinc-300" />
            <div className="h-4 w-1/3 bg-zinc-300" />
            <div className="mt-8 h-14 bg-zinc-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const loaderProduct = Route.useLoaderData();
  const [product, setProduct] = useState<Product | null>(loaderProduct);
  const [loading, setLoading] = useState(!loaderProduct);
  const [activeImg, setActiveImg] = useState(0);
  const [shared, setShared] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const cart = useCart();

  useEffect(() => {
    if (loaderProduct) { setProduct(loaderProduct); setLoading(false); return; }
    fetch(`${API}/api/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, loaderProduct]);

  if (loading) return <ProductSkeleton />;
  if (!product) return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-700 text-sm tracking-widest font-bold">ITEM NOT FOUND</p>
      <Link to="/shop" className="text-orange-600 hover:text-orange-700 text-sm font-bold">← Back to shop</Link>
    </div>
  );

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];
  const igMessage = encodeURIComponent(`Hi! I want to reserve: ${product.name}${product.size ? ` (Size: ${product.size})` : ""}`);
  const igLink = `${IG}?text=${igMessage}`;
  const pageUrl = `${SITE_URL}/product/${product.id}`;

  function prevImg() { setActiveImg(i => (i - 1 + allImages.length) % allImages.length); }
  function nextImg() { setActiveImg(i => (i + 1) % allImages.length); }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? nextImg() : prevImg();
    touchStartX.current = null;
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: product!.name, text: `Check this out on Mr. Pizza Steve Finds`, url: pageUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(pageUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const inCart = cart.items.some(i => i.id === product.id);

  return (
    <div className="min-h-screen bg-white text-black px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/shop" className="text-zinc-700 hover:text-black text-xs tracking-widest mb-12 inline-block transition-colors font-bold">
          ← BACK TO SHOP
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mt-4">
          {/* Image gallery */}
          <div>
            <div
              className="aspect-square bg-zinc-100 border border-zinc-300 overflow-hidden mb-4 relative select-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {allImages.length > 0
                ? <img
                    src={allImages[activeImg]}
                    alt={`${product.name}${product.condition ? ` – ${product.condition} condition` : ""}`}
                    className="w-full h-full object-cover"
                  />
                : <div className="w-full h-full flex items-center justify-center text-8xl bg-white">{product.emoji}</div>}

              {/* Sold overlay */}
              {product.status === "sold" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-black text-2xl tracking-widest border-2 border-white px-4 py-2 rotate-[-15deg]">SOLD</span>
                </div>
              )}

              {/* Arrow buttons */}
              {allImages.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                    {allImages.map((_, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`rounded-full transition-all ${activeImg === i ? "w-4 h-1.5 bg-black" : "w-1.5 h-1.5 bg-black/40 hover:bg-black/70"}`} />
                    ))}
                  </div>
                </>
              )}

              {/* 1 of 1 badge */}
              {product.status === "available" && (
                <span className="absolute top-4 left-4 text-[10px] font-black bg-black text-white px-2.5 py-1 tracking-widest">1 OF 1</span>
              )}
              {product.condition && (
                <span className={`absolute top-4 right-4 text-xs border font-bold px-2 py-0.5 ${CONDITION_COLORS[product.condition] || "bg-white border-zinc-300 text-black"}`}>
                  {product.condition}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors ${activeImg === i ? "border-black" : "border-zinc-300 hover:border-zinc-500"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.tag && (
              <span className="text-orange-600 text-xs font-black tracking-widest mb-3">{product.tag}</span>
            )}
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-6">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <span className={`text-3xl md:text-4xl font-black ${product.status === "sold" ? "text-zinc-500" : "text-black"}`}>
                {product.status === "sold"
                  ? "SOLD"
                  : product.price
                    ? `${product.price} EGP`
                    : product.priceLabel || "DM for price"}
              </span>
              {product.status === "available" && (
                <span className="text-xs text-red-600 font-bold tracking-widest animate-pulse">1 LEFT</span>
              )}
            </div>

            <div className="space-y-3 mb-8 mt-4 pb-6 border-b border-zinc-300">
              {product.size && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-700 text-sm w-24">Size</span>
                  <span className="bg-zinc-100 border border-zinc-400 text-black text-sm font-bold px-3 py-1">{product.size}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-700 text-sm w-24">Condition</span>
                  <span className="text-black text-sm font-bold">{product.condition}</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-zinc-700 text-sm leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto">
              {product.status === "available" ? (
                <>
                  <button
                    onClick={() => {
                      if (!inCart) cart.add({
                        id: product.id, name: product.name, size: product.size,
                        price: product.price, priceLabel: product.priceLabel,
                        imageUrl: product.imageUrl, emoji: product.emoji,
                      });
                    }}
                    className={`w-full font-black text-center py-4 tracking-widest transition-colors text-sm ${
                      inCart
                        ? "bg-zinc-300 text-zinc-600 cursor-default"
                        : "bg-black hover:bg-zinc-800 text-white"
                    }`}
                  >
                    {inCart ? "✓ IN CART" : "ADD TO CART"}
                  </button>
                  <a href={igLink} target="_blank" rel="noreferrer"
                    className="w-full border-2 border-black hover:bg-black text-black hover:text-white font-bold text-center py-3 tracking-widest transition-colors text-sm">
                    RESERVE VIA DM
                  </a>
                </>
              ) : (
                <div className="w-full bg-zinc-300 text-zinc-700 font-black text-center py-4 tracking-widest text-sm">
                  SOLD OUT
                </div>
              )}

              <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-300">
                <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
                  className="flex-1 border border-zinc-400 hover:border-black text-black hover:bg-black hover:text-white font-bold text-center py-2 tracking-widest transition-colors text-xs">
                  FOLLOW
                </a>
                <button onClick={handleShare}
                  className="flex-1 border border-zinc-400 hover:border-black text-black hover:bg-black hover:text-white font-bold text-center py-2 tracking-widest transition-colors text-xs">
                  {shared ? "COPIED ✓" : "SHARE"}
                </button>
              </div>
            </div>

            <p className="text-zinc-600 text-xs text-center mt-6">1 of 1 piece. Once it's gone, it's gone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

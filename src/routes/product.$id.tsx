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
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-4 w-24 bg-zinc-800 rounded mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-zinc-900 rounded-2xl" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-20 bg-zinc-800 rounded" />
            <div className="h-8 w-3/4 bg-zinc-800 rounded" />
            <div className="h-10 w-1/3 bg-zinc-800 rounded" />
            <div className="h-4 w-1/2 bg-zinc-800 rounded" />
            <div className="h-4 w-1/3 bg-zinc-800 rounded" />
            <div className="mt-8 h-14 bg-zinc-800 rounded-xl" />
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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-500 text-sm tracking-widest">ITEM NOT FOUND</p>
      <Link to="/shop" className="text-orange-400 hover:text-orange-300 text-sm font-bold">← Back to shop</Link>
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
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/shop" className="text-zinc-500 hover:text-orange-400 text-xs tracking-widest mb-8 inline-block transition-colors font-bold">
          ← BACK TO SHOP
        </Link>

        <div className="grid md:grid-cols-2 gap-10 mt-4">
          {/* Image gallery */}
          <div>
            <div
              className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden mb-3 relative select-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {allImages.length > 0
                ? <img
                    src={allImages[activeImg]}
                    alt={`${product.name}${product.condition ? ` – ${product.condition} condition` : ""}`}
                    className="w-full h-full object-cover"
                  />
                : <div className="w-full h-full flex items-center justify-center text-8xl">{product.emoji}</div>}

              {/* Sold overlay */}
              {product.status === "sold" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-black text-2xl tracking-widest border-2 border-white px-4 py-2 rotate-[-15deg]">SOLD</span>
                </div>
              )}

              {/* Arrow buttons */}
              {allImages.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {allImages.map((_, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`rounded-full transition-all ${activeImg === i ? "w-4 h-1.5 bg-orange-500" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`} />
                    ))}
                  </div>
                </>
              )}

              {/* 1 of 1 badge */}
              {product.status === "available" && (
                <span className="absolute top-3 left-3 text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded tracking-widest">1 OF 1</span>
              )}
              {product.condition && (
                <span className={`absolute top-3 right-3 text-xs border font-bold px-2 py-0.5 rounded ${CONDITION_COLORS[product.condition] || "bg-zinc-700/50 text-zinc-300 border-zinc-600"}`}>
                  {product.condition}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-orange-500" : "border-zinc-700 hover:border-zinc-500"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.tag && (
              <span className="text-orange-400 text-xs font-black tracking-widest mb-2">{product.tag}</span>
            )}
            <h1 className="text-2xl font-black leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-2">
              <span className={`text-3xl font-black ${product.status === "sold" ? "text-zinc-600" : "text-orange-400"}`}>
                {product.status === "sold"
                  ? "SOLD"
                  : product.price
                    ? `${product.price} EGP`
                    : product.priceLabel || "DM for price"}
              </span>
              {product.status === "available" && (
                <span className="text-xs text-red-400 font-bold tracking-widest animate-pulse">ONLY 1 LEFT</span>
              )}
            </div>

            <div className="space-y-2 mb-6 mt-2">
              {product.size && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm w-20">Size</span>
                  <span className="bg-zinc-800 text-white text-sm font-bold px-3 py-1 rounded">{product.size}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm w-20">Condition</span>
                  <span className="text-white text-sm">{product.condition}</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">{product.description}</p>
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
                    className={`w-full font-black text-center py-4 rounded-xl tracking-widest transition-colors text-sm ${
                      inCart
                        ? "bg-zinc-700 text-zinc-300 cursor-default"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {inCart ? "✓ IN CART" : "ADD TO CART"}
                  </button>
                  <a href={igLink} target="_blank" rel="noreferrer"
                    className="w-full border border-zinc-700 hover:border-orange-500 text-zinc-400 hover:text-orange-400 font-bold text-center py-3 rounded-xl tracking-widest transition-colors text-sm">
                    RESERVE VIA INSTAGRAM DM
                  </a>
                </>
              ) : (
                <div className="w-full bg-zinc-800 text-zinc-500 font-black text-center py-4 rounded-xl tracking-widest text-sm">
                  SOLD OUT
                </div>
              )}

              <div className="flex gap-3">
                <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
                  className="flex-1 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 font-bold text-center py-3 rounded-xl tracking-widest transition-colors text-xs">
                  FOLLOW @PIZZASTEVE
                </a>
                <button onClick={handleShare}
                  className="flex-1 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 font-bold text-center py-3 rounded-xl tracking-widest transition-colors text-xs">
                  {shared ? "COPIED ✓" : "SHARE"}
                </button>
              </div>
            </div>

            <p className="text-zinc-600 text-xs text-center mt-4">Items sell fast. 1 of 1 — once it's gone, it's gone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

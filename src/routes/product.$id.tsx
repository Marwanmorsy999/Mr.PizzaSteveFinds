import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const IG = "https://ig.me/m/mr.pizzastevefinds";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string;
  images?: string[]; condition?: string; description?: string;
}

export const Route = createFileRoute("/product/$id")({ component: ProductPage });

const CONDITION_COLORS: Record<string, string> = {
  "Deadstock": "text-emerald-400 border-emerald-700",
  "Excellent": "text-sky-400 border-sky-700",
  "Good": "text-zinc-300 border-zinc-600",
  "Fair": "text-yellow-400 border-yellow-700",
};

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-8" />
        <div className="grid md:grid-cols-2 gap-10 mt-4">
          <div>
            <div className="aspect-square bg-zinc-800 rounded-2xl animate-pulse mb-3" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => <div key={i} className="w-16 h-16 bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-zinc-800 rounded animate-pulse" />
            <div className="h-10 w-1/3 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-zinc-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-zinc-800 rounded-xl animate-pulse mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setImgLoaded(false);
    fetch(`${API}/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        setProduct(d);
        setLoading(false);
        // Load related items (same tag, different id, available)
        fetch(`${API}/api/products`)
          .then(r => r.json())
          .then((all: Product[]) => {
            const rel = all.filter(p => p.id !== id && p.status === "available" && p.tag === d.tag).slice(0, 4);
            setRelated(rel.length >= 2 ? rel : all.filter(p => p.id !== id && p.status === "available").slice(0, 4));
          });
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <ProductSkeleton />;
  if (!product) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-500 mb-4">Item not found</p>
        <Link to="/shop" className="text-orange-400 hover:underline text-sm">Back to shop</Link>
      </div>
    </div>
  );

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];
  const igMessage = encodeURIComponent(`Hi! I want to reserve: ${product.name}${product.size ? ` (Size: ${product.size})` : ""}`);
  const igLink = `${IG}?text=${igMessage}`;
  const conditionStyle = CONDITION_COLORS[product.condition || ""] || "text-zinc-300 border-zinc-600";

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/shop" className="text-zinc-500 hover:text-orange-400 text-xs tracking-widest mb-8 inline-flex items-center gap-2 transition-colors">
          <span>←</span> BACK TO SHOP
        </Link>

        <div className="grid md:grid-cols-2 gap-10 mt-4">
          {/* Images */}
          <div>
            <div className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden mb-3 relative">
              {allImages.length > 0 ? (
                <>
                  {!imgLoaded && <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-2xl" />}
                  <img
                    key={allImages[activeImg]}
                    src={allImages[activeImg]}
                    alt={product.name}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">{product.emoji}</div>
              )}
              {product.status === "sold" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-black text-2xl tracking-widest border-2 border-white px-4 py-2 rotate-[-15deg]">SOLD</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => { setActiveImg(i); setImgLoaded(false); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-orange-500" : "border-zinc-700 hover:border-zinc-500"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.tag && (
              <span className="text-orange-400 text-xs font-bold tracking-widest mb-2">{product.tag}</span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <span className={`text-3xl font-black ${product.status === "sold" ? "text-zinc-600" : "text-orange-400"}`}>
                {product.status === "sold" ? "SOLD" : product.price ? `${product.price} EGP` : product.priceLabel || "DM for price"}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {product.size && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs tracking-widest w-20">SIZE</span>
                  <span className="bg-zinc-800 text-white text-sm font-bold px-3 py-1 rounded">{product.size}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs tracking-widest w-20">CONDITION</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded border ${conditionStyle}`}>{product.condition}</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 border-l-2 border-zinc-800 pl-4">{product.description}</p>
            )}

            <div className="mt-auto space-y-3">
              {product.status === "available" ? (
                <a href={igLink} target="_blank" rel="noreferrer"
                  className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-black text-center py-4 rounded-xl tracking-widest transition-colors text-sm flex items-center justify-center gap-2">
                  <span>DM TO RESERVE</span>
                  <span className="text-base">→</span>
                </a>
              ) : (
                <div className="w-full bg-zinc-800 text-zinc-500 font-black text-center py-4 rounded-xl tracking-widest text-sm">
                  SOLD OUT
                </div>
              )}

              <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
                className="w-full border border-zinc-700 hover:border-orange-500 text-zinc-400 hover:text-orange-400 font-bold text-center py-3 rounded-xl tracking-widest transition-colors text-sm flex items-center justify-center gap-2">
                FOLLOW @mr.pizzastevefinds
              </a>

              <p className="text-zinc-600 text-xs text-center">Items sell fast — DM to hold yours.</p>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {related.length > 0 && (
          <div className="mt-20">
            <p className="text-zinc-500 text-xs tracking-widest font-bold mb-6">YOU MIGHT ALSO LIKE</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }}
                  className="group block bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-orange-500 transition-all hover:-translate-y-1">
                  <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">{p.emoji}</div>}
                    {p.tag && <span className="absolute top-2 left-2 text-xs font-bold bg-black/70 text-orange-400 px-2 py-0.5 rounded">{p.tag}</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-white font-bold text-xs leading-tight mb-1 line-clamp-2">{p.name}</p>
                    <span className="text-orange-400 text-xs font-black">{p.price ? `${p.price} EGP` : p.priceLabel || "—"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

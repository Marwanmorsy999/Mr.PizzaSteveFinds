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

function ProductPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products/${id}`).then(r => r.json()),
      fetch(`${API}/api/products`).then(r => r.json()),
    ]).then(([prod, all]) => {
      setProduct(prod);
      setRelated(all.filter((p: Product) => p.id !== id && p.status === "available" && p.tag === prod.tag).slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
    setActiveImg(0);
  }, [id]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center"><p>Item not found</p></div>;

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];
  const igMessage = encodeURIComponent(`Hi! I want to reserve: ${product.name}${product.size ? ` (Size: ${product.size})` : ""}`);

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/shop" className="text-zinc-500 hover:text-orange-400 text-sm tracking-widest mb-8 inline-block transition-colors">BACK TO SHOP</Link>

        <div className="grid md:grid-cols-2 gap-10 mt-4">
          {/* Images */}
          <div>
            <div className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden mb-3">
              {allImages.length > 0
                ? <img src={allImages[activeImg]} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-8xl">{product.emoji}</div>}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-orange-500" : "border-zinc-700"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.tag && <span className="text-orange-400 text-xs font-bold tracking-widest mb-2">{product.tag}</span>}
            <h1 className="text-2xl font-black leading-tight mb-4">{product.name}</h1>

            <span className={`text-3xl font-black mb-6 ${product.status === "sold" ? "text-zinc-600" : "text-orange-400"}`}>
              {product.status === "sold" ? "SOLD" : product.price ? `${product.price} EGP` : product.priceLabel || "DM for price"}
            </span>

            <div className="space-y-3 mb-6">
              {product.size && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm w-24">Size</span>
                  <span className="bg-zinc-800 text-white text-sm font-bold px-3 py-1 rounded">{product.size}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm w-24">Condition</span>
                  <span className="text-white text-sm font-bold">{product.condition}</span>
                </div>
              )}
            </div>

            {product.description && <p className="text-zinc-400 text-sm leading-relaxed mb-8">{product.description}</p>}

            {product.status === "available" ? (
              <a href={`${IG}?text=${igMessage}`} target="_blank" rel="noreferrer"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-center py-4 rounded-xl tracking-widest transition-colors text-sm mb-3">
                RESERVE VIA INSTAGRAM DM
              </a>
            ) : (
              <div className="w-full bg-zinc-800 text-zinc-500 font-black text-center py-4 rounded-xl tracking-widest text-sm mb-3">SOLD OUT</div>
            )}

            <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="w-full border border-zinc-700 hover:border-orange-500 text-zinc-400 hover:text-orange-400 font-bold text-center py-3 rounded-xl tracking-widest transition-colors text-sm">
              FOLLOW @mr.pizzastevefinds
            </a>
            <p className="text-zinc-600 text-xs text-center mt-4">Items sell fast. DM to hold yours.</p>
          </div>
        </div>

        {/* You may also like */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-black tracking-widest mb-6">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {related.map(p => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }}
                  className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-orange-500 transition-all hover:-translate-y-1">
                  <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <span className="text-4xl">{p.emoji}</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-white font-bold text-sm line-clamp-1">{p.name}</p>
                    <p className="text-orange-400 font-black text-sm">{p.price ? `${p.price} EGP` : p.priceLabel || "—"}</p>
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

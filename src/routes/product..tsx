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

export const Route = createFileRoute("/product/")({ component: ProductPage });

function ProductPage() {
  const { id } = Route.useParams();
  const cart = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

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
    fetch(`${API}/api/products/${id}`).then(r => r.json()).then(d => { setProduct(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-10 h-10 border-2 border-zinc-800 border-t-orange-400 rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center"><p>item not found 😔 probably sold already</p></div>;

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

  const igMessage = encodeURIComponent(`Hi! I want to reserve: ${product.name}${product.size ? ` (Size: ${product.size})` : ""}`);
  const igLink = `${IG}?text=${igMessage}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/shop" className="text-zinc-500 hover:text-zinc-100 active:scale-95 text-sm tracking-widest mb-8 inline-block transition-colors">
          BACK TO SHOP
        </Link>

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
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors active:scale-95 ${activeImg === i ? "border-zinc-200" : "border-zinc-700"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.tag && <span className="text-zinc-100 text-xs font-bold tracking-widest mb-2">{product.tag}</span>}
            <h1 className="text-2xl font-black leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <span className={`text-3xl font-black ${product.status === "sold" ? "text-zinc-600" : "text-zinc-100"}`}>
                {product.status === "sold" ? (
                  "SOLD"
                ) : product.price ? (
                  <>
                    {product.price}{" "}
                    <span className="text-[0.6em] font-sans font-bold tracking-wider text-muted-foreground ml-1">EGP</span>
                  </>
                ) : (
                  product.priceLabel || "DM for price"
                )}
              </span>
            </div>

            <div className="space-y-3 mb-8">
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
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">{product.description}</p>
            )}

            {product.status === "available" ? (
              isInCart ? (
                <Link to="/cart"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-center py-4 rounded-xl tracking-widest transition-colors text-sm block">
                  ADDED! VIEW CART →
                </Link>
              ) : (
                <button onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-secondary active:scale-95 text-primary-foreground font-black text-center py-4 rounded-xl tracking-widest transition-colors text-sm">
                  ADD TO CART
                </button>
              )
            ) : (
              <div className="w-full bg-zinc-800 text-zinc-500 font-black text-center py-4 rounded-xl tracking-widest text-sm">
                GONE 💀 someone was faster
              </div>
            )}

            <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="mt-3 w-full border border-zinc-700 hover:border-zinc-200 text-zinc-400 hover:text-zinc-100 font-bold text-center py-3 rounded-xl tracking-widest transition-colors text-sm">
              FOLLOW @mr.pizzastevefinds
            </a>

            <p className="text-zinc-600 text-xs text-center mt-4">pieces move fast. dm now if u want it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


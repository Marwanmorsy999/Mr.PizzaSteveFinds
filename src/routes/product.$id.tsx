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

// ── Size guide data ─────────────────────────────────────────────────────────
const SIZE_GUIDE = [
  { label: "XS", chest: "32–34″", shoulder: "16″", length: "26″" },
  { label: "S",  chest: "35–37″", shoulder: "17″", length: "27″" },
  { label: "M",  chest: "38–40″", shoulder: "18″", length: "28″" },
  { label: "L",  chest: "41–43″", shoulder: "19″", length: "29″" },
  { label: "XL", chest: "44–46″", shoulder: "20″", length: "30″" },
  { label: "XXL",chest: "47–50″", shoulder: "21″", length: "31″" },
];


// ── Condition badge colors ───────────────────────────────────────────────────
const CONDITION_COLORS: Record<string, string> = {
  "Deadstock": "text-emerald-400 bg-emerald-900/40 border-emerald-700",
  "Excellent": "text-sky-400 bg-sky-900/40 border-sky-700",
  "Great":     "text-cyan-400 bg-cyan-900/40 border-cyan-700",
  "Good":      "text-zinc-300 bg-zinc-800 border-zinc-600",
  "Fair":      "text-yellow-400 bg-yellow-900/40 border-yellow-700",
};

export const Route = createFileRoute("/product/$id")({ component: ProductPage });


function SizeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 max-w-lg w-full p-6 rounded-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black tracking-widest text-sm">VINTAGE SIZE GUIDE</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
          Vintage sizing runs differently from modern tags. Always trust the measurements below over the label — a vintage "L" often fits like a modern "M".
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left text-zinc-400 text-xs tracking-widest pb-2 pr-4">SIZE</th>
                <th className="text-left text-zinc-400 text-xs tracking-widest pb-2 pr-4">CHEST</th>
                <th className="text-left text-zinc-400 text-xs tracking-widest pb-2 pr-4">SHOULDER</th>
                <th className="text-left text-zinc-400 text-xs tracking-widest pb-2">LENGTH</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map(row => (
                <tr key={row.label} className="border-b border-zinc-800">
                  <td className="py-2 pr-4 font-black text-white">{row.label}</td>
                  <td className="py-2 pr-4 text-zinc-300">{row.chest}</td>
                  <td className="py-2 pr-4 text-zinc-300">{row.shoulder}</td>
                  <td className="py-2 text-zinc-300">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-zinc-500 text-xs mt-4">Measurements in inches. DM Steve if you need exact measurements on a specific piece.</p>
      </div>
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const cart = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);

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

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

      {/* Zoom overlay */}
      {zoom && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-zoom-out" onClick={() => setZoom(false)}>
          <img src={allImages[activeImg]} alt={product.name} className="max-h-screen max-w-full object-contain" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 tracking-widest">
          <Link to="/" className="hover:text-zinc-100 active:scale-95 transition-colors">HOME</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-zinc-100 active:scale-95 transition-colors">SHOP</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* ── Images ── */}
          <div>
            <div
              className="aspect-square bg-zinc-900 overflow-hidden mb-3 cursor-zoom-in relative"
              onClick={() => allImages.length > 0 && setZoom(true)}
            >
              {allImages.length > 0
                ? <img src={allImages[activeImg]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-full flex items-center justify-center text-8xl">{product.emoji}</div>}
              {allImages.length > 0 && (
                <span className="absolute bottom-3 right-3 text-[10px] bg-black/60 text-white px-2 py-1 tracking-widest">TAP TO ZOOM</span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
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
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {product.tag && (
                  <span className="text-zinc-100 text-xs font-bold tracking-widest">{product.tag}</span>
                )}
                {product.condition && (
                  <span className={`text-xs font-bold px-2 py-0.5 border ${condColorClass}`}>{product.condition}</span>
                )}
              </div>
              {/* Share button */}
              <button onClick={copyLink} className="text-zinc-500 hover:text-zinc-100 active:scale-95 text-xs tracking-widest transition-colors flex-shrink-0">
                {copied ? "✓ COPIED" : "SHARE"}
              </button>
            </div>

            <h1 className="text-2xl font-black leading-tight mb-4">{product.name}</h1>

            {/* Price + stock indicator */}
            <div className="flex items-center gap-4 mb-2">
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

            {product.status === "available" && (
              <p className="text-xs text-zinc-100 font-bold tracking-widest mb-6 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                ONLY 1 LEFT — 1 OF 1 (don't sleep on this)
              </p>
            )}

            {/* Size + condition */}
            <div className="space-y-3 mb-6">
              {product.size && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs tracking-widest w-24">SIZE</span>
                  <span className="bg-zinc-800 border border-zinc-700 text-white text-sm font-black px-4 py-1.5 tracking-widest">{product.size}</span>
                  <button onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-zinc-100 hover:text-zinc-100 active:scale-95 underline transition-colors tracking-widest">
                    SIZE GUIDE
                  </button>
                </div>
              )}
              {product.condition && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs tracking-widest w-24">CONDITION</span>
                  <span className="text-white text-sm font-bold">{product.condition}</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 border-l-2 border-zinc-700 pl-4">
                {product.description}
              </p>
            )}

            {/* CTA */}
            {product.status === "available" ? (
              isInCart ? (
                <Link to="/cart"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-center py-4 tracking-widest transition-colors text-sm mb-3 block">
                  ADDED! VIEW CART →
                </Link>
              ) : (
                <button onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-secondary active:scale-95 text-primary-foreground font-black text-center py-4 tracking-widest transition-colors text-sm mb-3">
                  ADD TO CART
                </button>
              )
            ) : (
              <div className="w-full bg-zinc-800 text-zinc-500 font-black text-center py-4 tracking-widest text-sm mb-3">
                GONE 💀 (someone was faster than u)
              </div>
            )}

            <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="w-full border border-zinc-700 hover:border-zinc-200 active:scale-95 text-zinc-400 hover:text-zinc-100 font-bold text-center py-3 tracking-widest transition-colors text-sm">
              FOLLOW @mr.pizzastevefinds
            </a>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-zinc-800">
              {[
                { icon: "🔒", label: "SECURE", sub: "no sketchy bs" },
                { icon: "📦", label: "CAREFUL", sub: "packed with actual love" },
                { icon: "✅", label: "AUTHENTIC", sub: "hand-verified by steve" },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="text-white text-[10px] font-black tracking-widest">{b.label}</p>
                  <p className="text-zinc-500 text-[10px]">{b.sub}</p>
                </div>
              ))}
            </div>

            <p className="text-zinc-600 text-xs text-center mt-4">pieces move fast. if u want it, dm now — don't wait around.</p>
          </div>
        </div>

        {/* ── Size guide callout ── */}
        <div className="mt-12 bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white font-black text-sm tracking-widest mb-1">VINTAGE SIZING RUNS DIFFERENT</p>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
              a vintage "L" often fits like a modern "M–S". always check the measurements before ordering, trust us — we've seen people get surprised.
            </p>
          </div>
          <button onClick={() => setShowSizeGuide(true)}
            className="flex-shrink-0 border border-zinc-200 text-zinc-100 hover:bg-zinc-800 hover:text-white active:scale-95 font-black px-5 py-2 text-xs tracking-widest transition-colors">
            VIEW SIZE GUIDE
          </button>
        </div>


        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-16">
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
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" loading="lazy" />
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


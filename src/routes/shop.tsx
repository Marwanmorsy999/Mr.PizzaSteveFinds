import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string; condition?: string;
}

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Mr. Pizza Steve Finds" },
      { name: "description", content: "Browse vintage and thrift clothing curated by Steve dos Santos. Zamalek, Cairo." },
    ],
  }),
  component: ShopPage,
});

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 animate-pulse">
      <div className="aspect-square bg-zinc-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  );
}

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("ALL");

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(d => { setProducts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tags = ["ALL", ...Array.from(new Set(products.map(p => p.tag).filter(Boolean))) as string[]];
  const sizes = ["ALL", ...Array.from(new Set(products.map(p => p.size).filter(Boolean))) as string[]];

  const filtered = products.filter(p => {
    if (tag !== "ALL" && p.tag !== tag) return false;
    if (sizeFilter !== "ALL" && p.size !== sizeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const available = filtered.filter(p => p.status === "available");
  const sold = filtered.filter(p => p.status === "sold");

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black tracking-widest mb-2 text-center">THE FINDS</h1>
        <p className="text-zinc-500 text-center mb-8 text-sm tracking-widest">CURATED VINTAGE — ZAMALEK, CAIRO</p>

        <div className="max-w-md mx-auto mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-full px-5 py-3 text-white placeholder-zinc-500 focus:border-orange-500 outline-none text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap justify-center mb-3">
          {tags.map(t => (
            <button key={t} onClick={() => setTag(t)}
              className={`text-xs font-bold tracking-widest px-4 py-2 rounded-full border transition-colors ${tag === t ? "bg-orange-500 border-orange-500 text-white" : "border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {sizes.map(s => (
            <button key={s} onClick={() => setSizeFilter(s)}
              className={`text-xs font-bold tracking-widest px-3 py-1 rounded border transition-colors ${sizeFilter === s ? "bg-zinc-100 border-zinc-100 text-black" : "border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {available.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {sold.length > 0 && (
              <>
                <p className="text-zinc-600 text-xs tracking-widest font-bold mt-10 mb-4">SOLD</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-50">
                  {sold.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-zinc-600 text-sm tracking-widest">NO ITEMS FOUND</p>
                <button onClick={() => { setSearch(""); setTag("ALL"); setSizeFilter("ALL"); }}
                  className="mt-4 text-orange-400 text-xs hover:underline">Clear filters</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const CONDITION_COLORS: Record<string, string> = {
  "Deadstock": "text-emerald-400 bg-emerald-900/40",
  "Excellent": "text-sky-400 bg-sky-900/40",
  "Good": "text-zinc-300 bg-zinc-800",
  "Fair": "text-yellow-400 bg-yellow-900/40",
};

function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link to="/product/$id" params={{ id: p.id }}
      className={`group block bg-zinc-900 rounded-xl overflow-hidden border transition-all duration-200 ${p.status === "sold" ? "border-zinc-800" : "border-zinc-800 hover:border-orange-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10"}`}>
      <div className="aspect-square bg-zinc-800 relative flex items-center justify-center overflow-hidden">
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          : <span className="text-6xl">{p.emoji}</span>}
        {p.status === "sold" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-widest border-2 border-white px-3 py-1 rotate-[-20deg]">SOLD</span>
          </div>
        )}
        {p.tag && (
          <span className="absolute top-2 left-2 text-xs font-bold bg-black/70 text-orange-400 px-2 py-0.5 rounded tracking-widest">
            {p.tag}
          </span>
        )}
        {p.condition && p.condition !== "Good" && (
          <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded ${CONDITION_COLORS[p.condition] || "bg-zinc-800 text-zinc-300"}`}>
            {p.condition}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-sm leading-tight mb-1 line-clamp-2">{p.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-xs">{p.size || "One size"}</span>
          <span className={`text-sm font-black ${p.status === "sold" ? "text-zinc-600" : "text-orange-400"}`}>
            {p.status === "sold" ? "SOLD" : p.price ? `${p.price} EGP` : p.priceLabel || "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}

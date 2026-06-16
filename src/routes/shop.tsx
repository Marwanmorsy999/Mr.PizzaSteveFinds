import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string; condition?: string;
}

// Persist filters in URL search params so back button restores them
const searchSchema = z.object({
  tag:    z.string().optional().default("ALL"),
  size:   z.string().optional().default("ALL"),
  q:      z.string().optional().default(""),
  sold:   z.boolean().optional().default(false),
  maxPrice: z.number().optional().nullable().default(null),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop – Mr. Pizza Steve Finds" },
      { name: "description", content: "Browse vintage and thrift clothing curated by Steve dos Santos. Zamalek, Cairo." },
    ],
  }),
  component: ShopPage,
});

function SkeletonCard() {
  return (
    <div className="bg-zinc-100 border border-zinc-300 animate-pulse">
      <div className="aspect-square bg-zinc-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-300 w-3/4" />
        <div className="h-3 bg-zinc-300 w-1/2" />
      </div>
    </div>
  );
}

const CONDITION_COLORS: Record<string, string> = {
  "Deadstock": "text-emerald-400 bg-emerald-900/40",
  "Excellent": "text-sky-400 bg-sky-900/40",
  "Good":      "text-zinc-300 bg-zinc-800",
  "Fair":      "text-yellow-400 bg-yellow-900/40",
};

function ShopPage() {
  const navigate = useNavigate({ from: "/shop" });
  const { tag, size, q, sold: showSold } = Route.useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(d => { setProducts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function setFilter(patch: Partial<typeof Route.useSearch extends () => infer R ? R : never>) {
    navigate({ search: (prev: any) => ({ ...prev, ...patch }), replace: true });
  }

  const tags = ["ALL", ...Array.from(new Set(products.map(p => p.tag).filter(Boolean))) as string[]];
  const sizes = ["ALL", ...Array.from(new Set(products.map(p => p.size).filter(Boolean))) as string[]];

  const filtered = products.filter(p => {
    if (tag !== "ALL" && p.tag !== tag) return false;
    if (size !== "ALL" && p.size !== size) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const available = filtered.filter(p => p.status === "available");
  const soldItems = filtered.filter(p => p.status === "sold");
  const hasFilters = tag !== "ALL" || size !== "ALL" || q !== "";

  return (
    <div className="min-h-screen bg-white text-black px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-600 text-xs font-bold tracking-[0.3em] mb-4">SHOP</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-widest mb-2">THE FINDS</h1>
          <p className="text-zinc-700 text-sm tracking-widest">CURATED VINTAGE & THRIFT</p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <input
            value={q}
            onChange={e => setFilter({ q: e.target.value })}
            placeholder="Search items..."
            className="w-full bg-white border border-zinc-400 px-5 py-3 text-black placeholder-zinc-500 focus:border-black outline-none text-sm pr-10"
          />
          {q && (
            <button onClick={() => setFilter({ q: "" })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-black transition-colors">
              ✕
            </button>
          )}
        </div>

        {/* Tag filters */}
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {tags.map(t => (
            <button key={t} onClick={() => setFilter({ tag: t })}
              className={`text-xs font-bold tracking-widest px-4 py-2 border transition-colors ${tag === t ? "bg-black border-black text-white" : "border-zinc-400 text-black hover:border-black"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Size filters */}
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {sizes.map(s => (
            <button key={s} onClick={() => setFilter({ size: s })}
              className={`text-xs font-bold tracking-widest px-3 py-1 border transition-colors ${size === s ? "bg-black border-black text-white" : "border-zinc-400 text-black hover:border-black"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <div className="text-center mb-8">
            <button onClick={() => setFilter({ tag: "ALL", size: "ALL", q: "" })}
              className="text-xs text-orange-600 hover:text-orange-700 border border-orange-600 hover:border-orange-700 px-4 py-1.5 transition-colors font-bold">
              ✕ Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {available.length === 0 && !hasFilters ? (
              <div className="text-center py-20">
                <p className="text-black text-sm tracking-widest font-bold">NO ITEMS AVAILABLE RIGHT NOW</p>
                <p className="text-zinc-700 text-xs mt-2">Follow @mr.pizzastevefinds for new drops</p>
              </div>
            ) : available.length === 0 && hasFilters ? (
              <div className="text-center py-20">
                <p className="text-black text-sm tracking-widest font-bold">NO ITEMS MATCH</p>
                <button onClick={() => setFilter({ tag: "ALL", size: "ALL", q: "" })}
                  className="mt-4 text-orange-600 text-xs hover:text-orange-700 font-bold">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {available.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Sold section - hidden by default */}
            {soldItems.length > 0 && (
              <div className="mt-16">
                <button
                  onClick={() => setFilter({ sold: !showSold })}
                  className="flex items-center gap-2 text-zinc-700 hover:text-black text-xs tracking-widest font-bold transition-colors mx-auto mb-6">
                  <span>{showSold ? "▲" : "▼"}</span>
                  <span>{showSold ? "HIDE SOLD" : `SHOW SOLD (${soldItems.length})`}</span>
                </button>
                {showSold && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 opacity-60">
                    {soldItems.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group"
    >
      <div className={`aspect-square bg-white border overflow-hidden relative flex items-center justify-center transition-colors ${p.status === "sold" ? "border-zinc-300 bg-zinc-50" : "border-zinc-300 hover:border-black"}`}>
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300" loading="lazy" />
          : <span className="text-6xl bg-zinc-100">{p.emoji}</span>}

        {p.status === "sold" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-black text-lg tracking-widest border-2 border-white px-3 py-1 rotate-[-15deg]">SOLD</span>
          </div>
        )}
        {p.status === "available" && (
          <span className="absolute top-3 left-3 text-[10px] font-black bg-black text-white px-2.5 py-1 tracking-widest">
            1 OF 1
          </span>
        )}
        {p.tag && (
          <span className="absolute bottom-3 left-3 text-xs font-bold bg-black text-white px-2 py-0.5 tracking-widest">
            {p.tag}
          </span>
        )}
        {p.condition && p.condition !== "Good" && (
          <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 border ${CONDITION_COLORS[p.condition] || "bg-white border-zinc-300 text-black"}`}>
            {p.condition}
          </span>
        )}
      </div>
      <div className="pt-4">
        <p className="text-black font-bold text-sm leading-tight mb-2 line-clamp-2 group-hover:underline">{p.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 text-xs">{p.size || "—"}</span>
          <span className={`text-sm font-black ${p.status === "sold" ? "text-zinc-500" : "text-black"}`}>
            {p.status === "sold" ? "SOLD" : p.price ? `${p.price} EGP` : p.priceLabel || "DM"}
          </span>
        </div>
      </div>
    </Link>
  );
}

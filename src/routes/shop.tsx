import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

interface Product {
  id: string;
  name: string;
  size?: string;
  price?: number;
  priceLabel?: string;
  status: string;
  emoji?: string;
  tag?: string;
  imageUrl?: string;
}

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tags = ["ALL", ...Array.from(new Set(products.map(p => p.tag).filter(Boolean)))];
  const filtered = filter === "ALL" ? products : products.filter(p => p.tag === filter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black tracking-widest mb-2 text-center">THE FINDS</h1>
        <p className="text-zinc-500 text-center mb-8 text-sm tracking-widest">CURATED VINTAGE & THRIFT — ZAMALEK</p>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {tags.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`text-xs font-bold tracking-widest px-4 py-2 rounded-full border transition-colors ${filter === t ? "bg-orange-500 border-orange-500 text-white" : "border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400"}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className={`group bg-zinc-900 rounded-xl overflow-hidden border transition-colors ${p.status === "sold" ? "border-zinc-800 opacity-50" : "border-zinc-800 hover:border-orange-500"}`}>
                {/* Image area */}
                <div className="aspect-square bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <span className="text-6xl">{p.emoji}</span>
                  }
                  {p.status === "sold" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-black text-xl tracking-widest rotate-[-20deg] border-2 border-white px-3 py-1">SOLD</span>
                    </div>
                  )}
                  {p.tag && (
                    <span className="absolute top-2 left-2 text-xs font-bold bg-black/70 text-orange-400 px-2 py-0.5 rounded tracking-widest">
                      {p.tag}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-white font-bold text-sm leading-tight mb-1">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-xs">{p.size || "One size"}</span>
                    <span className={`text-sm font-black ${p.status === "sold" ? "text-zinc-600" : "text-orange-400"}`}>
                      {p.status === "sold" ? "SOLD" : p.price ? `${p.price} EGP` : p.priceLabel || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white font-bold px-6 py-3 rounded-full transition-colors tracking-widest text-sm">
            📸 @mr.pizzastevefinds
          </a>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

interface Product {
  id: string;
  name: string;
  size?: string;
  price?: number;
  priceLabel?: string;
  status: string;
  emoji: string;
  tag: string;
  imageUrl?: string;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mr. Pizza Steve Finds - Loud Vintage & Thrift | Zamalek, Cairo" },
      { name: "description", content: "Loud vintage and thrift drops curated by Steve dos Santos in Zamalek, Cairo." },
      { name: "author", content: "Steve dos Santos" },
      { property: "og:title", content: "Mr. Pizza Steve Finds - Loud Vintage & Thrift | Zamalek, Cairo" },
      { property: "og:url", content: "https://mr.pizzastevefinds.com/" },
      { property: "og:image", content: "https://mr.pizzastevefinds.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Array<{ name: string; text: string; rating: number; date: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem("ps_reviews") || "[]");
    } catch {
      return [];
    }
  });

  const [revForm, setRevForm] = useState({ name: "", text: "", rating: 5 });
  const [showForm, setShowForm] = useState(false);

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!revForm.name.trim() || !revForm.text.trim()) return;

    const newRev = {
      name: revForm.name,
      text: revForm.text,
      rating: revForm.rating,
      date: new Date().toLocaleDateString(),
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem("ps_reviews", JSON.stringify(updated));
    setRevForm({ name: "", text: "", rating: 5 });
    setShowForm(false);
  }

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        setFeatured(data.filter((p) => p.status === "available").slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Bento Grid */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:py-8 flex-1 w-full">
        <div className="grid grid-cols-6 md:grid-cols-12 auto-rows-[minmax(120px,1fr)] gap-3 md:gap-4 h-full">
          
          {/* Hero (8x4) */}
          <div className="col-span-6 md:col-span-8 row-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
            <video
              src="/opening.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="relative z-20">
              <div className="inline-flex items-center gap-2 bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground mb-6 shadow-lg rounded-full w-max">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" />
                Open today
              </div>
              <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.85]">
                Loud Vintage.<br />Zamalek.
              </h1>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="inline-flex items-center gap-2 bg-primary px-6 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary">
                  Shop
                </Link>
                <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-border bg-card/50 backdrop-blur-md px-6 py-3 font-display text-sm uppercase tracking-widest text-foreground transition hover:border-primary hover:text-primary">
                  DM us
                </a>
              </div>
            </div>
          </div>

          {/* Featured drop (4x2) */}
          {featured[0] ? (
            <Link to="/product/$id" params={{ id: featured[0].id }} className="col-span-3 md:col-span-4 row-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-primary transition-colors">
              <div className="absolute right-4 top-4 z-10 bg-secondary px-2 py-1 text-[10px] font-black text-secondary-foreground shadow">
                {featured[0].tag || "HOT"}
              </div>
              <div className="flex-1 grid place-items-center relative z-0 min-h-[100px]">
                {featured[0].imageUrl ? (
                  <img src={featured[0].imageUrl} alt={featured[0].name} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <span className="text-7xl md:text-8xl transition-transform duration-300 group-hover:scale-110">{featured[0].emoji}</span>
                )}
              </div>
              <div className="relative z-10 mt-4 flex items-center justify-between gap-2">
                <div className="font-display text-lg md:text-xl uppercase line-clamp-1">{featured[0].name}</div>
                <div className="font-display text-lg md:text-xl text-primary whitespace-nowrap">
                  {featured[0].price ? `${featured[0].price} EGP` : featured[0].priceLabel}
                </div>
              </div>
            </Link>
          ) : (
            <div className="col-span-3 md:col-span-4 row-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-center text-muted-foreground text-sm">
              Loading drop...
            </div>
          )}

          {/* Find us (4x2) */}
          <div className="col-span-3 md:col-span-4 row-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
            <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 text-xs font-black text-secondary-foreground mb-4 rounded-full w-max shadow-sm">
              3PM–11PM daily
            </div>
            <h3 className="font-display text-2xl uppercase mt-2">Find us</h3>
            <p className="text-muted-foreground mt-2 font-mono text-sm leading-relaxed">
              30 Hassan Assem St<br />
              Zamalek, Cairo
            </p>
          </div>

          {/* Rack photo (4x2) */}
          <div className="col-span-6 md:col-span-4 row-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden group min-h-[160px]">
            <img src="/rack.jpg" alt="the rack" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10">
              <span className="font-display text-2xl md:text-3xl uppercase leading-tight">
                Evisu &middot; Tommy<br/>Camo &middot; Varsity
              </span>
            </div>
          </div>

          {/* 3 product tiles (4x2 each) */}
          {featured.slice(1, 4).map((p) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="col-span-2 md:col-span-4 row-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-3 md:p-6 flex flex-col justify-center relative overflow-hidden group hover:border-primary transition-colors min-h-[160px]">
              <div className="flex-1 grid place-items-center">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <span className="text-4xl md:text-7xl transition-transform duration-300 group-hover:scale-110">{p.emoji}</span>
                )}
              </div>
              <div className="mt-3 md:mt-4 flex flex-col items-center text-center">
                <div className="font-display text-xs md:text-base uppercase line-clamp-1 w-full">{p.name}</div>
                <div className="flex flex-col md:flex-row items-center md:gap-2 mt-1">
                  <span className="text-[9px] md:text-xs text-muted-foreground uppercase">{p.size ? `sz ${p.size}` : "OS"}</span>
                  <span className="hidden md:inline text-muted-foreground text-[10px] md:text-xs">•</span>
                  <span className="font-display text-xs md:text-sm text-primary mt-0.5 md:mt-0">
                    {p.price ? `${p.price} EGP` : p.priceLabel}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-zinc-100 text-sm">
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl uppercase">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

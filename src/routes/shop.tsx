import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { memo, useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const INSTAGRAM_URL = "https://instagram.com/mr.pizzastevefinds" as const;

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
  images?: string[];
  condition?: string;
  description?: string;
}

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop - Mr. Pizza Steve Finds" },
      { name: "description", content: "Browse the current drop: tees, jorts, eyewear, Harley Davidson and more vintage finds in Zamalek, Cairo." },
      { name: "keywords", content: "shop vintage, vintage tees, jorts, eyewear, Harley Davidson vintage, curated thrift, Cairo streetwear, Mr Pizza Steve shop" },
      { property: "og:title", content: "Shop - Mr. Pizza Steve Finds" },
      { property: "og:description", content: "The current drop, fresh off the Zamalek rack. Tees, jorts, eyewear, grails." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="border-b border-border pb-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Shop</div>
          <h1 className="mt-2 text-5xl sm:text-7xl">Current Drop</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            add to cart to reserve before some other guy takes it. or just show up, idc
          </p>
        </div>

        {loading ? (
          <div className="mt-16 grid place-items-center">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-orange-400 rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <Card key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="mt-16 grid place-items-center text-center">
            <p className="text-muted-foreground">The rack is empty right now. Check back soon - fresh drops land weekly.</p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

const Card = memo(function Card({ p }: { p: Product }) {
  const sold = p.status === "sold";

  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className={`group relative overflow-hidden border border-border bg-card transition ${
        sold ? "opacity-75" : "hover:-translate-y-1 hover:border-primary"
      }`}
    >
      <div className="absolute left-3 top-3 z-10">
        <span
          className={`tilt-l px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow ${
            sold ? "bg-zinc-800 text-zinc-400" : "bg-success text-success-foreground"
          }`}
          style={{ borderRadius: "2px" }}
        >
          {sold ? "gone" : "available"}
        </span>
      </div>

      <div className="absolute right-3 top-3 z-10 tilt-r bg-secondary px-2 py-1 text-[10px] font-black text-secondary-foreground shadow" style={{ borderRadius: "2px" }}>
        {p.tag}
      </div>

      <div className="relative grid aspect-square place-items-center overflow-hidden bg-gradient-to-br from-muted via-card to-background">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${sold ? "grayscale opacity-40" : ""}`}
          />
        ) : (
          <span className={`text-8xl transition-transform duration-500 group-hover:scale-110 ${sold ? "grayscale opacity-40" : ""}`}>
            {p.emoji}
          </span>
        )}
        {sold && (
          <div className="absolute inset-0 grid place-items-center">
            <span
              className="bg-zinc-900/80 px-5 py-2 font-display text-3xl text-zinc-400"
              style={{ transform: "rotate(-10deg)", border: "3px solid currentColor" }}
            >
              SOLD
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-display text-base uppercase leading-tight">{p.name}</h3>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {p.size ? `size ${p.size}` : "one size"}
          </span>
          <span className={`font-display text-lg ${sold ? "text-zinc-600 line-through" : "text-primary"}`}>
            {p.price ? (
              <>
                {p.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
              </>
            ) : p.priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
});

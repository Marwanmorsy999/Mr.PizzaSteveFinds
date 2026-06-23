import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { memo, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

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
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const availableProducts = products.filter((p) => p.status === "available");
  const featuredProduct = availableProducts.find(
    (p) => p.tag?.toLowerCase().includes("grail") || p.name?.toLowerCase().includes("grail")
  ) || availableProducts[availableProducts.length - 1];

  const isGrail = featuredProduct && (featuredProduct.tag?.toLowerCase().includes("grail") || featuredProduct.name?.toLowerCase().includes("grail"));
  const badgeText = isGrail ? "GRAIL DROP" : "NEWEST FIND";

  const remainingProducts = featuredProduct
    ? products.filter((p) => p.id !== featuredProduct.id)
    : products;

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="border-b border-border pb-8 mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Shop</div>
          <h1 className="mt-2 text-5xl sm:text-7xl">Current Drop</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            add to cart to reserve before some other guy takes it. or just show up, idc
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-zinc-800 bg-[#161616] p-4 flex flex-col gap-4">
                <div className="w-full aspect-square bg-[#0a0a0a] border border-zinc-800/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" />
                <div className="space-y-3 py-2">
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 bg-zinc-800 rounded w-1/4" />
                    <div className="h-4 bg-zinc-800 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {featuredProduct && (
              <div className="mb-12">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Featured Drop</div>
                <Link
                  to="/product/$id"
                  params={{ id: featuredProduct.id }}
                  className="group block relative overflow-hidden border border-zinc-800 bg-[#161616] hover:border-primary active:scale-[0.99] transition duration-300"
                >
                  <div className="grid md:grid-cols-12 gap-0">
                    {/* Image side */}
                    <div className="md:col-span-7 relative aspect-square md:aspect-[4/3] bg-[#0a0a0a] overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                      <div className="absolute left-4 top-4 z-10">
                        <span className="tilt-l px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-success text-success-foreground shadow" style={{ borderRadius: "2px" }}>
                          {badgeText}
                        </span>
                      </div>
                      <div className="absolute right-4 top-4 z-10 tilt-r bg-secondary px-2.5 py-1 text-[10px] font-black text-secondary-foreground shadow" style={{ borderRadius: "2px" }}>
                        {featuredProduct.tag}
                      </div>
                      {featuredProduct.imageUrl ? (
                        <img
                          src={featuredProduct.imageUrl}
                          alt={featuredProduct.name}
                          className="h-full w-full object-cover transition-transform duration-750 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-9xl transition-transform duration-750 group-hover:scale-110">
                          {featuredProduct.emoji}
                        </span>
                      )}
                    </div>
                    {/* Info side */}
                    <div className="md:col-span-5 p-8 flex flex-col justify-between bg-gradient-to-br from-card/30 to-background/30">
                      <div className="space-y-4">
                        <h2 className="font-display text-3xl sm:text-4xl uppercase leading-none tracking-tight text-white group-hover:text-primary transition-colors">
                          {featuredProduct.name}
                        </h2>
                        {featuredProduct.description && (
                          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4">
                            {featuredProduct.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Size</span>
                          <span className="font-bold text-white mt-1 bg-zinc-850 border border-zinc-700 px-2 py-0.5 text-xs tracking-wider" style={{ borderRadius: "2px" }}>
                            {featuredProduct.size || "One Size"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Price</span>
                          <span className="font-display text-2xl text-primary mt-1">
                            {featuredProduct.price ? (
                              <>
                                {featuredProduct.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
                              </>
                            ) : featuredProduct.priceLabel || "DM for Price"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {remainingProducts.length > 0 && (
              <div>
                {featuredProduct && (
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6">More Finds</div>
                )}
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {remainingProducts.map((p, index) => <Card key={p.id} p={p} index={index} />)}
                </div>
              </div>
            )}
          </>
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

const Card = memo(function Card({ p, index }: { p: Product; index: number }) {
  const sold = p.status === "sold";
  const staggerDelay = Math.min(index * 50, 300);
  const cart = useCart();

  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      style={{
        animationDelay: `${staggerDelay}ms`,
      }}
      className={`group relative overflow-hidden border border-border bg-card transition duration-300 active:scale-95 animate-fade-slide-up ${
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

      <div className="relative grid aspect-square place-items-center overflow-hidden bg-[#0a0a0a] border border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
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

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 font-display text-[11px] uppercase leading-tight">{p.name}</h3>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground">
            {p.size ? `size ${p.size}` : "one size"}
          </span>
          <span className={`font-display text-xs ${sold ? "text-zinc-600 line-through" : "text-primary"}`}>
            {p.price ? (
              <>
                {p.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
              </>
            ) : p.priceLabel}
          </span>
        </div>
        {!sold && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); cart.add({ id: p.id, name: p.name, price: p.price, priceLabel: p.priceLabel, imageUrl: p.imageUrl, size: p.size, emoji: p.emoji }); }}
              className="flex-1 bg-primary hover:bg-secondary active:scale-95 text-primary-foreground font-black text-center py-1.5 tracking-widest transition-colors text-[10px] uppercase"
            >
              add to cart
            </button>
            <Link
              to="/checkout"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 border border-border hover:border-primary active:scale-95 text-foreground hover:text-primary font-black text-center py-1.5 tracking-widest transition-colors text-[10px] uppercase"
            >
              buy it now
            </Link>
          </div>
        )}
      </div>
    </Link>
  );
});

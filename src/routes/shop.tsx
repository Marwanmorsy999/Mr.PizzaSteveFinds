import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
function cloudImg(url: string, width = 600) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}
  const cart = useCart();
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-6xl px-2 py-12">
        <div className="border-b border-border pb-8 mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Shop</div>
          <h1 className="mt-2 text-5xl sm:text-7xl">Current Drop</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            add to cart to reserve before some other guy takes it. or just show up, idc
          </p>
        </div>

         {loading ? (
           <div className="mt-8 grid gap-2 grid-cols-2 sm:grid-cols-3">
             {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="animate-pulse border border-zinc-800 bg-[#161616] p-3 flex flex-col gap-3">
                 <div className="w-full aspect-square bg-[#0a0a0a] border border-zinc-800/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" />
                 <div className="space-y-2 py-2">
                   <div className="h-3 bg-zinc-800 rounded w-2/3" />
                   <div className="flex justify-between items-center pt-1">
                     <div className="h-2.5 bg-zinc-800 rounded w-1/4" />
                     <div className="h-3 bg-zinc-800 rounded w-1/4" />
                   </div>
                 </div>
               </div>
             ))}
           </div>
        ) : products.length > 0 ? (
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {products.map((p, index) => <Card key={p.id} p={p} index={index} />)}
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

const Card = memo(function Card({ p, index }: { p: Product; index: number }) {
  const sold = p.status === "sold";
  const staggerDelay = Math.min(index * 50, 300);
  const cart = useCart();
  const navigate = useNavigate();

  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      style={{
        animationDelay: `${staggerDelay}ms`,
      }}
      className={`group relative overflow-hidden border border-border bg-card transition duration-300 active:scale-95 animate-fade-slide-up ${
        sold ? "grayscale opacity-60" : "hover:-translate-y-1 hover:border-primary"
      }`}
    >
      {sold && (
        <div className="absolute left-3 top-3 z-10">
          <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-teal-900 text-teal-200 shadow" style={{ borderRadius: "2px" }}>
            SOLD OUT
          </span>
        </div>
      )}

      <div className="absolute right-3 top-3 z-10 tilt-r bg-secondary px-2 py-1 text-[10px] font-black text-secondary-foreground shadow" style={{ borderRadius: "2px" }}>
        {p.tag}
      </div>

      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-[#0a0a0a] border border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
        {p.imageUrl ? (
          <img
            src={cloudImg(p.imageUrl ?? '')}
            alt={p.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${sold ? "grayscale opacity-40" : ""}`}
          />
        ) : (
          <span className={`text-8xl transition-transform duration-500 group-hover:scale-110 ${sold ? "grayscale opacity-40" : ""}`}>
            {p.emoji}
          </span>
        )}
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 font-display text-[11px] uppercase leading-tight">{p.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-display text-xs text-primary">
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
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); cart.add({ id: p.id, name: p.name, price: p.price, priceLabel: p.priceLabel, imageUrl: p.imageUrl, size: p.size, emoji: p.emoji }); navigate({ to: "/checkout" }); }}
              className="flex-1 border border-border hover:border-primary active:scale-95 text-foreground hover:text-primary font-black text-center py-1.5 tracking-widest transition-colors text-[10px] uppercase"
            >
              buy it now
            </button>
          </div>
        )}
      </div>
    </Link>
  );
});

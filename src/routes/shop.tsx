import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Header, Footer, Marquee } from "@/components/site-chrome";
import { products, type Product } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Mr. Pizza Steve Finds" },
      { name: "description", content: "Browse the current drop: tees, jorts, eyewear, Harley Davidson and more." },
      { property: "og:title", content: "Shop — Mr. Pizza Steve Finds" },
      { property: "og:description", content: "The current drop, fresh off the Zamalek rack." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <div className="min-h-screen">
      <Header />
      <Marquee text="NEW DROP AVAILABLE 🍕" />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="border-b border-border pb-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Shop</div>
          <h1 className="mt-2 text-5xl sm:text-7xl">Current Drop</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            DM <a className="text-primary underline" href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer">@mr.pizzastevefinds</a> to reserve, or come grab it at the shop.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} p={p} onSelect={() => setSelected(p)} />
          ))}
        </div>
      </section>
      <Footer />

      {selected && (
        <QuickViewModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ─── Product Card ─── */

function Card({ p, onSelect }: { p: Product; onSelect: () => void }) {
  const sold = p.status === "sold";
  return (
    <article
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-sm border border-border bg-card transition ${sold ? "opacity-80" : "hover:-translate-y-1 hover:border-primary"}`}
    >
      <div className="absolute left-3 top-3 z-10">
        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${sold ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}`}>
          {sold ? "Sold" : "Available"}
        </span>
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-sm border border-border bg-background/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground backdrop-blur">
        {p.tag}
      </div>
      <div className="relative grid aspect-square place-items-center overflow-hidden bg-gradient-to-br from-muted via-card to-background">
        <span className={`text-8xl transition-transform duration-500 group-hover:scale-110 ${sold ? "grayscale" : ""}`}>{p.emoji}</span>
        {sold && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="rotate-[-12deg] border-4 border-destructive px-4 py-1 font-display text-3xl text-destructive">SOLD</span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-display text-base uppercase leading-tight">{p.name}</h3>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {p.size ? `Size ${p.size}` : "One size"}
          </span>
          <span className={`font-display text-lg ${sold ? "text-muted-foreground line-through" : "text-primary"}`}>
            {p.price ? `${p.price} EGP` : p.priceLabel}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─── Quick-View Modal ─── */

function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const sold = product.status === "sold";

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-lg animate-in fade-in zoom-in-95 overflow-hidden rounded-sm border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-sm border border-border bg-background/60 p-1.5 text-muted-foreground backdrop-blur transition hover:border-primary hover:text-primary"
          aria-label="Close quick view"
        >
          <X className="size-4" />
        </button>

        {/* Emoji hero */}
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-muted via-card to-background">
          <span className={`text-[10rem] leading-none ${sold ? "grayscale" : ""}`}>
            {product.emoji}
          </span>
          {sold && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="rotate-[-12deg] border-4 border-destructive px-6 py-2 font-display text-5xl text-destructive">
                SOLD
              </span>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute left-4 top-4">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-widest ${
                sold
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-success text-success-foreground"
              }`}
            >
              {sold ? "Sold" : "Available"}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 p-6">
          {/* Tag */}
          <div className="inline-block rounded-sm border border-border bg-background/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground backdrop-blur">
            {product.tag}
          </div>

          {/* Name */}
          <h2 className="font-display text-2xl uppercase leading-tight sm:text-3xl">
            {product.name}
          </h2>

          {/* Size & Price row */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">
              {product.size ? `Size ${product.size}` : "One size"}
            </span>
            <span
              className={`font-display text-2xl ${
                sold ? "text-muted-foreground line-through" : "text-primary"
              }`}
            >
              {product.price ? `${product.price} EGP` : product.priceLabel}
            </span>
          </div>

          {/* CTA */}
          {sold ? (
            <p className="text-center text-sm text-muted-foreground">
              This piece has been sold — follow for the next drop.
            </p>
          ) : (
            <a
              href="https://instagram.com/mr.pizzastevefinds"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary"
            >
              DM to Reserve →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

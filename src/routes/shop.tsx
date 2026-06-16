import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/products";
import type { Product } from "@/lib/products";
import { memo, useMemo } from "react";

const INSTAGRAM_URL = "https://instagram.com/mr.pizzastevefinds" as const;
const SITE_TITLE = "Shop â€” Mr. Pizza Steve Finds";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      {
        name: "description",
        content:
          "Browse the current drop: tees, jorts, eyewear, Harley Davidson and more vintage finds in Zamalek, Cairo.",
      },
      {
        name: "keywords",
        content:
          "shop vintage, vintage tees, jorts, eyewear, Harley Davidson vintage, curated thrift, Cairo streetwear, Mr Pizza Steve shop",
      },
      { property: "og:title", content: SITE_TITLE },
      {
        property: "og:description",
        content: "The current drop, fresh off the Zamalek rack. Tees, jorts, eyewear, grails.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const productCards = useMemo(
    () => products.map((p) => <Card key={p.id} p={p} />),
    [],
  );

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="border-b border-border pb-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
              The Shop
            </span>
            <span
              role="status"
              className="tilt-r rounded-xs bg-primary px-2 py-0.5 text-[9px] font-black text-primary-foreground"
            >
              just dropped ًں”¥
            </span>
          </div>
          <h1 className="mt-2 text-5xl sm:text-7xl">Current Drop</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            dm{" "}
            <a
              className="text-primary underline"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
            >
              @mr.pizzastevefinds
            </a>{" "}
            to reserve before some other guy takes it. or just show up, idc ًںڈƒ
          </p>
        </div>

        {productCards.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productCards}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
      <Footer />
    </div>
  );
}

/* â”€â”€ empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function EmptyState() {
  return (
    <div className="mt-16 grid place-items-center text-center">
      <span className="text-6xl">ًں§ƒ</span>
      <p className="mt-4 text-muted-foreground">
        The rack's empty right now. Check back soon â€” fresh drops land weekly.
      </p>
    </div>
  );
}

/* â”€â”€ product card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const Card = memo(function Card({ p }: { p: Product }) {
  const sold = p.status === "sold";

  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      aria-label={
        sold
          ? `${p.name} â€” sold`
          : `${p.name} â€” ${p.price ? `${p.price} EGP` : p.priceLabel ?? "price TBD"}`
      }
      className={`group relative overflow-hidden border border-border bg-card transition ${
        sold ? "opacity-75" : "hover:-translate-y-1 hover:border-primary"
      }`}
    >
      {/* Available / sold sticker (top-left) */}
      <div className="absolute left-3 top-3 z-10">
        <span
          role="status"
          className={`rounded-xs tilt-l px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow ${
            sold
              ? "bg-zinc-800 text-zinc-400"
              : "bg-success text-success-foreground"
          }`}
        >
          {sold ? "gone ًں’€" : "available âœ…"}
        </span>
      </div>

      {/* Tag sticker (top-right) */}
      <div className="absolute right-3 top-3 z-10 rounded-xs tilt-r bg-secondary px-2 py-1 text-[10px] font-black text-secondary-foreground shadow">
        {p.tag}
      </div>

      {/* Image / emoji area */}
      <div className="relative grid aspect-square place-items-center overflow-hidden bg-gradient-to-br from-muted via-card to-background">
        <span
          className={`text-8xl transition-transform duration-500 group-hover:scale-110 ${
            sold ? "grayscale opacity-40" : ""
          }`}
          aria-hidden={true}
        >
          {p.emoji}
        </span>
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

      {/* Card body */}
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-display text-base uppercase leading-tight">
          {p.name}
        </h3>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {p.size ? `size ${p.size}` : "one size"}
          </span>
          <span
            className={`font-display text-lg ${
              sold ? "text-zinc-600 line-through" : "text-primary"
            }`}
          >
            {p.price ? `${p.price} EGP` : p.priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
});

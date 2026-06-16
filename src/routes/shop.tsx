import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { RotatingBanner } from "@/components/site-chrome";
import { products, type Product } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Mr. Pizza Steve Finds" },
      { name: "description", content: "Browse the current drop: tees, jorts, eyewear, Harley Davidson and more vintage finds in Zamalek, Cairo." },
      { name: "keywords", content: "shop vintage, vintage tees, jorts, eyewear, Harley Davidson vintage, curated thrift, Cairo streetwear, Mr Pizza Steve shop" },
      { property: "og:title", content: "Shop — Mr. Pizza Steve Finds" },
      { property: "og:description", content: "The current drop, fresh off the Zamalek rack. Tees, jorts, eyewear, grails." },
    ],
  }),
  component: Shop,
});

function Shop() {
  return (
    <div className="min-h-screen">
      <Header />
      <RotatingBanner />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="border-b border-border pb-8">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Shop</div>
            <div className="tilt-r bg-primary px-2 py-0.5 text-[9px] font-black text-primary-foreground" style={{ borderRadius: "2px" }}>
              just dropped 🔥
            </div>
          </div>
          <h1 className="mt-2 text-5xl sm:text-7xl">Current Drop</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            dm{" "}
            <a className="text-primary underline" href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer">
              @mr.pizzastevefinds
            </a>{" "}
            to reserve before some other guy takes it. or just show up, idc 🏃
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <Card key={p.id} p={p} />)}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Card({ p }: { p: Product }) {
  const sold = p.status === "sold";
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className={`group relative overflow-hidden border border-border bg-card transition ${sold ? "opacity-75" : "hover:-translate-y-1 hover:border-primary"}`}
    >
      {/* Available/Sold sticker */}
      <div className="absolute left-3 top-3 z-10">
        <span
          className={`tilt-l px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow ${
            sold
              ? "bg-zinc-800 text-zinc-400"
              : "bg-success text-success-foreground"
          }`}
          style={{ borderRadius: "2px" }}
        >
          {sold ? "gone 💀" : "available ✅"}
        </span>
      </div>

      {/* Tag sticker top-right */}
      <div className="absolute right-3 top-3 z-10 tilt-r bg-secondary px-2 py-1 text-[10px] font-black text-secondary-foreground shadow" style={{ borderRadius: "2px" }}>
        {p.tag}
      </div>

      {/* Image / emoji area */}
      <div className="relative grid aspect-square place-items-center overflow-hidden bg-gradient-to-br from-muted via-card to-background">
        <span className={`text-8xl transition-transform duration-500 group-hover:scale-110 ${sold ? "grayscale opacity-40" : ""}`}>
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
        <h3 className="line-clamp-2 font-display text-base uppercase leading-tight">{p.name}</h3>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {p.size ? `size ${p.size}` : "one size"}
          </span>
          <span className={`font-display text-lg ${sold ? "text-zinc-600 line-through" : "text-primary"}`}>
            {p.price ? `${p.price} EGP` : p.priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

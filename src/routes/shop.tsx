import { createFileRoute } from "@tanstack/react-router";
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
    <article className={`group relative overflow-hidden rounded-sm border border-border bg-card transition ${sold ? "opacity-80" : "hover:-translate-y-1 hover:border-primary"}`}>
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

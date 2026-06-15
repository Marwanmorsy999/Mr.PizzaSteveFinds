import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer, Marquee } from "@/components/site-chrome";
import { products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mr. Pizza Steve Finds — Vintage & Thrift in Zamalek, Cairo" },
      {
        name: "description",
        content:
          "Loud vintage and thrift drops curated by Steve dos Santos. 30 Hassan Assem St, Zamalek. Open daily 3PM–11PM.",
      },
      { property: "og:title", content: "Mr. Pizza Steve Finds" },
      { property: "og:description", content: "Vintage & thrift — Zamalek, Cairo. New drop available." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = products.filter((p) => p.status === "available").slice(0, 3);
  return (
    <div className="min-h-screen">
      <Header />
      <Marquee text="NEW DROP AVAILABLE 🍕" />

      <section className="noise-bg relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Open today · 3PM – 11PM
          </div>
          <h1 className="mt-6 font-display text-6xl leading-[0.85] sm:text-8xl md:text-9xl">
            Mr. Pizza<br />
            <span className="text-primary">Steve</span><br />
            Finds<span className="text-secondary">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Loud vintage. Bolder thrift. Curated by Steve dos Santos out of a tiny shop on Hassan Assem — Zamalek's worst-kept secret.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary"
            >
              Shop the drop →
            </Link>
            <a
              href="https://instagram.com/mr.pizzastevefinds"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3 font-display text-sm uppercase tracking-widest text-foreground transition hover:border-primary hover:text-primary"
            >
              @mr.pizzastevefinds
            </a>
          </div>

          <div className="mt-16 grid gap-4 border-t border-border pt-8 text-sm sm:grid-cols-3">
            <Stat label="Location" value="30 Hassan Assem St" sub="Zamalek, Cairo" />
            <Stat label="Hours" value="3PM – 11PM" sub="Every damn day" />
            <Stat label="Vibe" value="Streetwear × Thrift" sub="Pizza Steve energy" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl sm:text-5xl">Fresh on the rack</h2>
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {featured.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-sm border border-border bg-card transition hover:-translate-y-1 hover:border-primary">
              <div className="grid aspect-square place-items-center bg-gradient-to-br from-muted to-card text-7xl">
                {p.emoji}
              </div>
              <div className="p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{p.tag}</div>
                <div className="mt-1 line-clamp-2 font-display text-sm uppercase">{p.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
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

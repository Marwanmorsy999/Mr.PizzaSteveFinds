import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { products } from "@/lib/products";

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
  const featured = products.filter((p) => p.status === "available").slice(0, 3);
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero with video background */}
      <section className="relative overflow-hidden border-b border-border" style={{ minHeight: "90vh" }}>
        <video
          src="/opening.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:py-32">
          <div className="inline-flex items-center gap-2 bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground shadow-lg" style={{ borderRadius: "2px" }}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" />
            yeah we are open rn · 3pm - 11pm
          </div>
          <h1 className="mt-6 font-display text-6xl leading-[0.85] sm:text-8xl md:text-9xl">
            Mr. Pizza<br />
            <span className="text-primary">Steve</span><br />
            Finds<span className="text-secondary">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Loud vintage. Bolder thrift. Curated by Steve dos Santos out of a tiny shop on Hassan Assem - Zamalek's worst-kept secret. Don't tell everyone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary px-6 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary">
              shop the damn drop
            </Link>
            <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 font-display text-sm uppercase tracking-widest text-foreground transition hover:border-primary hover:text-primary">
              @mr.pizzastevefinds
            </a>
          </div>
          <div className="mt-16 grid gap-6 border-t border-border pt-8 text-sm sm:grid-cols-3">
            <Stat label="where tf are we" value="30 Hassan Assem St" sub="Zamalek, Cairo" />
            <Stat label="hours" value="3PM - 11PM" sub="yes every damn day" />
            <Stat label="the vibe" value="Streetwear x Thrift" sub="pizza steve energy only" />
          </div>
        </div>
      </section>

      {/* Fresh on the rack */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-5xl">Fresh on the rack</h2>
            <p className="mt-1 text-sm text-muted-foreground">these won't last long, stop sleeping fr</p>
          </div>
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-primary hover:underline">
            see all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {featured.map((p, i) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.id }}
              className={`group relative overflow-hidden border border-border bg-card transition hover:-translate-y-1 hover:border-primary ${i === 1 ? "sm:mt-4" : ""}`}>
              <div className="absolute right-2 top-2 z-10 bg-secondary px-2 py-0.5 text-[10px] font-black text-secondary-foreground shadow">
                {p.tag}
              </div>
              <div className="grid aspect-square place-items-center bg-gradient-to-br from-muted to-card text-7xl transition-transform duration-300 group-hover:scale-105">
                {p.emoji}
              </div>
              <div className="p-4">
                <div className="mt-1 line-clamp-2 font-display text-sm uppercase">{p.name}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p.size ? `size ${p.size}` : "one size"}</span>
                  <span className="font-display text-base text-primary">{p.price ? `${p.price} EGP` : p.priceLabel}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Rack photo — vibe only */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh" }}>
        <img src="/rack.jpg" alt="the rack" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary">the finds</p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-400">zamalek · cairo · hand-picked</p>
        </div>
      </div>

      {/* Callout strip */}
      <div className="border-y border-border bg-zinc-900 py-6 text-center">
        <p className="text-xl font-black uppercase tracking-widest text-white">
          new drops hit instagram first, no cap
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          follow{" "}
          <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
            @mr.pizzastevefinds
          </a>{" "}
          or miss out. genuinely your loss, we don't care
        </p>
      </div>

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
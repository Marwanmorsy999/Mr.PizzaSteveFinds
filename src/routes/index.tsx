import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mr. Pizza Steve Finds — Loud Vintage & Thrift | Zamalek, Cairo" },
      { name: "description", content: "Loud vintage and thrift drops curated by Steve dos Santos in Zamalek, Cairo." },
    ],
  }),
  component: Home,
});

function Home() {
  const available = products.filter((p) => p.status === "available").slice(0, 4);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24 sm:pb-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="font-display italic leading-[0.88] text-foreground"
              style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)" }}>
              Mr. Pizza<br />
              <span className="text-primary not-italic">Steve</span><br />
              Finds.
            </h1>
          </div>
          <div className="sm:max-w-xs sm:pt-4 sm:text-right">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Loud vintage. Bolder thrift.<br />
              Curated by Steve dos Santos out of a<br />
              tiny shop on Hassan Assem —<br />
              Zamalek's worst-kept secret.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:items-end">
              <Link
                to="/shop"
                className="inline-block border border-primary px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                Shop the drop
              </Link>
              <a
                href="https://instagram.com/mr.pizzastevefinds"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                @mr.pizzastevefinds ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-wrap gap-x-10 gap-y-2 text-xs text-muted-foreground uppercase tracking-widest">
          <span>30 Hassan Assem St, Zamalek</span>
          <span>Daily 3PM – 11PM</span>
          <span>Streetwear × Thrift</span>
        </div>
      </section>

      {/* Now in the shop — inventory list */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display text-xl italic text-muted-foreground">Now in the shop</h2>
          <Link to="/shop" className="text-xs uppercase tracking-widest text-primary hover:underline underline-offset-4">
            See all →
          </Link>
        </div>
        <div className="border-t border-border">
          {available.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-4 border-b border-border py-4 group"
            >
              <span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <span className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                {p.tag}
              </span>
              <span className="flex-1 font-display italic text-foreground group-hover:text-primary transition-colors">
                {p.name}
              </span>
              {p.size && (
                <span className="hidden sm:block text-xs text-muted-foreground shrink-0">
                  {p.size}
                </span>
              )}
              <span className="text-xs text-primary tabular-nums shrink-0">
                {p.price ? `${p.price} EGP` : p.priceLabel}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl italic text-foreground">
              New drops on Instagram first.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow along. DM to hold something.
            </p>
          </div>
          <a
            href="https://instagram.com/mr.pizzastevefinds"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 border border-primary px-6 py-3 text-xs font-medium uppercase tracking-widest text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            @mr.pizzastevefinds ↗
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

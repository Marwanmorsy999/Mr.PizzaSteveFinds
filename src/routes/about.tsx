import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, Marquee } from "@/components/site-chrome";
import { InstagramFeed } from "@/components/ui/instagram-feed";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mr. Pizza Steve Finds" },
      { name: "description", content: "The story behind Mr. Pizza Steve Finds — Steve dos Santos' vintage shop in Zamalek, Cairo. Curated loud vintage and thrift." },
      { name: "keywords", content: "about Mr Pizza Steve Finds, Steve dos Santos, Zamalek vintage, thrift shop Cairo, streetwear Egypt" },
      { property: "og:title", content: "About — Mr. Pizza Steve Finds" },
      { property: "og:description", content: "Steve dos Santos' vintage shop in Zamalek, Cairo. Loud vintage, bolder thrift." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <Header />
      <Marquee text="ZAMALEK · CAIRO · 3PM – 11PM ·" />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Story</div>
        <h1 className="mt-2 text-5xl sm:text-7xl">
          One <span className="text-primary">slice</span> of Cairo street culture.
        </h1>

        <div className="mt-10 grid gap-8 text-lg leading-relaxed text-muted-foreground sm:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <p>
              <span className="text-foreground">Mr. Pizza Steve Finds</span> is the vintage and thrift project of Steve dos Santos — a small shop in Zamalek with a loud personality and a sharper eye.
            </p>
            <p>
              Every piece is hand-picked: heavyweight tees, embroidered jorts, eyewear that has no business looking this good, and the occasional grail (RIP that Ed Hardy zip-up). Streetwear sensibility, thrift store prices, Pizza Steve energy.
            </p>
            <p>
              Pop in between 3PM and 11PM, or slide into the DMs. New drops post first on Instagram.
            </p>
            <a
              href="https://instagram.com/mr.pizzastevefinds"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-secondary"
            >
              Follow @mr.pizzastevefinds →
            </a>
          </div>
          <aside className="rounded-sm border border-border bg-card p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Find Us</div>
            <p className="mt-3 font-display text-xl uppercase leading-tight text-foreground">
              30 Hassan Assem St<br />Zamalek, Cairo 🍕
            </p>
            <p className="mt-3 text-sm">Daily · 3PM – 11PM</p>
            <p className="mt-1 text-sm">Owner: Steve dos Santos</p>
          </aside>
        </div>

        <div className="mt-12 overflow-hidden rounded-sm border border-border">
          <iframe
            title="Mr. Pizza Steve Finds location"
            src="https://www.google.com/maps?q=30+Hassan+Assem+St,+Zamalek,+Cairo&output=embed"
            width="100%"
            height="400"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block w-full grayscale"
          />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Visit Us</div>
            <p className="mt-3 font-display text-xl uppercase leading-tight text-foreground">
              30 Hassan Assem St<br />Zamalek, Cairo 🍕
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Daily · 3PM – 11PM</p>
          </div>
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Message Us</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Questions about a piece? Want to hold something? Slide into the DMs.
            </p>
            <a
              href="https://ig.me/m/mr.pizzastevefinds"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-secondary"
            >
              Instagram DM →
            </a>
          </div>
        </div>
      </section>
      <InstagramFeed />
      <Footer />
    </div>
  );
}

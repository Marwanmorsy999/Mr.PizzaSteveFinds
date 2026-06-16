import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, Marquee } from "@/components/site-chrome";
import { InstagramFeed } from "@/components/ui/instagram-feed";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Mr. Pizza Steve Finds" },
      { name: "description", content: "The story behind Mr. Pizza Steve Finds - Steve dos Santos vintage shop in Zamalek, Cairo." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <Header />
      <Marquee text="ZAMALEK · CAIRO · 3PM - 11PM · COME THRU ·" />

      {/* Market photo banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "55vh" }}>
        <img src="/market.jpg" alt="Steve sourcing at Cairo market" className="w-full h-full object-cover object-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-white">Out in the wild</p>
          <p className="mt-1 text-sm text-zinc-300">Market days · Cairo sun · Mr. Pizza Steve</p>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Story</div>
        <h1 className="mt-2 text-5xl sm:text-7xl">
          One <span className="text-primary">slice</span> of Cairo street culture.
        </h1>

        <div className="mt-10 grid gap-8 text-lg leading-relaxed text-muted-foreground sm:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <p>
              <span className="text-foreground">Mr. Pizza Steve Finds</span> is the vintage and thrift project of Steve dos Santos - a tiny shop in Zamalek with a loud personality and a sharper eye. No, seriously, this place slaps.
            </p>
            <p>
              Every single piece is hand-picked: heavyweight tees, embroidered jorts, eyewear that has no business looking this good, and the occasional grail. Streetwear sensibility, thrift store prices, Pizza Steve energy only.
            </p>
            <p>
              Pop in between 3PM and 11PM, or slide into the DMs. New drops post first on Instagram - follow or miss out, honestly.
            </p>
            <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-secondary">
              follow @mr.pizzastevefinds or else
            </a>
          </div>
          <aside className="rounded-sm border border-border bg-card p-6 h-fit">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">where tf are we</div>
            <p className="mt-3 font-display text-xl uppercase leading-tight text-foreground">
              30 Hassan Assem St<br />Zamalek, Cairo
            </p>
            <p className="mt-3 text-sm">daily · 3pm - 11pm</p>
            <p className="mt-1 text-sm text-muted-foreground">yes, every damn day</p>
            <p className="mt-3 text-sm">Owner: Steve dos Santos</p>
            <p className="mt-1 text-xs text-muted-foreground">the man himself</p>
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
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">come visit, fr</div>
            <p className="mt-3 font-display text-xl uppercase leading-tight text-foreground">
              30 Hassan Assem St<br />Zamalek, Cairo
            </p>
            <p className="mt-3 text-sm text-muted-foreground">daily · 3pm - 11pm</p>
            <p className="mt-1 text-xs text-muted-foreground">no excuses, just show up</p>
          </div>
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">slide into the dms</div>
            <p className="mt-3 text-sm text-muted-foreground">
              got a question about a piece? wanna hold something before someone else snatches it? just dm us, we are not scary.
            </p>
            <a href="https://ig.me/m/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-secondary">
              instagram dm
            </a>
          </div>
        </div>
      </section>
      <InstagramFeed />
      <Footer />
    </div>
  );
}
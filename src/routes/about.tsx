import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
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
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />

      {/* Market photo banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh" }}>
        <img
          src="/about.jpeg"
          alt="Mr. Pizza Steve market stand"
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mt-2 text-4xl sm:text-6xl lg:text-7xl leading-none">
          One <span className="text-primary">slice</span> of Cairo street culture.
        </h1>

        <div className="mt-10 grid gap-8 text-lg leading-relaxed text-muted-foreground sm:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <p>
              Pop in between 3PM and 11PM, or slide into the DMs. New drops post first on Instagram - follow or miss out, honestly.
            </p>
            <a
              href="https://instagram.com/mr.pizzastevefinds"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-secondary"
            >
              follow @mr.pizzastevefinds or else
            </a>
          </div>
          <aside className="rounded-sm border border-border bg-card p-6 h-fit">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">where are we</div>
            <p className="mt-3 font-display text-xl uppercase leading-tight text-foreground">
              30 Hassan Assem St<br />Zamalek, Cairo
            </p>
            <p className="mt-3 text-sm">daily · 3pm - 11pm</p>
            <p className="mt-1 text-sm text-muted-foreground">yes, every day</p>
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
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">come visit</div>
            <p className="mt-3 font-display text-xl uppercase leading-tight text-foreground">
              30 Hassan Assem St<br />Zamalek, Cairo
            </p>
            <p className="mt-3 text-sm text-muted-foreground">daily · 3pm - 11pm</p>
            <p className="mt-1 text-xs text-muted-foreground">no excuses, just show up</p>
          </div>
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">slide into the dms</div>
            <p className="mt-3 text-sm text-muted-foreground">
              got a question about a piece? wanna hold something before someone else snatches it? just dm us.
            </p>
            <a
              href="https://ig.me/m/mr.pizzastevefinds"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-secondary"
            >
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
import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mr. Pizza Steve Finds" },
      { name: "description", content: "The story behind Mr. Pizza Steve Finds — Steve dos Santos' vintage shop in Zamalek, Cairo." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="border-b border-border pb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">The Story</p>
          <h1 className="font-display text-4xl italic sm:text-6xl text-foreground leading-tight">
            One slice of<br />
            <span className="text-primary">Cairo</span> street culture.
          </h1>
        </div>

        <div className="mt-10 grid gap-12 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Mr. Pizza Steve Finds</span> is the vintage and thrift project of Steve dos Santos — a small shop in Zamalek with a loud personality and a sharper eye.
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
              className="inline-block border border-primary px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              Follow @mr.pizzastevefinds →
            </a>
          </div>

          <aside className="text-sm text-muted-foreground space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-foreground mb-2">Find Us</p>
              <p className="leading-relaxed">
                30 Hassan Assem St<br />
                Zamalek, Cairo
              </p>
              <p className="mt-1">Daily · 3PM – 11PM</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-foreground mb-2">Owner</p>
              <p>Steve dos Santos</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-foreground mb-2">Message</p>
              <a
                href="https://ig.me/m/mr.pizzastevefinds"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline underline-offset-4 transition"
              >
                Instagram DM →
              </a>
            </div>
          </aside>
        </div>

        {/* Map */}
        <div className="mt-16 border-t border-border pt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Where we are</p>
          <div className="overflow-hidden border border-border" style={{ height: "400px" }}>
            <iframe
              title="Mr. Pizza Steve Finds location"
              src="https://www.google.com/maps?q=30+Hassan+Assem+St,+Zamalek,+Cairo&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full grayscale"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

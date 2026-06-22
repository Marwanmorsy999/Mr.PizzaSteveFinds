import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

interface Product {
  id: string;
  name: string;
  size?: string;
  price?: number;
  priceLabel?: string;
  status: string;
  emoji: string;
  tag: string;
  imageUrl?: string;
}

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
  const [featured, setFeatured] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Array<{ name: string; text: string; rating: number; date: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem("ps_reviews") || "[]");
    } catch {
      return [];
    }
  });

  const [revForm, setRevForm] = useState({ name: "", text: "", rating: 5 });
  const [showForm, setShowForm] = useState(false);

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!revForm.name.trim() || !revForm.text.trim()) return;

    const newRev = {
      name: revForm.name,
      text: revForm.text,
      rating: revForm.rating,
      date: new Date().toLocaleDateString(),
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem("ps_reviews", JSON.stringify(updated));
    setRevForm({ name: "", text: "", rating: 5 });
    setShowForm(false);
  }

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        setFeatured(data.filter((p) => p.status === "available").slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero with video background */}
      <section className="relative overflow-hidden border-b border-border bg-[#0a0a0a]" style={{ minHeight: "90vh" }}>
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
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary active:scale-95 px-6 py-3 font-display text-sm uppercase tracking-widest text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary">
              shop the damn drop
            </Link>
            <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border active:scale-95 px-6 py-3 font-display text-sm uppercase tracking-widest text-foreground transition hover:border-primary hover:text-primary">
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
      <section className="w-full bg-[#161616] border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-5xl">Fresh on the rack</h2>
              <p className="mt-1 text-sm text-muted-foreground">these won't last long, stop sleeping fr</p>
            </div>
            <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-primary hover:underline active:scale-95">
              see all
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {featured.map((p, i) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }}
                  className={`group relative overflow-hidden border border-border bg-card transition hover:-translate-y-1 hover:border-primary active:scale-95 ${i === 1 ? "sm:mt-4" : ""}`}>
                  <div className="absolute right-2 top-2 z-10 bg-secondary px-2 py-0.5 text-[10px] font-black text-secondary-foreground shadow">
                    {p.tag}
                  </div>
                  <div className="relative grid aspect-square place-items-center bg-[#0a0a0a] border border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="text-7xl transition-transform duration-300 group-hover:scale-105">{p.emoji}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mt-1 line-clamp-2 font-display text-sm uppercase">{p.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{p.size ? `size ${p.size}` : "one size"}</span>
                      <span className="font-display text-base text-primary">
                        {p.price ? (
                          <>
                            {p.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
                          </>
                        ) : p.priceLabel}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">checking the rack...</div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="w-full bg-[#0a0a0a] border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl sm:text-5xl font-display uppercase">Customer Reviews</h2>
              <p className="mt-1 text-sm text-muted-foreground">real feedback from real people (no cap)</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="border border-zinc-700 hover:border-zinc-200 active:scale-95 text-zinc-300 hover:text-white font-bold px-5 py-2.5 text-xs tracking-widest uppercase transition-colors"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddReview} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 max-w-lg">
              <h3 className="text-white font-black text-sm tracking-wider uppercase mb-4">Leave your review</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">Your Name</label>
                  <input
                    required
                    value={revForm.name}
                    onChange={(e) => setRevForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Ahmed K."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setRevForm((f) => ({ ...f, rating: stars }))}
                        className="text-2xl transition-transform hover:scale-110 active:scale-95"
                      >
                        {stars <= revForm.rating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">Your Experience</label>
                  <textarea
                    required
                    value={revForm.text}
                    onChange={(e) => setRevForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="how was the fit, packaging, speed, etc..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-sm h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-secondary active:scale-95 text-primary-foreground font-black px-6 py-3 tracking-widest text-xs uppercase transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          )}

          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Stars n={r.rating} />
                      <span className="text-zinc-500 text-[10px]">{r.date}</span>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">"{r.text}"</p>
                  </div>
                  <p className="text-zinc-500 text-xs mt-4 font-bold tracking-widest">— {r.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-muted-foreground text-sm">No reviews yet. Be the first to leave one fr!</p>
            </div>
          )}
        </div>
      </section>

      {/* Rack photo */}
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
          <a href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4 active:scale-95 inline-block">
            @mr.pizzastevefinds
          </a>{" "}
          or miss out. genuinely your loss, we don't care
        </p>
      </div>

      <Footer />
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-zinc-100 text-sm">
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
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

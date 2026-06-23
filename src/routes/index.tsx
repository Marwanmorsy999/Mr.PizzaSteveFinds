import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

// ── Types ──────────────────────────────────────────────────────────────────
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

// ── Route ──────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mr. Pizza Steve Finds - Loud Vintage & Thrift | Zamalek, Cairo" },
      { name: "description", content: "Premium slice of a thrift. Loud vintage and thrift drops curated by Steve dos Santos in Zamalek, Cairo." },
      { name: "author", content: "Steve dos Santos" },
      { name: "theme-color", content: "#0a0a0a" },
      { property: "og:title", content: "Mr. Pizza Steve Finds - Loud Vintage & Thrift | Zamalek, Cairo" },
      { property: "og:url", content: "https://mr.pizzastevefinds.com/" },
      { property: "og:image", content: "https://mr.pizzastevefinds.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

// ── Page ───────────────────────────────────────────────────────────────────
function cloudImg(url: string, width = 600) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

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
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        {/* Background photo — right-biased so market scene stays visible */}
        <img
          src="https://res.cloudinary.com/dnggmrgmu/image/upload/w_1200,f_auto,q_auto/v1782221"
          alt="Mr. Pizza Steve thrift market stand"
          className="absolute inset-0 h-full w-full object-cover object-right"
          fetchPriority="high"
        />

        {/* Left-to-right dark fade — text side dark, photo side visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/10" />
        {/* Bottom fade for mobile readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Hero content — left aligned */}
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-center px-5 py-28 sm:px-10 md:px-16 lg:px-24">
          <div className="max-w-xl">
            {/* Live badge */}
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background/40 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-foreground backdrop-blur-sm sm:text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Drop is live
            </span>

            {/* Headline */}
            <h1
              className="text-[clamp(3.4rem,12vw,7.5rem)] leading-[0.9] tracking-tight text-foreground"
              style={{ fontFamily: "Archivo Black, Impact, sans-serif" }}
            >
              PREMIUM SLICE
              <br />
              OF A{" "}
              <span className="text-primary">THRIFT.</span>
            </h1>

            {/* Sub */}
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-foreground/80 sm:text-sm">
              Once it's gone — it's gone.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-primary px-8 py-4 text-xs font-extrabold uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 sm:px-10 sm:py-5 sm:text-sm"
              >
                Shop the Drop →
              </Link>
            </div>

            {/* Instagram handle */}
            <p className="mt-12 text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/50">
              @mr.pizzastevefinds
            </p>
          </div>
        </div>
      </section>

      {/* ── FRESH ON THE RACK ────────────────────────────────────────────── */}
      <section className="w-full border-b border-border bg-[#161616] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-2 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-5xl">Fresh on the rack</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                these won't last long, stop sleeping fr
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-black uppercase tracking-widest text-primary hover:underline active:scale-95 sm:text-sm"
            >
              see all
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {featured.map((p, i) => (
                <Link
                  key={p.id}
                  to="/product/$id"
                  params={{ id: p.id }}
                  className={`group relative overflow-hidden border border-border bg-card transition hover:-translate-y-1 hover:border-primary active:scale-95 ${
                    i === 1 ? "sm:mt-4" : ""
                  }`}
                >
                  <div className="absolute right-2 top-2 z-10 bg-secondary px-2 py-0.5 text-[10px] font-black text-secondary-foreground shadow">
                    {p.tag}
                  </div>
                  <div className="relative grid aspect-[3/4] place-items-center overflow-hidden border border-zinc-800/80 bg-[#0a0a0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                    {p.imageUrl ? (
                      <img
                        src={cloudImg(p.imageUrl ?? '')}
                        alt={p.name}
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-7xl transition-transform duration-300 group-hover:scale-105">
                        {p.emoji}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mt-1 line-clamp-2 font-display text-xs uppercase sm:text-sm">{p.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {p.size ? `size ${p.size}` : "one size"}
                      </span>
                      <span className="font-display text-base text-primary">
                        {p.price ? (
                          <>
                            {p.price}{" "}
                            <span className="ml-0.5 font-sans text-[0.65em] font-bold tracking-wider text-muted-foreground">
                              EGP
                            </span>
                          </>
                        ) : (
                          p.priceLabel
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">checking the rack...</p>
          )}
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section className="w-full border-b border-border bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-2 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl uppercase sm:text-5xl">Customer Reviews</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="border border-zinc-700 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-200 hover:text-white active:scale-95"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          </div>

          {/* Review form */}
          {showForm && (
            <form
              onSubmit={handleAddReview}
              className="mb-10 grid gap-4 border border-zinc-800 bg-zinc-900/60 p-6 sm:grid-cols-2"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</label>
                <input
                  value={revForm.name}
                  onChange={(e) => setRevForm({ ...revForm, name: e.target.value })}
                  placeholder="your name"
                  className="border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-primary focus:outline-none"
                  title="Your name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Rating
                </label>
                <select
                  value={revForm.rating}
                  onChange={(e) => setRevForm({ ...revForm, rating: Number(e.target.value) })}
                  className="border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  title="Rating"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)}{"☆".repeat(5 - n)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Review</label>
                <textarea
                  value={revForm.text}
                  onChange={(e) => setRevForm({ ...revForm, text: e.target.value })}
                  placeholder="what did you cop? how was it?"
                  rows={3}
                  className="border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-primary focus:outline-none"
                  title="Your review"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="bg-primary px-8 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition hover:bg-secondary active:scale-95"
                >
                  Post Review
                </button>
              </div>
            </form>
          )}

          {/* Review list */}
          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <div key={i} className="border border-zinc-800 bg-zinc-900/40 p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                      {r.name}
                    </span>
                    <span className="text-xs text-primary">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">{r.text}</p>
                  <p className="mt-3 text-[10px] text-zinc-600">{r.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              no reviews yet — be the first one to drop a review 🍕
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
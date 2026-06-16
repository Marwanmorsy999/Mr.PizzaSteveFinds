import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const IG = "https://instagram.com/mr.pizzastevefinds";
const SITE_URL = "https://mrpizzastevefinds.com";
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string; condition?: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mr. Pizza Steve Finds – Vintage & Thrift, Zamalek Cairo" },
      { name: "description", content: "Curated vintage and thrift clothing by Steve dos Santos. Heavyweight tees, grail pieces, streetwear finds. Located in Zamalek, Cairo. Open daily 3PM–11PM." },
      { property: "og:title", content: "Mr. Pizza Steve Finds" },
      { property: "og:description", content: "Curated vintage and thrift clothing. Zamalek, Cairo." },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: SITE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Mr. Pizza Steve Finds" },
      { name: "twitter:description", content: "Curated vintage and thrift clothing. Zamalek, Cairo." },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: HomePage,
});

const CONDITION_COLORS: Record<string, string> = {
  "Deadstock": "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  "Excellent": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  "Great": "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  "Good": "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  "Fair": "bg-orange-500/20 text-orange-400 border-orange-500/40",
};

function HomePage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(d => setNewArrivals(d.filter((p: Product) => p.status === "available").slice(0, 4)));
    fetch(`${API}/api/announcement`)
      .then(r => r.json())
      .then(d => { if (d.text) { setAnnouncement(d.text); setShowBanner(true); } });

    const handleScroll = () => {
      setShowBackTop(window.scrollY > 400);
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handleInstall);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeinstallprompt", handleInstall);
    };
  }, []);

  async function subscribe() {
    if (!email) return;
    await fetch(`${API}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubMsg("You're in. Stay tuned for drops.");
    setEmail("");
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowInstall(false);
    setDeferredPrompt(null);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Announcement Banner */}
      {showBanner && (
        <div className="bg-orange-500 text-white text-center py-2 px-4 text-xs font-bold tracking-widest flex items-center justify-center gap-4">
          <span>{announcement}</span>
          <button onClick={() => setShowBanner(false)} className="text-white/70 hover:text-white text-lg leading-none font-bold">×</button>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstall && (
        <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍕</span>
            <div>
              <p className="text-white text-xs font-bold">Install the app</p>
              <p className="text-zinc-400 text-xs">Add to home screen for quick access</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleInstallClick}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
              INSTALL
            </button>
            <button onClick={() => setShowInstall(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs px-2 transition-colors">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-12 overflow-hidden bg-zinc-950">
        <div className="relative z-10 max-w-4xl">
          <p className="text-orange-600 text-xs font-bold tracking-[0.4em] mb-8">ZAMALEK, CAIRO · ESTABLISHED 2024</p>
          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6 text-black">
            MR. PIZZA<br /><span className="text-orange-600">STEVE</span><br />FINDS
          </h1>
          <p className="text-zinc-700 text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed">Curated vintage pieces and streetwear finds from the streets of Cairo. Every item tells a story.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop" className="bg-black hover:bg-zinc-800 text-white font-bold px-8 py-4 tracking-widest transition-colors text-sm">SHOP NOW</Link>
            <a href={IG} target="_blank" rel="noreferrer"
              className="border-2 border-black hover:bg-black text-black hover:text-white font-bold px-8 py-4 tracking-widest transition-colors text-sm">
              INSTAGRAM
            </a>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-12">
            <div>
              <p className="text-orange-500 text-xs font-bold tracking-[0.3em] mb-2">JUST IN</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-widest">NEW ARRIVALS</h2>
            </div>
            <Link to="/shop" className="text-orange-500 hover:text-orange-400 text-xs font-bold tracking-widest transition-colors">VIEW SHOP →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map(p => {
              const condColor = p.condition ? (CONDITION_COLORS[p.condition] || "bg-zinc-700/50 text-zinc-300 border-zinc-600") : "";
              return (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }}
                  className="group">
                  <div className="aspect-square bg-white border border-zinc-300 overflow-hidden relative mb-4 hover:border-zinc-600 transition-colors">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300" />
                      : <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-6xl">{p.emoji}</div>}
                    {p.status === "available" && (
                      <span className="absolute top-3 left-3 text-[10px] bg-black text-white font-black px-2.5 py-1 tracking-widest">1 OF 1</span>
                    )}
                    {p.condition && (
                      <span className={`absolute top-3 right-3 text-[10px] border font-bold px-2 py-0.5 ${condColor}`}>
                        {p.condition}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-black font-bold text-sm line-clamp-2 mb-1">{p.name}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-zinc-600 text-xs">{p.size || "—"}</p>
                      <p className="text-black font-black text-sm">{p.price ? `${p.price} EGP` : p.priceLabel || "DM"}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* About */}
      <section className="bg-white border-y border-zinc-300 px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange-600 text-xs font-bold tracking-[0.3em] mb-4">THE CURATOR</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-widest text-black mb-6">PIZZA STEVE ENERGY</h2>
          <p className="text-black leading-relaxed text-lg mb-10">Steve dos Santos hunts Cairo's hidden gems — rare vintage tees, grail pieces, and streetwear finds you won't see anywhere else. Every piece is handpicked with intention.</p>
          <div className="flex gap-8 justify-center text-center">
            <div><p className="text-3xl md:text-4xl font-black text-black">6.4K</p><p className="text-zinc-700 text-xs tracking-widest">FOLLOWERS</p></div>
            <div className="w-px bg-zinc-300" />
            <div><p className="text-3xl md:text-4xl font-black text-black">2024</p><p className="text-zinc-700 text-xs tracking-widest">EST.</p></div>
            <div className="w-px bg-zinc-300" />
            <div><p className="text-3xl md:text-4xl font-black text-black">ZMK</p><p className="text-zinc-700 text-xs tracking-widest">ZAMALEK</p></div>
          </div>
        </div>
      </section>

      {/* Visit Section */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-600 text-xs font-bold tracking-[0.3em] mb-4">VISIT US</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-widest text-black">ZAMALEK SHOP</h2>
        </div>
        <div className="bg-zinc-50 border border-zinc-300 p-10 text-center">
          <p className="text-5xl mb-6">📍</p>
          <p className="text-black font-bold text-lg mb-2">30 Hassan Assem St</p>
          <p className="text-black font-bold text-lg mb-6">Zamalek, Cairo</p>
          <p className="text-zinc-700 text-base mb-8">Daily 3PM – 11PM · Walk-ins welcome</p>
          <p className="text-zinc-600 text-sm">Follow{" "}
            <a href={IG} target="_blank" rel="noreferrer" className="text-orange-600 hover:text-orange-700 font-bold">
              @mr.pizzastevefinds
            </a>{" "}
            for announcements.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 py-20 bg-black border-y border-zinc-800">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-orange-500 text-xs font-bold tracking-[0.3em] mb-4">STAY UPDATED</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-widest mb-4 text-white">GET THE DROPS</h2>
          <p className="text-zinc-400 text-sm mb-8">Be first to know when new pieces arrive.</p>
          {subMsg ? (
            <p className="text-white font-bold text-sm">{subMsg}</p>
          ) : (
            <div className="flex gap-2">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && subscribe()}
                placeholder="your@email.com"
                className="flex-1 bg-white text-black px-4 py-3 text-sm outline-none placeholder-zinc-400 border border-zinc-300"
              />
              <button onClick={subscribe}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3 text-sm transition-colors">
                SUBSCRIBE
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Back to Top */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

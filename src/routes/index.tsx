import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const IG = "https://instagram.com/mr.pizzastevefinds";

interface Product { id: string; name: string; size?: string; price?: number; priceLabel?: string; status: string; emoji?: string; tag?: string; imageUrl?: string; condition?: string; }

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mr. Pizza Steve Finds — Vintage & Thrift, Zamalek Cairo" },
      { name: "description", content: "Curated vintage and thrift clothing by Steve dos Santos. Heavyweight tees, grail pieces, streetwear finds. Located in Zamalek, Cairo. Open daily 3PM-11PM." },
      { property: "og:title", content: "Mr. Pizza Steve Finds" },
      { property: "og:description", content: "Curated vintage and thrift clothing. Zamalek, Cairo." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/products`).then(r => r.json()).then(d => setNewArrivals(d.filter((p: Product) => p.status === "available").slice(0, 4)));
    fetch(`${API}/api/announcement`).then(r => r.json()).then(d => { if (d.text) { setAnnouncement(d.text); setShowBanner(true); } });
  }, []);

  async function subscribe() {
    if (!email) return;
    await fetch(`${API}/api/newsletter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setSubMsg("You're in. Stay tuned for drops.");
    setEmail("");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {showBanner && (
        <div className="bg-orange-500 text-white text-center py-2 px-4 text-xs font-bold tracking-widest flex items-center justify-center gap-4">
          <span>{announcement}</span>
          <button onClick={() => setShowBanner(false)} className="text-white/70 hover:text-white text-lg leading-none font-bold">x</button>
        </div>
      )}

      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 via-zinc-950 to-zinc-950" />
        <div className="relative z-10 max-w-4xl">
          <p className="text-orange-400 text-xs font-bold tracking-[0.5em] mb-6">ZAMALEK, CAIRO — EST. 2024</p>
          <h1 className="text-6xl md:text-8xl font-black leading-none mb-4">
            MR. PIZZA<br /><span className="text-orange-500">STEVE</span><br />FINDS.
          </h1>
          <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">Loud vintage. Bolder thrift. Curated by Steve dos Santos.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop" className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-full tracking-widest transition-colors text-sm">SHOP NOW</Link>
            <a href={IG} target="_blank" rel="noreferrer" className="border border-zinc-600 hover:border-orange-500 text-zinc-300 hover:text-orange-400 font-bold px-8 py-4 rounded-full tracking-widest transition-colors text-sm">INSTAGRAM</a>
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="px-4 py-16 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-widest">NEW ARRIVALS</h2>
            <Link to="/shop" className="text-orange-400 hover:text-orange-300 text-sm font-bold tracking-widest transition-colors">VIEW ALL</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map(p => (
              <Link key={p.id} to="/product/$id" params={{ id: p.id }}
                className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-orange-500 transition-all hover:-translate-y-1">
                <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <span className="text-5xl">{p.emoji}</span>}
                  {p.condition && <span className="absolute top-2 right-2 text-xs bg-black/70 text-zinc-300 px-2 py-0.5 rounded">{p.condition}</span>}
                </div>
                <div className="p-3">
                  <p className="text-white font-bold text-sm line-clamp-1">{p.name}</p>
                  <p className="text-orange-400 font-black text-sm">{p.price ? `${p.price} EGP` : p.priceLabel || "DM for price"}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-zinc-900 border-y border-zinc-800 px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-widest mb-4">PIZZA STEVE ENERGY</h2>
          <p className="text-zinc-400 leading-relaxed mb-8">Steve dos Santos hunts Cairo's hidden gems — rare vintage tees, grail pieces, and streetwear finds you won't see anywhere else. Every piece is handpicked from the streets of Zamalek.</p>
          <div className="flex gap-6 justify-center text-center">
            <div><p className="text-3xl font-black text-orange-500">6.4K</p><p className="text-zinc-500 text-xs tracking-widest">FOLLOWERS</p></div>
            <div className="w-px bg-zinc-700" />
            <div><p className="text-3xl font-black text-orange-500">2024</p><p className="text-zinc-500 text-xs tracking-widest">EST.</p></div>
            <div className="w-px bg-zinc-700" />
            <div><p className="text-3xl font-black text-orange-500">ZMK</p><p className="text-zinc-500 text-xs tracking-widest">ZAMALEK</p></div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-black tracking-widest mb-8">EVENTS & POP-UPS</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-4">📍</p>
          <p className="text-white font-bold mb-2">30 Hassan Assem St, Zamalek</p>
          <p className="text-zinc-400 text-sm mb-6">Daily 3PM - 11PM · Walk-ins welcome</p>
          <p className="text-zinc-500 text-sm">Follow <a href={IG} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300">@mr.pizzastevefinds</a> for pop-up announcements and special drops.</p>
        </div>
      </section>

      <section className="px-4 py-16 bg-orange-500">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-black tracking-widest mb-2 text-white">GET THE DROPS</h2>
          <p className="text-orange-100 text-sm mb-6">Be first to know when new pieces land.</p>
          {subMsg ? <p className="text-white font-bold">{subMsg}</p> : (
            <div className="flex gap-2">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="flex-1 bg-white text-black px-4 py-3 rounded-full text-sm outline-none placeholder-zinc-400" />
              <button onClick={subscribe} className="bg-black text-white font-black px-6 py-3 rounded-full text-sm hover:bg-zinc-800 transition-colors">IN</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

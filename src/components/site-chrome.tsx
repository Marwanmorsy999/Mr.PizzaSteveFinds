import { Link } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "pizzasteve4";

const LOGO_URL = "https://res.cloudinary.com/dnggmrgmu/image/upload/w_200,f_auto,q_auto/v1782224263/logo-transparent-DpiMWMB1_nkc6ji.png";
const PIZZA_STEVE_URL = `https://res.cloudinary.com/` + CLOUD_NAME + `/image/upload/w_300,f_auto,q_auto/pizza-steve`;

const BANNERS = [
  { label: "omg new drop just dropped" },
  { label: "fresh off the rack" },
  { label: "zamalek's worst kept secret" },
  { label: "dm to hold pls or someone else will snatch it" },
  { label: "no returns but it's worth it trust" },
  { label: "these pieces are too good to be sitting here wtf" },
  { label: "buy it before ur friend does" },
];

export function RotatingBanner({ interval = 3500 }: { interval?: number }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BANNERS.length), interval);
    return () => clearInterval(t);
  }, [interval]);

  return (
    <div className="overflow-hidden border-y border-zinc-700 bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2 text-sm font-bold text-white">
        <span>{BANNERS[idx].label}</span>
      </div>
    </div>
  );
}

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Link to="/">
          <img src={LOGO_URL} alt="Mr. Pizza Steve" width={200} height={80} className="h-16 w-auto sm:h-20" />
        </Link>

        <nav className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest sm:gap-4 sm:text-sm">
          {[
            { to: "/", label: "home" },
            { to: "/shop", label: "shop" },
            { to: "/about", label: "about" },
            { to: "/cart", label: count > 0 ? `cart (${count})` : "cart" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-foreground hover:text-primary" }}
              className="px-2 py-1 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-zinc-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
        <div>
          <p className="text-xl font-black tracking-widest text-white">
            MR. PIZZA<br />
            <span className="text-primary">STEVE</span> FINDS.
          </p>
           <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
             curated vintage & thrift by steve dos santos. cairo
           </p>
           <p className="mt-2 text-xs text-zinc-600">pieces wont last long babe</p>
           <p className="mt-1 text-sm text-zinc-600">shipping with turbo · 3/5 working days</p>
           <div className="mt-3 flex gap-4">
             <Link to="/shop" className="text-sm text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">all products</Link>
             <Link to="/about" className="text-sm text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">about</Link>
           </div>
        </div>
        <div>
          <h4 className="text-xs font-black tracking-widest text-zinc-400 mb-3 uppercase">come visit</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            30 Hassan Assem St<br />Zamalek, Cairo<br />
            <span className="text-zinc-500">daily 3pm - 11pm</span>
          </p>
        </div>
        <div>
          <h4 className="text-xs font-black tracking-widest text-zinc-400 mb-3 uppercase">the gram</h4>
          <a
            href="https://instagram.com/mr.pizzastevefinds"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-secondary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground transition-colors"
          >
            @mr.pizzastevefinds
          </a>
          <p className="mt-2 text-xs text-zinc-600">drops post here first, always</p>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-[10px] tracking-[0.3em] text-zinc-600">
        © {new Date().getFullYear()} pizza steve energy
      </div>
    </footer>
  );
}

export function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="overflow-hidden border-y border-zinc-800 bg-zinc-900">
      <div
        className="flex w-max gap-8 py-2 text-sm font-black uppercase tracking-widest text-white"
        style={{ animation: "marquee 22s linear infinite" }}
      >
        {items.concat(items).map((_, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            {text} <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

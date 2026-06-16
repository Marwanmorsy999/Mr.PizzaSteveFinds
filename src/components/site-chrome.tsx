import logo from "../assets/logo-transparent.png";
import { Link } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const { count } = useCart();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    const play = () => audio.play().catch(() => {});
    document.addEventListener("click", play, { once: true });
    document.addEventListener("touchstart", play, { once: true });
    audio.play().catch(() => {
      // Blocked by browser, will retry on first interaction
    });
    return () => {
      document.removeEventListener("click", play);
      document.removeEventListener("touchstart", play);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Link to="/">
          <img src={logo} alt="Mr. Pizza Steve" className="h-16 w-auto sm:h-20" />
        </Link>

        <nav className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest sm:gap-4 sm:text-sm">
          {[
            { to: "/", label: "Home" },
            { to: "/shop", label: "Shop" },
            { to: "/about", label: "About" },
            { to: "/cart", label: `Cart${count > 0 ? ` (${count})` : ""}` },
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

          {/* Volume slider — desktop only */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <span className="text-muted-foreground">🔈</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-primary cursor-pointer"
            />
            <span className="text-muted-foreground">🔊</span>
          </div>
        </nav>
      </div>

      <audio ref={audioRef} src="/site.mp3" loop preload="auto" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-300 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
        <div>
          <p className="text-xl font-black tracking-widest text-black">MR. PIZZA<br /><span className="text-orange-600">STEVE</span> FINDS.</p>
          <p className="mt-3 text-sm text-zinc-700 leading-relaxed">
            Curated vintage & thrift by Steve dos Santos. Cairo.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-black tracking-widest text-zinc-900 mb-3">VISIT</h4>
          <p className="text-sm text-black leading-relaxed">
            30 Hassan Assem St<br />Zamalek, Cairo<br />
            <span className="text-zinc-600">Daily 3PM – 11PM</span>
          </p>
        </div>
        <div>
          <h4 className="text-xs font-black tracking-widest text-zinc-900 mb-3">FOLLOW</h4>
          <a
            href="https://instagram.com/mr.pizzastevefinds"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-orange-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors"
          >
            @mr.pizzastevefinds
          </a>
        </div>
      </div>
      <div className="border-t border-zinc-300 py-4 text-center text-[10px] uppercase tracking-[0.4em] text-zinc-600">
        © {new Date().getFullYear()} Pizza Steve Energy
      </div>
    </footer>
  );
}

export function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="overflow-hidden border-y border-zinc-800 bg-zinc-800">
      <div
        className="flex w-max gap-8 py-2 text-sm font-black uppercase tracking-widest text-white"
        style={{ animation: "marquee 22s linear infinite" }}
      >
        {items.concat(items).map((_, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            {text} <span className="text-orange-200">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-inner { animation: none; }
        }
      `}</style>
    </div>
  );
}


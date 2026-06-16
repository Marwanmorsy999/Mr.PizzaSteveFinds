import logo from "../assets/logo-transparent.png";
import { Link } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const { count } = useCart();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    const play = () => audio.play().catch(() => {});
    document.addEventListener("click", play, { once: true });
    document.addEventListener("touchstart", play, { once: true });
    audio.play().catch(() => {});
    return () => {
      document.removeEventListener("click", play);
      document.removeEventListener("touchstart", play);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Mr. Pizza Steve" className="h-12 w-auto sm:h-14" />
        </Link>

        <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {[
            { to: "/", label: "Home" },
            { to: "/shop", label: "Shop" },
            { to: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "hover:text-foreground transition-colors" }}
              className="hidden sm:block"
            >
              {l.label}
            </Link>
          ))}

          <Link
            to="/cart"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "hover:text-foreground transition-colors" }}
            className="text-xs font-medium uppercase tracking-widest"
          >
            {count > 0 ? `Cart (${count})` : "Cart"}
          </Link>

          <button
            onClick={() => setMuted((m) => !m)}
            className="text-muted-foreground hover:text-foreground transition-colors text-base leading-none"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔈"}
          </button>
        </nav>
      </div>

      <audio ref={audioRef} src="/site.mp3" loop preload="auto" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <p className="font-display text-2xl italic text-foreground leading-tight">
              Mr. Pizza<br />
              <span className="text-primary not-italic">Steve</span> Finds
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Curated vintage & thrift<br />by Steve dos Santos. Cairo.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2 text-xs uppercase tracking-widest text-foreground">Visit</p>
            <p>30 Hassan Assem St</p>
            <p>Zamalek, Cairo</p>
            <p className="mt-1">Daily · 3PM – 11PM</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2 text-xs uppercase tracking-widest text-foreground">Follow</p>
            <a
              href="https://instagram.com/mr.pizzastevefinds"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline underline-offset-4 transition"
            >
              @mr.pizzastevefinds
            </a>
            <p className="mt-2">New drops post here first.</p>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mr. Pizza Steve Finds
        </div>
      </div>
    </footer>
  );
}

export function AnnouncementBar({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="border-b border-border bg-primary/10 py-2 text-center text-xs font-medium tracking-widest text-primary uppercase">
      {text}
    </div>
  );
}

export function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="overflow-hidden border-y border-border py-2">
      <div className="flex w-max gap-8 marquee text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        {items.concat(items).map((_, i) => (
          <span key={i} className="whitespace-nowrap">
            {text} <span className="text-primary">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function RotatingBanner({ interval = 4000 }: { interval?: number }) {
  const BANNERS = [
    "New drop available",
    "Fresh off the rack",
    "DM to reserve",
    "Zamalek, Cairo · Daily 3PM–11PM",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BANNERS.length), interval);
    return () => clearInterval(t);
  }, [interval]);

  return (
    <div className="border-b border-border py-2 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
      {BANNERS[idx]}
    </div>
  );
}

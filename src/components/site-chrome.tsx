import logo from "../assets/logo-transparent.png";
import { Link } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

const BANNERS = [
  { label: "omg new drop just dropped" },
  { label: "fresh off the rack" },
  { label: "zamalek's worst kept secret" },
  { label: "dm to hold pls or someone else will snatch it" },
  { label: "no returns but it's worth it trust" },
  { label: "these pieces are too good to be sitting here wtf" },
  { label: "buy it before ur friend does" },
];

// Singleton audio — persists across route changes
let globalAudio: HTMLAudioElement | null = null;
let audioStarted = false;

function getAudio() {
  if (!globalAudio) {
    globalAudio = new Audio("/site.mp3");
    globalAudio.loop = true;
    globalAudio.volume = 0.5;
  }
  return globalAudio;
}

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
  const [volume, setVolume] = useState(0.5);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = getAudio();

    // Sync state with singleton audio instance
    setPlaying(!audio.paused);
    setVolume(audio.volume);

    // Stop music when tab/window closes
    const handleUnload = () => {
      if (globalAudio) {
        globalAudio.pause();
        globalAudio.currentTime = 0;
        audioStarted = false;
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const v = parseFloat(e.target.value);
    setVolume(v);
    getAudio().volume = v;
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = getAudio();
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      audioStarted = true;
      setPlaying(true);
    }
  };

  const stopAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    audioStarted = false;
    setPlaying(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Link to="/">
          <img src={logo} alt="Mr. Pizza Steve" className="h-16 w-auto sm:h-20" />
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

          <div className="flex items-center gap-1.5 ml-2">
            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-7 h-7 rounded-full border border-zinc-700 text-zinc-400 hover:text-primary hover:border-primary transition-colors flex-shrink-0"
              title={playing ? "pause music" : "play music"}
            >
              {playing ? (
                // Pause icon
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <rect x="0" y="0" width="3" height="12" rx="1" />
                  <rect x="7" y="0" width="3" height="12" rx="1" />
                </svg>
              ) : (
                // Play icon
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <path d="M0 0 L10 6 L0 12 Z" />
                </svg>
              )}
            </button>

            {/* Stop button */}
            <button
              onClick={stopAudio}
              className="flex items-center justify-center w-7 h-7 rounded-full border border-zinc-700 text-zinc-400 hover:text-primary hover:border-primary transition-colors flex-shrink-0"
              title="stop music"
            >
              {/* Stop icon (square) */}
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <rect x="0" y="0" width="8" height="8" rx="0.5" />
              </svg>
            </button>

            <span className="hidden sm:inline text-muted-foreground text-xs">vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:block w-20 accent-primary cursor-pointer"
            />
          </div>
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

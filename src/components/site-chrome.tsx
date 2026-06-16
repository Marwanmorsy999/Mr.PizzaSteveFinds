import logo from "../assets/logo.png";
import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 font-display text-lg uppercase">
          <img src={logo} alt="Mr. Pizza Steve" className="h-10 w-auto" />
        </Link>
        <nav className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest sm:gap-4 sm:text-sm">
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
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-xl">Mr. Pizza Steve Finds</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Vintage & thrift curated by Steve dos Santos. Loud, bold, Cairo.
          </p>
        </div>
        <div>
          <h4 className="text-sm">Visit</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            30 Hassan Assem St<br />Zamalek, Cairo<br />Daily · 3PM – 11PM
          </p>
        </div>
        <div>
          <h4 className="text-sm">Follow the Drops</h4>
          
            href="https://instagram.com/mr.pizzastevefinds"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-secondary"
          >
            @mr.pizzastevefinds →
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        © {new Date().getFullYear()} Pizza Steve Energy
      </div>
    </footer>
  );
}

export function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="overflow-hidden border-y border-border bg-primary text-primary-foreground">
      <div className="marquee flex w-max gap-8 py-2 text-sm font-black uppercase tracking-widest">
        {items.concat(items).map((i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            {text} <span>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

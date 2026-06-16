import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { products, type Product } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Mr. Pizza Steve Finds" },
      { name: "description", content: "Browse the current drop: tees, jorts, eyewear, Harley Davidson and more vintage finds in Zamalek, Cairo." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const available = products.filter((p) => p.status === "available");
  const sold = products.filter((p) => p.status === "sold");

  return (
    <div className="min-h-screen">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Current Drop</p>
            <h1 className="font-display text-4xl italic sm:text-6xl text-foreground leading-tight">
              The Shop.
            </h1>
          </div>
          <p className="text-sm text-muted-foreground sm:text-right max-w-xs">
            DM{" "}
            <a className="text-primary underline underline-offset-4" href="https://instagram.com/mr.pizzastevefinds" target="_blank" rel="noreferrer">
              @mr.pizzastevefinds
            </a>{" "}
            to reserve, or come grab it at the shop.
          </p>
        </div>

        {/* Available items — full inventory list */}
        {available.length > 0 && (
          <div className="mt-8">
            <div className="hidden sm:grid grid-cols-[2rem_5rem_1fr_6rem_7rem] gap-4 pb-2 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>#</span>
              <span>Type</span>
              <span>Item</span>
              <span>Size</span>
              <span className="text-right">Price</span>
            </div>
            {available.map((p, i) => (
              <ProductRow key={p.id} p={p} index={i} />
            ))}
          </div>
        )}

        {/* Sold items */}
        {sold.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl italic text-muted-foreground mb-1">Sold — gone forever.</h2>
            <div className="border-t border-border">
              {sold.map((p, i) => (
                <ProductRow key={p.id} p={p} index={i} sold />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ProductRow({ p, index, sold = false }: { p: Product; index: number; sold?: boolean }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className={`flex sm:grid sm:grid-cols-[2rem_5rem_1fr_6rem_7rem] items-center gap-4 border-b border-border py-4 group transition-colors ${
        sold ? "opacity-50" : "hover:bg-muted/30"
      }`}
    >
      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {String(index + 1).padStart(2, "0")}.
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 w-16 sm:w-auto">
        {p.tag}
      </span>
      <span className={`font-display italic flex-1 sm:flex-none leading-snug transition-colors ${
        sold ? "line-through" : "text-foreground group-hover:text-primary"
      }`}>
        {p.name}
        {p.size && (
          <span className="sm:hidden ml-2 not-italic text-xs text-muted-foreground no-underline">
            · {p.size}
          </span>
        )}
      </span>
      <span className="hidden sm:block text-xs text-muted-foreground">
        {p.size ?? "—"}
      </span>
      <span className={`text-xs tabular-nums shrink-0 text-right ml-auto sm:ml-0 ${
        sold ? "text-muted-foreground" : "text-primary"
      }`}>
        {p.price ? `${p.price} EGP` : p.priceLabel ?? "—"}
      </span>
    </Link>
  );
}

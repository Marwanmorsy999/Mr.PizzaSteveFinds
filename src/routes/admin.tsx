import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header } from "@/components/site-chrome";
import type { Product } from "@/lib/products";

const API_URL = import.meta.env.VITE_API_URL ?? "https://pizzasteve-api.m-2396.workers.dev";
const ADMIN_SECRET = "pizzasteve2024";

const TAGS = ["TEE", "JORTS", "ACCESSORIES", "DROP", "GRAIL", "JACKET", "PANTS", "SHOES", "OTHER"];
const EMOJIS = ["👕", "🩳", "🕶️", "🏍️", "🔥", "🧥", "👖", "👟", "🧵", "🐊", "✔️", "💎", "⚜️"];

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4 rounded-sm border border-border bg-card p-8">
          <div className="text-center">
            <div className="text-3xl">🍕</div>
            <h1 className="mt-2 font-display text-2xl uppercase">Admin Access</h1>
            <p className="mt-1 text-xs text-muted-foreground">Mr. Pizza Steve Finds</p>
          </div>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pw === ADMIN_SECRET) { setAuthed(true); setPwError(false); }
                else setPwError(true);
              }
            }}
            className="w-full rounded-sm border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          {pwError && <p className="text-xs text-destructive">Wrong password</p>}
          <button
            onClick={() => {
              if (pw === ADMIN_SECRET) { setAuthed(true); setPwError(false); }
              else setPwError(true);
            }}
            className="w-full rounded-sm bg-primary py-2 font-display text-sm uppercase tracking-widest text-primary-foreground hover:bg-secondary"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Dashboard</div>
            <h1 className="mt-1 font-display text-4xl uppercase">Admin Panel</h1>
          </div>
        </div>
        <AddProduct />
        <ProductTable />
      </div>
    </div>
  );
}

function AddProduct() {
  const [form, setForm] = useState({
    name: "", size: "", price: "", tag: "TEE", emoji: "👕", status: "available",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleAdd() {
    if (!form.name.trim()) return;
    setLoading(true);
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Date.now();
    await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
      body: JSON.stringify({
        id,
        name: form.name,
        size: form.size || null,
        price: form.price ? parseInt(form.price) : null,
        price_label: form.price ? null : "Price TBD",
        status: form.status,
        emoji: form.emoji,
        tag: form.tag,
      }),
    });
    setForm({ name: "", size: "", price: "", tag: "TEE", emoji: "👕", status: "available" });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    window.dispatchEvent(new Event("products-updated"));
  }

  return (
    <div className="mb-10 rounded-sm border border-border bg-card p-6">
      <h2 className="mb-4 font-display text-xl uppercase">Add New Item</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          placeholder="Item name *"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          placeholder="Size (e.g. M, L, 30/31)"
          value={form.size}
          onChange={(e) => set("size", e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          placeholder="Price in EGP (leave empty = TBD)"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          type="number"
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={form.tag}
          onChange={(e) => set("tag", e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {TAGS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select
          value={form.emoji}
          onChange={(e) => set("emoji", e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>
      </div>
      <button
        onClick={handleAdd}
        disabled={loading || !form.name.trim()}
        className="mt-4 rounded-sm bg-primary px-6 py-2 font-display text-sm uppercase tracking-widest text-primary-foreground hover:bg-secondary disabled:opacity-50"
      >
        {loading ? "Adding..." : success ? "Added ✓" : "Add Item"}
      </button>
    </div>
  );
}

function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch(`${API_URL}/api/products`);
    setProducts(await res.json());
  }

  useEffect(() => {
    load();
    window.addEventListener("products-updated", load);
    return () => window.removeEventListener("products-updated", load);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": ADMIN_SECRET },
    });
    load();
  }

  async function handlePriceUpdate(id: string) {
    const val = editing[id];
    const price = val === "" ? null : parseInt(val);
    await fetch(`${API_URL}/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
      body: JSON.stringify({ price, price_label: price ? null : "Price TBD" }),
    });
    setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
    load();
  }

  async function toggleStatus(p: Product) {
    await fetch(`${API_URL}/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
      body: JSON.stringify({ status: p.status === "available" ? "sold" : "available" }),
    });
    load();
  }

  return (
    <div className="rounded-sm border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-xl uppercase">All Products ({products.length})</h2>
      </div>
      <div className="divide-y divide-border">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
            <span className="text-2xl">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="truncate font-display text-sm uppercase">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.size ? `Size ${p.size} · ` : ""}{p.tag}
              </div>
            </div>

            {/* Price editor */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={p.price ? `${p.price}` : "TBD"}
                value={editing[p.id] ?? ""}
                onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: e.target.value }))}
                className="w-24 rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
              />
              {editing[p.id] !== undefined && (
                <button
                  onClick={() => handlePriceUpdate(p.id)}
                  className="rounded-sm bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground hover:bg-secondary"
                >
                  Save
                </button>
              )}
            </div>

            {/* Status toggle */}
            <button
              onClick={() => toggleStatus(p)}
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                p.status === "available"
                  ? "bg-success text-success-foreground"
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {p.status === "available" ? "Available" : "Sold"}
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDelete(p.id)}
              className="rounded-sm border border-destructive px-3 py-1 text-xs font-bold uppercase text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

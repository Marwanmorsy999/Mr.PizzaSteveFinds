import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Header } from "@/components/site-chrome";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Sharqia", "Dakahlia",
  "Gharbia", "Menoufia", "Beheira", "Kafr El Sheikh", "Damietta",
  "Port Said", "Ismailia", "Suez", "North Sinai", "South Sinai",
  "Faiyum", "Beni Suef", "Minya", "Asyut", "Sohag", "Qena",
  "Luxor", "Aswan", "Red Sea", "New Valley", "Matruh",
];

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", governorate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steveWhatsapp, setSteveWhatsapp] = useState("201XXXXXXXXX");

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then(res => res.json())
      .then(data => { if (data?.whatsapp) setSteveWhatsapp(data.whatsapp); })
      .catch(() => {});
  }, []);

  function f(patch: Partial<typeof form>) { setForm(p => ({ ...p, ...patch })); }

  async function submit() {
    if (!form.name.trim()) return setError("Name is required");
    if (!form.phone.trim()) return setError("Phone number is required");
    if (!form.address.trim()) return setError("Address is required");
    if (!form.governorate) return setError("Please select a governorate");
    setError("");
    setLoading(true);

    try {
      const orderItems = cart.items.map(i => ({
        productId: i.id, name: i.name, size: i.size, price: i.price,
        priceLabel: i.priceLabel, quantity: i.quantity,
      }));

      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          address: `${form.address}, ${form.governorate}`,
          pickup: false,
          items: orderItems,
          total: cart.total,
        }),
      });

      if (res.status === 409) {
        setError("Someone just grabbed that. It's gone. Head back to the shop.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.success) throw new Error("Order failed");

      const itemLines = cart.items
        .map(i => `• ${i.name}${i.size ? ` (${i.size})` : ""} — ${i.price ? `${i.price} EGP` : "DM price"}`)
        .join("\n");

      const waMsg = encodeURIComponent(
        `🍕 NEW ORDER #${data.orderId}\n\n` +
        `Customer: ${form.name}\n` +
        `Phone: ${form.phone}\n` +
        `Address: ${form.address}, ${form.governorate}\n` +
        `\nItems:\n${itemLines}\n\n` +
        `Total: ${cart.total > 0 ? `${cart.total} EGP` : "Price TBC"}`
      );

      cart.clear();
      navigate({ to: "/order-confirmation", search: { orderId: data.orderId, waLink: `https://wa.me/${steveWhatsapp}?text=${waMsg}` } });
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (cart.items.length === 0) {
    navigate({ to: "/shop" });
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto max-w-lg px-4 py-16 sm:py-20">

        {/* Title */}
        <div className="mb-10 border-b border-border pb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-2">Checkout</p>
          <h1 className="font-display text-4xl sm:text-5xl uppercase leading-none">Your Details</h1>
        </div>

        {/* Order summary */}
        <div className="mb-8 border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Your Order</p>
          </div>
          <div className="divide-y divide-border">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 h-12 overflow-hidden bg-[#0a0a0a] border border-zinc-800 flex-shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-xl">{item.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm uppercase tracking-wide truncate">{item.name}</p>
                  {item.size && <p className="text-xs text-muted-foreground mt-0.5">Size {item.size}</p>}
                </div>
                <span className="font-display text-sm text-foreground flex-shrink-0">
                  {item.price ? (
                    <>{item.price} <span className="text-[0.65em] text-muted-foreground">EGP</span></>
                  ) : "—"}
                </span>
              </div>
            ))}
          </div>
          {cart.total > 0 && (
            <div className="border-t border-border px-5 py-4 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total</span>
              <span className="font-display text-lg text-foreground">
                {cart.total} <span className="text-[0.65em] text-muted-foreground">EGP</span>
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
              Full Name <span className="text-primary">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => f({ name: e.target.value })}
              placeholder="Ahmed Mohamed"
              className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
              Phone Number <span className="text-primary">*</span>
            </label>
            <input
              value={form.phone}
              onChange={e => f({ phone: e.target.value })}
              placeholder="01012345678"
              type="tel"
              className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
              Address <span className="text-primary">*</span>
            </label>
            <input
              value={form.address}
              onChange={e => f({ address: e.target.value })}
              placeholder="Street, building, apartment..."
              className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Governorate */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
              Governorate <span className="text-primary">*</span>
            </label>
            <select
              value={form.governorate}
              onChange={e => f({ governorate: e.target.value })}
              className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled>Select governorate</option>
              {GOVERNORATES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary disabled:opacity-50 text-primary-foreground font-display text-sm uppercase tracking-widest py-4 transition-colors active:scale-[0.99]"
          >
            {loading ? "Sending..." : "Place Order →"}
          </button>

          <p className="text-[10px] text-center text-muted-foreground">
            Steve will contact you to confirm your order.
          </p>
        </div>
      </div>
    </div>
  );
}
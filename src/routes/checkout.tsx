import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Header } from "@/components/site-chrome";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "", pickup: true });
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
    if (!form.pickup && !form.address.trim()) return setError("Address is required for delivery");
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
          address: form.pickup ? "PICKUP — Zamalek" : form.address,
          notes: form.notes,
          pickup: form.pickup,
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
        `${form.pickup ? "Pickup: Zamalek" : `Delivery: ${form.address}`}\n` +
        (form.notes ? `Notes: ${form.notes}\n` : "") +
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

        {/* Page title */}
        <div className="mb-10 border-b border-border pb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-2">Checkout</p>
          <h1 className="font-display text-4xl sm:text-5xl uppercase leading-none">Reserve Your Piece</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Fill in your details — Steve confirms everything personally. Don't overthink it.
          </p>
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
            <p className="mt-1.5 text-[10px] text-muted-foreground">Steve will contact you on this number to confirm.</p>
          </div>

          {/* Pickup vs Delivery */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
              Fulfilment
            </label>
            <div className="grid grid-cols-2 gap-px border border-border bg-border">
              <button
                onClick={() => f({ pickup: true })}
                className={`py-3.5 text-xs font-black uppercase tracking-widest transition-colors ${
                  form.pickup
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Pickup · Zamalek
              </button>
              <button
                onClick={() => f({ pickup: false })}
                className={`py-3.5 text-xs font-black uppercase tracking-widest transition-colors ${
                  !form.pickup
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Delivery
              </button>
            </div>
            {form.pickup && (
              <p className="mt-1.5 text-[10px] text-muted-foreground">30 Hassan Assem St, Zamalek · Daily 3pm – 11pm</p>
            )}
          </div>

          {/* Delivery address */}
          {!form.pickup && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
                Delivery Address <span className="text-primary">*</span>
              </label>
              <textarea
                value={form.address}
                onChange={e => f({ address: e.target.value })}
                placeholder="Street, area, city — be specific"
                className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-foreground transition-colors h-20 resize-none"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
              Notes <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={e => f({ notes: e.target.value })}
              placeholder="Size concerns, special requests, anything else..."
              className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-foreground transition-colors h-20 resize-none"
            />
          </div>

          {/* Payment notice */}
          <div className="border border-dashed border-border px-5 py-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
              💳 Online Payment Coming Soon
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Steve will sort out payment when he contacts you.
            </p>
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
            {loading ? "Placing Your Order..." : "Reserve This →"}
          </button>

          <p className="text-[10px] text-center text-muted-foreground">
            By reserving you agree to be contacted by Steve to confirm your order.
          </p>
        </div>
      </div>
    </div>
  );
}

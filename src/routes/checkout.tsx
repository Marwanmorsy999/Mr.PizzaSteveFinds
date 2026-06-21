import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "", pickup: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steveWhatsapp, setSteveWhatsapp] = useState("201XXXXXXXXX"); // Fallback default

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.whatsapp) {
          setSteveWhatsapp(data.whatsapp);
        }
      })
      .catch(err => console.error("Error loading settings:", err));
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
        productId: i.id, name: i.name, size: i.size, price: i.price, priceLabel: i.priceLabel,
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

      const data = await res.json();
      if (!data.success) throw new Error("Order failed");

      // Build WhatsApp message to Steve
      const itemLines = cart.items.map(i => `• ${i.name}${i.size ? ` (${i.size})` : ""} — ${i.price ? `${i.price} EGP` : "DM price"}`).join("\n");
      const waMsg = encodeURIComponent(
        `🍕 NEW ORDER #${data.orderId}\n\n` +
        `Customer: ${form.name}\n` +
        `Phone: ${form.phone}\n` +
        `${form.pickup ? "Pickup: Zamalek" : `Delivery: ${form.address}`}\n` +
        (form.notes ? `Notes: ${form.notes}\n` : "") +
        `\nItems:\n${itemLines}\n\n` +
        `Total: ${cart.total > 0 ? `${cart.total} EGP` : "Price TBC"}`
      );
      const waLink = `https://wa.me/${steveWhatsapp}?text=${waMsg}`;

      cart.clear();
      navigate({ to: "/order-confirmation", search: { orderId: data.orderId, waLink } });
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
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-black tracking-widest mb-2">CHECKOUT 🍕</h1>
        <p className="text-zinc-500 text-sm mb-8">almost there — fill in ur details and steve will confirm everything. don't overthink it.</p>

        {/* Order summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <p className="text-xs text-zinc-500 tracking-widest mb-3">ur order 🛒</p>
          {cart.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 mb-2 last:mb-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-lg">{item.emoji}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.name}</p>
                {item.size && <p className="text-zinc-600 text-xs">Size: {item.size}</p>}
              </div>
              <span className="text-zinc-100 font-black text-sm flex-shrink-0">
                {item.price ? (
                  <>
                    {item.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
                  </>
                ) : "—"}
              </span>
            </div>
          ))}
          {cart.total > 0 && (
            <div className="border-t border-zinc-800 mt-3 pt-3 flex justify-between">
              <span className="text-zinc-400 text-sm">Total</span>
              <span className="text-white font-black">
                {cart.total} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">ur name *</label>
            <input value={form.name} onChange={e => f({ name: e.target.value })} placeholder="Ahmed Mohamed"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-sm" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">phone number * (so steve can reach u)</label>
            <input value={form.phone} onChange={e => f({ phone: e.target.value })} placeholder="01012345678" type="tel"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-sm" />
          </div>

          {/* Pickup vs delivery */}
          <div>
            <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">how do u want it? 👀</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => f({ pickup: true })}
                className={`py-3 rounded-xl text-sm font-bold border transition-colors ${form.pickup ? "bg-zinc-800 border-zinc-200 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                📍 Pickup (Zamalek)
              </button>
              <button onClick={() => f({ pickup: false })}
                className={`py-3 rounded-xl text-sm font-bold border transition-colors ${!form.pickup ? "bg-zinc-800 border-zinc-200 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                🚚 Delivery
              </button>
            </div>
          </div>

          {!form.pickup && (
            <div>
              <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">delivery address * (be specific pls)</label>
              <textarea value={form.address} onChange={e => f({ address: e.target.value })} placeholder="street, area, city..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-sm h-20 resize-none" />
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 tracking-widest mb-1.5 block">any notes? (optional, but go off)</label>
            <textarea value={form.notes} onChange={e => f({ notes: e.target.value })} placeholder="any special requests, size concerns, whatever..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-sm h-16 resize-none" />
          </div>

          {/* Payment placeholder */}
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs tracking-widest">💳 ONLINE PAYMENT COMING SOON</p>
            <p className="text-zinc-600 text-xs mt-1">steve will sort out payment when he hits u back, chill</p>
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={submit} disabled={loading}
            className="w-full bg-zinc-800 hover:bg-zinc-800 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-black py-4 rounded-xl tracking-widest transition-all text-sm">
            {loading ? "placing ur order..." : "YEAH, RESERVE THIS SHIT →"}
          </button>

          <p className="text-zinc-600 text-xs text-center">
            by reserving u agree to let steve contact u to confirm. he's chill, don't worry about it.
          </p>
        </div>
      </div>
    </div>
  );
}


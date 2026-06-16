import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";
import { Header, Footer } from "@/components/site-chrome";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        <p className="text-6xl mb-6">🛒</p>
        <h1 className="text-2xl font-black tracking-widest mb-2">YOUR CART IS EMPTY</h1>
        <p className="text-zinc-500 text-sm mb-2">bro what are you doing, go find something fire.</p>
        <p className="text-zinc-600 text-xs mb-8">seriously, the rack is waiting for you</p>
        <Link to="/shop" className="bg-primary hover:bg-secondary text-primary-foreground font-black px-8 py-4 tracking-widest transition-colors text-sm">
          BROWSE THE FINDS
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black tracking-widest">YOUR CART</h1>
            <button onClick={cart.clear} className="text-xs text-zinc-600 hover:text-red-400 transition-colors tracking-widest">
              nuke it all
            </button>
          </div>
          <p className="text-zinc-500 text-xs mb-8">don't sleep on this, these pieces won't wait around</p>

          <div className="space-y-3 mb-8">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">{item.emoji}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                  {item.size && <p className="text-zinc-500 text-xs">size: {item.size}</p>}
                  <p className="text-zinc-100 font-black text-sm mt-0.5">
                    {item.price ? `${item.price} EGP` : item.priceLabel || "dm for price"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to="/product/$id" params={{ id: item.id }}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                    view
                  </Link>
                  <button onClick={() => cart.remove(item.id)}
                    className="w-7 h-7 rounded-lg border border-red-900/50 text-red-600 hover:bg-red-900/30 hover:text-red-400 transition-colors flex items-center justify-center text-xs">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400 text-sm">{cart.count} item{cart.count !== 1 ? "s" : ""} in ur cart</span>
              <span className="text-white font-bold">
                {cart.total > 0 ? `${cart.total} EGP` : "price on request"}
              </span>
            </div>
            {cart.items.some(i => !i.price) && (
              <p className="text-zinc-600 text-xs mt-1">some items don't have a set price yet - steve will sort it out with you, don't stress</p>
            )}
            <div className="border-t border-zinc-800 mt-4 pt-4">
              <span className="text-zinc-500 text-xs">pickup or delivery in zamalek, ur call</span>
            </div>
          </div>

          <button onClick={() => navigate({ to: "/checkout" })}
            className="w-full bg-primary hover:bg-secondary text-primary-foreground font-black py-4 tracking-widest transition-all text-sm">
            YEAH I WANT THIS
          </button>
          <Link to="/shop"
            className="block text-center mt-4 text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
            keep looking, there's more good stuff
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
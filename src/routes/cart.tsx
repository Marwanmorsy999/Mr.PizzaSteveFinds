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
         <p className="text-zinc-500 text-sm mb-8">Browse our current drop to find something you like.</p>
         <Link to="/shop" className="bg-primary hover:bg-secondary active:scale-95 text-primary-foreground font-black px-8 py-4 tracking-widest transition-colors text-sm">
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
            <button onClick={cart.clear} className="text-xs text-zinc-600 hover:text-red-400 active:scale-95 transition-colors tracking-widest">
              Clear all
            </button>
          </div>
          <p className="text-zinc-500 text-xs mb-8">Review your items before checkout.</p>

          <div className="space-y-3 mb-8">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">{item.emoji}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-2">{item.name}</p>
                  {item.size && <p className="text-zinc-500 text-xs">size: {item.size}</p>}
                  <p className="text-zinc-100 font-black text-sm mt-0.5">
                    {item.price ? (
                      <>
                        {item.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
                      </>
                    ) : item.priceLabel || "dm for price"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center border border-zinc-700 rounded-lg">
                    <button onClick={() => cart.remove(item.id)}
                      className="px-2 py-0.5 text-zinc-300 hover:text-white transition-colors text-xs">−</button>
                    <span className="px-2 py-0.5 text-xs font-bold text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                    <button onClick={() => { const ex = cart.items.find(i => i.id === item.id); if (ex) cart.add({ id: ex.id, name: ex.name, price: ex.price, priceLabel: ex.priceLabel, imageUrl: ex.imageUrl, size: ex.size, emoji: ex.emoji }); }}
                      className="px-2 py-0.5 text-zinc-300 hover:text-white transition-colors text-xs">+</button>
                  </div>
                  <Link to="/product/$id" params={{ id: item.id }}
                    className="text-xs text-zinc-600 hover:text-zinc-400 active:scale-95 transition-colors">
                    view
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400 text-sm">{cart.count} item{cart.count !== 1 ? "s" : ""} in your cart</span>
              <span className="text-white font-bold">
                {cart.total > 0 ? (
                  <>
                    {cart.total} <span className="text-[0.65em] font-sans font-bold tracking-wider text-muted-foreground ml-0.5">EGP</span>
                  </>
                ) : "price on request"}
              </span>
            </div>
            {cart.items.some(i => !i.price) && (
              <p className="text-zinc-600 text-xs mt-1">Some items have no set price — Steve will confirm with you directly.</p>
            )}
            <div className="border-t border-zinc-800 mt-4 pt-4">
              <span className="text-zinc-500 text-xs">Pickup or delivery available in Zamalek.</span>
            </div>
          </div>

          <button onClick={() => navigate({ to: "/checkout" })}
            className="w-full bg-primary hover:bg-secondary active:scale-95 text-primary-foreground font-black py-4 tracking-widest transition-all text-sm">
            PROCEED TO CHECKOUT
          </button>
          <Link to="/shop"
            className="block text-center mt-4 text-zinc-600 hover:text-zinc-400 active:scale-95 text-sm transition-colors">
            Continue shopping
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
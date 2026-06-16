import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price?: number;
  priceLabel?: string;
  imageUrl?: string;
  size?: string;
  emoji?: string;
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
}

const Ctx = createContext<CartCtx>({
  items: [], add: () => {}, remove: () => {}, clear: () => {}, count: 0, total: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("ps_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("ps_cart", JSON.stringify(items));
  }, [items]);

  function add(item: CartItem) {
    setItems(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item]);
  }
  function remove(id: string) { setItems(prev => prev.filter(i => i.id !== id)); }
  function clear() { setItems([]); }

  const count = items.length;
  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);

  return <Ctx.Provider value={{ items, add, remove, clear, count, total }}>{children}</Ctx.Provider>;
}

export function useCart() { return useContext(Ctx); }

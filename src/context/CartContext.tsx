import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price?: number;
  priceLabel?: string;
  imageUrl?: string;
  size?: string;
  emoji?: string;
  quantity?: number;
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
    setItems(prev => {
      // Each piece is 1 of 1 — block duplicates
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
  }
  function remove(id: string) {
    // Always remove the whole item — no quantity decrement
    setItems(prev => prev.filter(i => i.id !== id));
  }
  function clear() { setItems([]); }

  const count = items.length;
  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);

  return <Ctx.Provider value={{ items, add, remove, clear, count, total }}>{children}</Ctx.Provider>;
}

export function useCart() { return useContext(Ctx); }
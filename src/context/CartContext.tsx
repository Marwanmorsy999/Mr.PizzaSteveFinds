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
  add: (item: CartItem, qty?: number) => void;
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

  function add(item: CartItem, qty: number = 1) {
    const itemQty = item.quantity ?? qty;
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + itemQty } : i);
      }
      return [...prev, { ...item, quantity: itemQty }];
    });
  }
  function remove(id: string) {
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && (existing.quantity || 1) > 1) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: (i.quantity || 1) - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  }
  function clear() { setItems([]); }

  const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  return <Ctx.Provider value={{ items, add, remove, clear, count, total }}>{children}</Ctx.Provider>;
}

export function useCart() { return useContext(Ctx); }

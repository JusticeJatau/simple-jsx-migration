import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "tradish_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);
  const increment = useCallback((id) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p)));
  }, []);
  const decrement = useCallback((id) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p)).filter((p) => p.quantity > 0));
  }, []);
  const remove = useCallback((id) => setItems((prev) => prev.filter((p) => p.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const totalItems = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
    return { items, add, increment, decrement, remove, clear, totalItems, subtotal };
  }, [items, add, increment, decrement, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
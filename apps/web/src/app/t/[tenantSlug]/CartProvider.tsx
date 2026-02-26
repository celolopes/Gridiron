"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children, tenantSlug }: { children: React.ReactNode; tenantSlug: string }) {
  const storageKey = `gridiron-cart-${tenantSlug}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, hydrated, storageKey]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const key = item.variantId || item.productId;
      const existing = prev.find((i) => (i.variantId || i.productId) === key);
      if (existing) {
        return prev.map((i) => ((i.variantId || i.productId) === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => {
        const key = variantId || productId;
        return (i.variantId || i.productId) !== key;
      }),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => {
          const key = variantId || productId;
          return (i.variantId || i.productId) === key ? { ...i, quantity } : i;
        }),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setCartOpen(false);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, setCartOpen }}>{children}</CartContext.Provider>;
}

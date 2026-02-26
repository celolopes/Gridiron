"use client";

import React from "react";
import { useCart } from "./CartProvider";
import { ShoppingBag } from "lucide-react";

export function CartButton() {
  const { totalItems, setCartOpen } = useCart();

  return (
    <button onClick={() => setCartOpen(true)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors relative text-zinc-900 dark:text-white">
      <ShoppingBag className="w-[22px] h-[22px]" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg shadow-accent/40 animate-bounce">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  );
}

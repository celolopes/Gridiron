"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";

export function CartPanel({ tenantSlug }: { tenantSlug: string }) {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)} />}

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-zinc-950 border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Carrinho <span className="text-accent">({totalItems})</span>
            </h2>
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="w-16 h-16 text-zinc-700" />
              <p className="text-zinc-500 font-medium">Seu carrinho está vazio</p>
              <button onClick={() => setCartOpen(false)} className="px-6 py-2 rounded-full bg-accent text-white text-sm font-bold uppercase tracking-widest hover:bg-accent/80 transition-colors">
                Explorar Catálogo
              </button>
            </div>
          ) : (
            items.map((item) => {
              const key = item.variantId || item.productId;
              return (
                <div key={key} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{item.name}</h3>
                    {item.variantName && <p className="text-xs text-zinc-400 mt-0.5">{item.variantName}</p>}
                    <p className="text-accent font-bold mt-1">{fmt(item.price)}</p>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3 text-white" />
                      </button>
                      <span className="text-sm font-bold text-white w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="ml-auto w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium">Total</span>
              <span className="text-2xl font-black text-white">{fmt(totalPrice)}</span>
            </div>
            <Link
              href={`/t/${tenantSlug}/checkout`}
              onClick={() => setCartOpen(false)}
              className="block w-full py-4 rounded-full bg-accent text-white text-center font-black uppercase tracking-widest text-sm hover:bg-accent/90 transition-colors shadow-xl shadow-accent/20"
            >
              Finalizar Compra
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

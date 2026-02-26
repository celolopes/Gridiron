"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "../CartProvider";
import { API_URL } from "../../../../../lib/api";
import { ShoppingBag, ChevronLeft, Trash2, Shield, Truck, CreditCard } from "lucide-react";

export default function CheckoutPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = React.use(params);
  const { items, totalPrice, removeItem, clearCart, totalItems } = useCart();

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
  });

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      await fetch(`${API_URL}/tenants/${tenantSlug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "BEGIN_CHECKOUT" }),
      }).catch(() => {});

      const res = await fetch(`${API_URL}/tenants/${tenantSlug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "guest-id",
          paymentMethodPreference: "PIX_MANUAL",
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: `${formData.address}, ${formData.number} ${formData.complement} - ${formData.neighborhood}, ${formData.city} - ${formData.cep}`,
          items: items.map((item) => ({
            variantId: item.variantId || item.productId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        clearCart();
      } else {
        alert("Erro ao processar pedido. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Pedido Recebido!</h2>
          <p className="text-zinc-400 leading-relaxed">Em instantes enviaremos seu link de pagamento Pix por e-mail para finalizar a compra.</p>
          <Link href={`/t/${tenantSlug}`} className="inline-block w-full py-4 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-sm hover:bg-accent/90 transition-colors">
            Voltar para a Loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Breadcrumb */}
        <Link href={`/t/${tenantSlug}/products`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Continuar Comprando</span>
        </Link>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-10">
          Finalizar <span className="text-accent">Compra</span>
        </h1>

        {items.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <ShoppingBag className="w-16 h-16 mx-auto text-zinc-700" />
            <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-400">Carrinho vazio</h2>
            <Link href={`/t/${tenantSlug}/products`} className="inline-block px-8 py-3 rounded-full bg-accent text-white font-bold uppercase tracking-widest text-sm">
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              {/* Customer Data */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" />
                  Dados do Cliente
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={formData.name}
                    onChange={handleChange("name")}
                    placeholder="Nome completo"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder="E-mail"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    placeholder="Telefone / WhatsApp"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm md:col-span-2"
                  />
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-accent" />
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={formData.cep}
                    onChange={handleChange("cep")}
                    placeholder="CEP"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                  <input
                    value={formData.address}
                    onChange={handleChange("address")}
                    placeholder="Endereço"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                  <input
                    value={formData.number}
                    onChange={handleChange("number")}
                    placeholder="Número"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                  <input
                    value={formData.complement}
                    onChange={handleChange("complement")}
                    placeholder="Complemento"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                  <input
                    value={formData.neighborhood}
                    onChange={handleChange("neighborhood")}
                    placeholder="Bairro"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                  <input
                    value={formData.city}
                    onChange={handleChange("city")}
                    placeholder="Cidade"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-accent focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <h2 className="text-lg font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Pagamento
                </h2>
                <div className="p-4 rounded-2xl border-2 border-accent/30 bg-accent/5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-white">Pix Manual</p>
                      <p className="text-xs text-zinc-400">O link será enviado por e-mail após a solicitação.</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-4 border-accent flex-shrink-0" />
                </div>
              </div>

              {/* Submit (mobile) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-sm hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 lg:hidden"
              >
                {loading ? "Processando..." : `Solicitar Pix • ${fmt(totalPrice)}`}
              </button>
            </form>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white/5 border border-white/5 rounded-3xl p-6 space-y-6">
                <h2 className="text-lg font-black uppercase tracking-tight text-white">Resumo do Pedido</h2>

                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {items.map((item) => {
                    const key = item.variantId || item.productId;
                    return (
                      <div key={key} className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                          {item.variantName && <p className="text-xs text-zinc-500">{item.variantName}</p>}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-accent font-bold">
                              {item.quantity}x {fmt(item.price)}
                            </span>
                            <button onClick={() => removeItem(item.productId, item.variantId)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Subtotal ({totalItems} itens)</span>
                    <span className="text-white font-bold">{fmt(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Frete</span>
                    <span className="text-emerald-400 font-bold">A combinar</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-2xl font-black text-accent">{fmt(totalPrice)}</span>
                  </div>
                </div>

                {/* Submit (desktop) */}
                <button
                  type="submit"
                  form=""
                  disabled={loading}
                  onClick={handleSubmit as any}
                  className="hidden lg:block w-full py-4 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-sm hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                >
                  {loading ? "Processando..." : "Solicitar Pix e Finalizar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

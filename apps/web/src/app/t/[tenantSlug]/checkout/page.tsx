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
  const [orderData, setOrderData] = React.useState<any>(null);
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
        const order = await res.json();
        setSuccess(true);
        setOrderData(order);
        clearCart();
      } else {
        alert("Erro ao processar pedido. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePixLink = () => {
    // In a real app we would return the actual PIX payload here, for now we mock it
    return `00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865405${orderData?.totalAmount || "0.00"}5802BR5913${tenantSlug}6008BRASILIA62070503***63041234`;
  };

  const copyPix = () => {
    navigator.clipboard.writeText(generatePixLink());
    alert("Chave PIX copiada! Abra o app do seu banco para pagar.");
  };

  const sendWhatsApp = () => {
    const text = `Olá, fiz um pedido de ${fmt(orderData?.totalAmount || 0)} na loja ${tenantSlug}. Qual a chave PIX?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
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
          <p className="text-zinc-400 leading-relaxed">
            Seu pedido está reservado. <strong className="text-white">Para garantir o pagamento</strong>, pague o total de {fmt(orderData?.totalAmount || 0)} agora:
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">Chave PIX</h3>
            <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden">
              <input type="text" readOnly value={generatePixLink()} className="bg-transparent text-sm w-full px-4 text-zinc-400 focus:outline-none" />
              <button onClick={copyPix} className="bg-accent px-4 py-3 text-white font-bold text-sm whitespace-nowrap hover:bg-accent/80 transition-colors">
                Copiar
              </button>
            </div>
            <button onClick={sendWhatsApp} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.47-1.761-1.643-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Avisar Pagamento no WhatsApp
            </button>
          </div>

          <p className="text-zinc-500 text-sm">Também enviamos uma cópia para o seu e-mail!</p>

          <Link href={`/t/${tenantSlug}`} className="inline-block w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors mt-4">
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

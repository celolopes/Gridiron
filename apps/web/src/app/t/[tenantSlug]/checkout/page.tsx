"use client";

import * as React from "react";
import { GlassCard, GlassInput, GlassButton } from "@gridiron/ui";

export default function CheckoutPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  // Using React.use to unwrap params in Next 15+ client component rules
  const { tenantSlug } = React.use(params);

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock tracking event
      await fetch(`http://localhost:3001/tenants/${tenantSlug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "BEGIN_CHECKOUT" }),
      }).catch(console.error);

      // Create Order
      const res = await fetch(`http://localhost:3001/tenants/${tenantSlug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "guest-id", // MVP: Guest checkout
          paymentMethodPreference: "PIX_MANUAL",
          items: [
            { variantId: "mock-variant-id", quantity: 1 }, // Hardcoded for view MVP without cart state
          ],
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Erro ao processar pedido.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 max-w-lg mt-20 text-center">
        <GlassCard intensity="high" className="p-8">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Pedido Recebido!</h2>
          <p className="text-muted-foreground mb-8">Em instantes enviaremos seu link de pagamento Pix por e-mail para finalizar a compra.</p>
          <a href={`/t/${tenantSlug}`}>
            <GlassButton variant="primary" className="w-full">
              Voltar para a loja
            </GlassButton>
          </a>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Finalizar Compra</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Dados do Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <GlassInput placeholder="Nome completo" required />
            <GlassInput type="email" placeholder="E-mail" required />
            <GlassInput type="tel" placeholder="Telefone / WhatsApp" required className="col-span-2" />
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput placeholder="CEP" required className="md:col-span-1" />
            <GlassInput placeholder="Endereço" required className="md:col-span-1 xl:col-span-2" />
            <GlassInput placeholder="Número" required />
            <GlassInput placeholder="Complemento" />
            <GlassInput placeholder="Bairro" required />
            <GlassInput placeholder="Cidade" required />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pagamento</h2>
          <div className="p-4 rounded-xl border border-glass-border bg-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Pix Manual</p>
                <p className="text-sm text-muted-foreground">O link será enviado por e-mail após a solicitação.</p>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full border-4 border-accent" />
          </div>
        </GlassCard>

        <GlassButton type="submit" size="lg" className="w-full text-lg shadow-xl shadow-accent/20" disabled={loading}>
          {loading ? "Processando..." : "Solicitar Pix e Finalizar Pedido"}
        </GlassButton>
      </form>
    </div>
  );
}

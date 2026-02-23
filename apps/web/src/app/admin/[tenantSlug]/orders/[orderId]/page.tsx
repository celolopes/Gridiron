"use client";

import * as React from "react";

export default function AdminOrderDetail({ params }: { params: Promise<{ tenantSlug: string; orderId: string }> }) {
  const { tenantSlug, orderId } = React.use(params);

  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [pixLink, setPixLink] = React.useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:3001/tenants/${tenantSlug}/orders`, {
        headers: { Authorization: "Bearer mock-admin-token" },
      });
      const orders = await res.json();
      const found = orders.find((o: any) => o.id === orderId);
      setOrder(found);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrder();
  }, [tenantSlug, orderId]);

  const handleSendLink = async () => {
    if (!pixLink) return alert("Insira o link Pix");
    await fetch(`http://localhost:3001/tenants/${tenantSlug}/orders/${orderId}/payment-link`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer mock-admin-token" },
      body: JSON.stringify({ url: pixLink }),
    });
    alert("Link enviado ao cliente!");
    fetchOrder();
  };

  const handleMarkPaid = async () => {
    if (!confirm("Confirmar que o pagamento foi recebido?")) return;
    await fetch(`http://localhost:3001/tenants/${tenantSlug}/orders/${orderId}/mark-paid`, {
      method: "PATCH",
      headers: { Authorization: "Bearer mock-admin-token" },
    });
    alert("Pedido marcado como pago!");
    fetchOrder();
  };

  if (loading) return <div>Carregando pedido...</div>;
  if (!order) return <div>Pedido não encontrado.</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <a href={`/admin/${tenantSlug}/orders`} className="text-neutral-400 hover:text-white">
          ← Voltar
        </a>
        <h2 className="text-3xl font-black">Detalhes do Pedido</h2>
        <span className="px-3 py-1 text-xs font-bold rounded-full border bg-neutral-800 text-neutral-300 border-neutral-700">{order.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Itens</h3>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-neutral-800 last:border-0">
                  <div>
                    <p className="font-semibold text-white">Variant ID: {item.variantId}</p>
                    <p className="text-sm text-neutral-400">
                      Qtd: {item.quantity} | Fulfillment: {item.fulfillmentType}
                    </p>
                  </div>
                  <p className="font-bold text-accent">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unitPrice)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-black text-2xl text-white">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Ações de Pagamento (Fase 1)</h3>

            {order.status === "REQUESTED_PAYMENT" && (
              <div className="space-y-4">
                <p className="text-sm text-neutral-400">1. Gere o link Pix no InfinitePay (ou outro).</p>
                <input
                  type="url"
                  placeholder="Cole o link Pix gerado aqui"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:ring-accent outline-none"
                  value={pixLink}
                  onChange={(e) => setPixLink(e.target.value)}
                />
                <button onClick={handleSendLink} className="w-full bg-accent text-white font-bold rounded-lg px-4 py-2 hover:bg-accent/80 transition-colors">
                  Confirmar e Enviar Link
                </button>
              </div>
            )}

            {order.status === "LINK_SENT" && (
              <div className="space-y-4">
                <p className="text-sm text-neutral-400">
                  Link enviado:{" "}
                  <a href={order.paymentLinkManualUrl} className="text-accent hover:underline break-all">
                    {order.paymentLinkManualUrl}
                  </a>
                </p>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-500 font-medium">Aguardando cliente pagar...</p>
                </div>
                <button onClick={handleMarkPaid} className="w-full bg-emerald-500 text-white font-bold rounded-lg px-4 py-2 hover:bg-emerald-600 transition-colors mt-2">
                  Marcar como Pago
                </button>
              </div>
            )}

            {order.status === "PAID" && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-500 font-bold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                  Pago em {new Date(order.paidAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

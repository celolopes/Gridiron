import { fetchApi } from "../../../../lib/api";
import { GlassCard, GlassButton } from "@gridiron/ui";
import { Package, Truck, CheckCircle, Clock, CreditCard, ShoppingBag, MapPin } from "lucide-react";
import Link from "next/link";
import { API_URL } from "../../../../lib/api";

async function getOrder(orderNumber: string) {
  try {
    return await fetchApi<any>(`/public/orders/${orderNumber}`, {
      next: { revalidate: 30 },
    });
  } catch (e) {
    return null;
  }
}

export default async function PublicOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <GlassCard className="p-12 text-center max-w-md border-white/10">
          <h1 className="text-3xl font-bold mb-4">Pedido não encontrado</h1>
          <p className="text-zinc-400 mb-8">Verifique o número do pedido e tente novamente.</p>
          <Link href="/">
            <GlassButton className="w-full">Voltar ao Início</GlassButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const steps = [
    { id: "REQUESTED_PAYMENT", label: "Pagamento Solicitado", icon: Clock, color: "text-zinc-500" },
    { id: "PAID", label: "Pagamento Confirmado", icon: CreditCard, color: "text-emerald-500" },
    { id: "PROCESSING", label: "Em Processamento", icon: ShoppingBag, color: "text-blue-500" },
    { id: "SHIPPED", label: "Enviado", icon: Truck, color: "text-purple-500" },
    { id: "DELIVERED", label: "Entregue", icon: CheckCircle, color: "text-emerald-400" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === order.status);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-inter">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <p className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-2">Acompanhamento de Pedido</p>
            <h1 className="text-4xl md:text-5xl font-outfit font-black tracking-tight">#{order.orderNumber}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-zinc-500 text-sm">Loja</p>
              <p className="font-bold">{order.tenant.brandName || order.tenant.name}</p>
            </div>
            {order.tenant.logoUrl && (
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 p-2 overflow-hidden">
                <img src={order.tenant.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Status Timeline */}
            <GlassCard className="p-8 border-white/5">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Package className="text-blue-500" size={24} /> Status do Envio
              </h2>
              <div className="relative">
                {steps.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex gap-4 mb-8 last:mb-0 relative font-outfit">
                      {idx !== steps.length - 1 && <div className={`absolute left-5 top-10 w-0.5 h-8 ${idx < currentStepIndex ? "bg-blue-500" : "bg-white/10"}`} />}
                      <div
                        className={`z-10 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-white/5 border border-white/10"}`}
                      >
                        <Icon size={18} className={isActive ? "text-white" : "text-zinc-600"} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className={`font-bold transition-all duration-500 ${isActive ? "text-white" : "text-zinc-600"}`}>{step.label}</p>
                        {step.id === order.status && <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5 italic">Status Atual</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Items */}
            <GlassCard className="p-8 border-white/5">
              <h2 className="text-xl font-bold mb-6">Itens do Pedido</h2>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="h-16 w-16 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-sm text-zinc-500">
                        {item.variant} • Qtd: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-outfit font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-8">
            {/* Summary */}
            <GlassCard className="p-8 border-white/5 bg-blue-600/5">
              <h2 className="text-xl font-bold mb-6 italic font-outfit">Resumo</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.totalAmount - order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Frete</span>
                  <span className="text-blue-400 font-medium">
                    {order.shippingAmount > 0 ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.shippingAmount) : "Grátis"}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black text-blue-500">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.totalAmount)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <div className="flex gap-2">
                  <Clock size={14} className="shrink-0" />
                  <p>Iniciado em {new Date(order.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </div>
              </div>
            </GlassCard>

            {/* Support */}
            <GlassCard className="p-8 border-white/5">
              <h2 className="text-lg font-bold mb-4">Precisa de ajuda?</h2>
              <p className="text-sm text-zinc-500 mb-6">Entre em contato com o suporte da loja para qualquer dúvida sobre seu pedido.</p>
              <GlassButton className="w-full bg-white text-black hover:bg-zinc-200">Suporte pelo WhatsApp</GlassButton>
            </GlassCard>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-zinc-600 hover:text-white transition-colors text-sm">
            Gridiron • Sua loja do seu jeito
          </Link>
        </div>
      </main>
    </div>
  );
}

import { fetchApi } from "../../../../../lib/api";
import { GlassCard, GlassButton } from "@gridiron/ui";
import { DollarSign, TrendingUp, ShoppingBag, Percent, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getFinancialData(tenantSlug: string, token: string) {
  try {
    // We need tenantId for analytics endpoint, but we have tenantSlug.
    // Usually, the backend should handle slug conversion or we fetch tenant first.
    // For now, let's assume we can lookup by slug or get ID from tenant meta.
    const tenant = await fetchApi<any>(`/tenants/${tenantSlug}`, { adminToken: token });
    return await fetchApi<any>(`/tenants/${tenant.id}/analytics/financial`, { adminToken: token });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function FinancePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const data = await getFinancialData(tenantSlug, token);

  if (!data) {
    return (
      <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl m-8">
        <h2 className="text-xl font-bold mb-2 font-outfit text-white">Ops! Erro ao carregar dados financeiros.</h2>
        <p className="text-neutral-400">Verifique sua conexão ou permissões administrativas.</p>
      </div>
    );
  }

  const safeData = {
    totalRevenue: data.totalRevenue || 0,
    totalProfit: data.totalProfit || 0,
    averageMargin: data.averageMargin || 0,
    ticketMedio: data.ticketMedio || 0,
    paidOrdersCount: data.paidOrdersCount || 0,
    totalItemsSold: data.totalItemsSold || 0,
  };

  const stats = [
    { label: "Receita Total", value: safeData.totalRevenue, icon: DollarSign, color: "text-emerald-500", suffix: "" },
    { label: "Lucro Estimado", value: safeData.totalProfit, icon: TrendingUp, color: "text-blue-500", suffix: "" },
    { label: "Margem Média", value: safeData.averageMargin, icon: Percent, color: "text-purple-500", suffix: "%" },
    { label: "Ticket Médio", value: safeData.ticketMedio, icon: ShoppingBag, color: "text-amber-500", suffix: "" },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2 font-outfit">Financeiro</h1>
        <p className="text-zinc-500">Visão geral de performance e rentabilidade da sua loja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <GlassCard key={idx} className="p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} />
                +12.5%
              </div>
            </div>
            <p className="text-zinc-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black font-outfit">
              {stat.suffix === "%" ? `${stat.value.toFixed(1)}%` : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stat.value)}
            </h3>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-outfit">Fluxo de Caixa (Simulado)</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Últimos 30 dias</option>
              <option>Últimos 7 dias</option>
            </select>
          </div>
          <div className="h-[300px] w-full flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 50, 60, 75, 55, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-400/20 rounded-t-lg transition-all hover:from-blue-500 group relative" style={{ height: `${h}%` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  R$ {h * 150}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
            <span>Jan</span>
            <span>Fev</span>
            <span>Mar</span>
            <span>Abr</span>
            <span>Mai</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Ago</span>
            <span>Set</span>
            <span>Out</span>
            <span>Nov</span>
            <span>Dez</span>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/5">
          <h3 className="text-xl font-bold font-outfit mb-6">Informações da Operação</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Pedidos Pagos</p>
                  <p className="text-xs text-zinc-500">Último mês</p>
                </div>
              </div>
              <p className="font-outfit font-black text-lg">{data.paidOrdersCount}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Itens Vendidos</p>
                  <p className="text-xs text-zinc-500">Total acumulado</p>
                </div>
              </div>
              <p className="font-outfit font-black text-lg">{data.totalItemsSold}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <GlassButton className="w-full">Exportar Relatório PDF</GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

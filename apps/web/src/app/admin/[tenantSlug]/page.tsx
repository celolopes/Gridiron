import { fetchApi } from "../../../../lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let suggestions: any[] = [];
  let metrics: any = {
    totalRevenue: 0,
    paidOrdersCount: 0,
    awaitingPaymentCount: 0,
    ordersTodayCount: 0,
  };
  let tenant: any = null;

  try {
    const [suggestionsData, metricsData, tenantData] = (await Promise.all([
      fetchApi(`/tenants/${tenantSlug}/analytics/suggestions`, { adminToken: token }).catch((e) => {
        console.error(e);
        return [];
      }),
      fetchApi(`/tenants/${tenantSlug}/analytics/financial`, { adminToken: token }).catch((e) => {
        console.error(e);
        return null;
      }),
      fetchApi(`/tenants/${tenantSlug}`).catch((e) => {
        console.error(e);
        return null;
      }),
    ])) as [any[], any, any];
    suggestions = suggestionsData || [];
    metrics = metricsData || {
      totalRevenue: 0,
      totalProfit: 0,
      paidOrdersCount: 0,
      awaitingPaymentCount: 0,
      ordersTodayCount: 0,
    };
    tenant = tenantData;
  } catch (e) {
    console.error("Failed to fetch dashboard data", e);
  }

  const settings = tenant?.settings;
  const storeUrl = `/t/${tenantSlug}`;

  return (
    <div className="space-y-8">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-2 text-white">Seu Império está Online! 🚀</h2>
          <p className="text-neutral-400 text-lg mb-8 leading-relaxed">Sua loja já foi configurada com os produtos Elite. Agora é só compartilhar o link abaixo e começar a vender.</p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 bg-black/40 border border-neutral-700 rounded-xl p-4 flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-1">Link de Divulgação</span>
                <code className="text-blue-400 font-mono text-sm">{`gridiron.app${storeUrl}`}</code>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>

            <a
              href={storeUrl}
              target="_blank"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Visualizar Minha Loja
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-neutral-500 font-medium">Status: Ativa e Recebendo Pedidos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-neutral-500 font-medium">Plano: {tenant?.subscriptionPlan || "FREE"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors group">
          <p className="text-neutral-400 font-medium text-sm group-hover:text-neutral-300 transition-colors">Pedidos Hoje</p>
          <p className="text-3xl font-bold mt-2 truncate">{metrics.ordersTodayCount || 0}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors group">
          <p className="text-neutral-400 font-medium text-sm group-hover:text-neutral-300 transition-colors">Aguardando Pagamento</p>
          <p className="text-3xl font-bold mt-2 truncate text-orange-500">{metrics.awaitingPaymentCount || 0}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors group">
          <p className="text-neutral-400 font-medium text-sm group-hover:text-neutral-300 transition-colors">Receita (Total Pago)</p>
          <p className="text-3xl font-bold mt-2 truncate text-green-500">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(metrics.totalRevenue || 0)}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors group">
          <p className="text-neutral-400 font-medium text-sm group-hover:text-neutral-300 transition-colors">Lucro Bruto</p>
          <p className="text-3xl font-bold mt-2 truncate">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(metrics.totalProfit || 0)}</p>
        </div>
      </div>

      {/* PRO Benefits Section */}
      {(settings?.subscriptionPlan === "PRO" || tenant?.subscriptionPlan === "PRO") && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-8 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-2xl">✨</span> Benefícios Supremos do Plano PRO
            </h3>
            <p className="text-blue-200/80 mb-6">Os selos de limitação foram retirados. Você está pronto para escalar com força máxima.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="text-blue-400 font-bold">♾️</span>
                </div>
                <h4 className="text-white font-bold mb-1">Catálogo Ilimitado</h4>
                <p className="text-sm text-neutral-400">Sem limites de 20 produtos. Importe quantos itens do Aliexpress quiser para preencher as vitrines da sua loja.</p>
              </div>
              <div className="bg-black/40 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="text-blue-400 font-bold">🛒</span>
                </div>
                <h4 className="text-white font-bold mb-1">Volume Desbloqueado</h4>
                <p className="text-sm text-neutral-400">Venda no automático. Não existem mais os bloqueios de vendas simultâneas ou faturamento estagnado do modo de teste.</p>
              </div>
              <div className="bg-black/40 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                  <span className="text-purple-400 font-bold">🏢</span>
                </div>
                <h4 className="text-white font-bold mb-1">Múltiplas Lojas</h4>
                <p className="text-sm text-neutral-400">Gostou das oportunidades? Crie novos domínios e nichos independentes utilizando o link 'Trocar / Criar Loja' na barra superior.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Table */}
      <div>
        <h3 className="text-xl font-bold mb-4">O que importar (Sugestões via Demand Score)</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950/50 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">SKU / Produto</th>
                <th className="px-6 py-4 font-medium text-right">Demand Score (14d)</th>
                <th className="px-6 py-4 font-medium text-right">Qtd. Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {suggestions.map((s: any) => (
                <tr key={s.productId} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{s.sku}</td>
                  <td className="px-6 py-4 text-right text-accent font-semibold">{s.demandScore14d}</td>
                  <td className="px-6 py-4 text-right font-bold">{s.suggestionQty} un.</td>
                </tr>
              ))}
              {suggestions.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                    Sem sugestões no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

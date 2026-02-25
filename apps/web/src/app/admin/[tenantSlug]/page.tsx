import { fetchApi } from "../../../../lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  let suggestions: any[] = [];
  try {
    suggestions = await fetchApi(`/tenants/${tenantSlug}/analytics/suggestions`, { adminToken: token });
  } catch (e) {
    console.error("Failed to fetch suggestions", e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-2">Visão Geral</h2>
        <p className="text-neutral-400">Bem-vindo ao painel administrativo. Aqui está o resumo das suas vendas.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <p className="text-neutral-400 font-medium text-sm">Pedidos Hoje</p>
          <p className="text-3xl font-bold mt-2">14</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <p className="text-neutral-400 font-medium text-sm">Aguardando Pagamento</p>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <p className="text-neutral-400 font-medium text-sm">Receita (30d)</p>
          <p className="text-3xl font-bold mt-2">R$ 12.450</p>
        </div>
      </div>

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

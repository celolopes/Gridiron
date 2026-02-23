import { fetchApi } from "../../../../../lib/api";

export default async function AdminOrdersPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;

  let orders: any[] = [];
  try {
    orders = await fetchApi(`/tenants/${tenantSlug}/orders`, { adminToken: "mock-admin-token" });
  } catch (e) {
    console.error("Failed to fetch admin orders", e);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REQUESTED_PAYMENT":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "LINK_SENT":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PAID":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black mb-2">Pedidos</h2>
        <button className="px-4 py-2 bg-neutral-800 text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors">Filtrar</button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950/50 text-neutral-400 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4 font-medium">ID Pedido</th>
              <th className="px-6 py-4 font-medium">Data</th>
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Status FASE 1</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
              <th className="px-6 py-4 font-medium text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{o.id.split("-")[0]}...</td>
                <td className="px-6 py-4 text-neutral-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{o.user?.email || o.userId}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(o.status)}`}>{o.status}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(o.totalAmount)}</td>
                <td className="px-6 py-4 text-right">
                  <a href={`/admin/${tenantSlug}/orders/${o.id}`} className="text-accent hover:underline font-medium">
                    Ver detalhes
                  </a>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { fetchApi } from "../../../../../lib/api";
import { GlassCard, GlassButton } from "@gridiron/ui";
import { Truck, Mail, Calendar, CheckCircle2, ChevronRight, Plus } from "lucide-react";
import { cookies } from "next/headers";

async function getSuppliers(tenantSlug: string, token: string) {
  try {
    // For now, listing all suppliers. In a real multi-tenant SaaS,
    // we might have platform-suppliers or tenant-specific ones.
    return (await fetchApi<any[]>(`/tenants/${tenantSlug}/suppliers`, { adminToken: token })) || [];
  } catch (e) {
    return [];
  }
}

export default async function SuppliersPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  const suppliers = await getSuppliers(tenantSlug, token || "");

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 font-outfit">Fornecedores</h1>
          <p className="text-zinc-500">Gestão de dropshipping e estoque.</p>
        </div>
        <GlassButton className="bg-blue-600 text-white font-bold">
          <Plus size={20} className="mr-2" /> Novo Fornecedor
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length > 0 ? (
          suppliers.map((supplier: any) => (
            <GlassCard key={supplier.id} className="p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{supplier.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${supplier.supportsDropshipping ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <p className="text-xs text-zinc-500">{supplier.supportsDropshipping ? "Ativo para Dropshipping" : "Apenas Estoque Local"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail size={14} /> <span>{supplier.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar size={14} />{" "}
                  <span>
                    Lead Time: <strong>{supplier.leadTimeDays} dias</strong>
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ver Catálogo</span>
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="col-span-full p-12 text-center border-white/5 border-dashed bg-transparent">
            <Truck className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-medium">Nenhum fornecedor cadastrado ainda.</p>
            <p className="text-xs text-zinc-600 mt-1 italic">Cadastre seu primeiro parceiro para habilitar o Dropshipping.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

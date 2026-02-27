"use client";

import { useState } from "react";
import { GlassCard, GlassButton } from "@gridiron/ui";
import { Truck, Mail, Calendar, ChevronRight, Plus, Edit2, Loader2 } from "lucide-react";

export default function SuppliersClient({ initialSuppliers, tenantSlug, token }: { initialSuppliers: any[]; tenantSlug: string; token: string }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    leadTimeDays: 15,
    supportsDropshipping: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactEmail: supplier.contactEmail || "",
        leadTimeDays: supplier.leadTimeDays,
        supportsDropshipping: supplier.supportsDropshipping,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: "",
        contactEmail: "",
        leadTimeDays: 15,
        supportsDropshipping: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingSupplier ? `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenantSlug}/suppliers/${editingSupplier.id}` : `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenantSlug}/suppliers`;

      const method = editingSupplier ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to save supplier");
      }

      const savedSupplier = await res.json();

      if (editingSupplier) {
        setSuppliers(suppliers.map((s) => (s.id === savedSupplier.id ? savedSupplier : s)));
      } else {
        setSuppliers([savedSupplier, ...suppliers]);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar fornecedor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 font-outfit">Fornecedores</h1>
          <p className="text-zinc-500">Gestão de dropshipping e estoque.</p>
        </div>
        <GlassButton onClick={() => openModal()} className="bg-blue-600 text-white font-bold">
          <Plus size={20} className="mr-2" /> Novo Fornecedor
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length > 0 ? (
          suppliers.map((supplier: any) => (
            <GlassCard key={supplier.id} className="p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group relative">
              <button
                title="Editar Fornecedor"
                onClick={() => openModal(supplier)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 size={16} />
              </button>
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
                  <Mail size={14} /> <span>{supplier.contactEmail || "Sem email configurado"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar size={14} />{" "}
                  <span>
                    Lead Time Padrão: <strong>{supplier.leadTimeDays} dias</strong>
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ver Catálogo</span>
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <GlassCard className="translate-y-0 w-full max-w-lg p-6 bg-neutral-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold font-outfit mb-4">{editingSupplier ? "Ajustar Fornecedor" : "Novo Fornecedor"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Fornecedor</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail de Contato (opcional)</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="contato@fornecedor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Lead Time (Dias para envio)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="ex: 15"
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="supportsDropshipping"
                  checked={formData.supportsDropshipping}
                  onChange={(e) => setFormData({ ...formData, supportsDropshipping: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-black/30 text-blue-500 cursor-pointer"
                />
                <label htmlFor="supportsDropshipping" className="text-sm font-medium text-zinc-300 cursor-pointer">
                  Suporta Dropshipping Direto
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                <GlassButton type="button" onClick={closeModal} className="bg-transparent hover:bg-white/5 border border-white/10 text-zinc-300">
                  Cancelar
                </GlassButton>
                <GlassButton type="submit" disabled={isLoading} className="bg-blue-600 text-white font-bold w-32 flex justify-center">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Salvar"}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

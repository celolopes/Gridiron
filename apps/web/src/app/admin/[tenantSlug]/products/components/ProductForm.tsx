"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, GlassInput, GlassButton } from "@gridiron/ui";
import { Save, ChevronLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "../../../../../../lib/api";

interface ProductFormProps {
  tenantSlug: string;
  token: string;
  initialData?: any;
}

export default function ProductForm({ tenantSlug, token, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    costPrice: initialData?.costPrice?.toString() || "",
    category: initialData?.category || "Jerseys",
    imageUrl: initialData?.images?.[0]?.url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!initialData?.id;
    const endpoint = `/tenants/${tenantSlug}/catalog/products${isEdit ? `/${initialData.id}` : ""}`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      await fetchApi(endpoint, {
        method,
        adminToken: token,
        body: JSON.stringify({
          ...formData,
          images: formData.imageUrl ? [formData.imageUrl] : [],
        }),
      });

      router.push(`/admin/${tenantSlug}/products`);
      router.refresh();
    } catch (err: any) {
      console.error("Submit error", err);
      alert(`Erro: ${err.message || "Falha ao salvar produto"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/admin/${tenantSlug}/products`} className="flex items-center text-neutral-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Voltar para Lista
        </Link>
        <h2 className="text-2xl font-black">{initialData ? "Editar Jersey" : "Nova Jersey Elite"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8 border-neutral-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Informações Gerais</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Nome da Jersey</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Jersey Kansas City Home - Mahomes #15"
                  className="w-full bg-black/40 border border-neutral-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none text-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Descrição Detalhada</label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o material, tecnologia, detalhes bordados..."
                  className="w-full bg-black/40 border border-neutral-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none text-white transition-all resize-none"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8 border-neutral-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Mídia e Imagem</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">URL da Imagem (Principal)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-black/40 border border-neutral-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 outline-none text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {formData.imageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-700 bg-black/20">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-8 border-neutral-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Preço e Lucro</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Preço de Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0,00"
                  className="w-full bg-black/40 border border-neutral-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none text-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Custo Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0,00"
                  className="w-full bg-black/40 border border-neutral-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none text-white transition-all font-mono"
                />
              </div>

              {formData.price && formData.costPrice && (
                <div className="pt-4 mt-4 border-t border-neutral-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Margem Estimada:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(formData.price) - parseFloat(formData.costPrice))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {initialData ? "Atualizar Jersey" : "Salvar Jersey"}
            </button>
            <Link href={`/admin/${tenantSlug}/products`} className="block">
              <button type="button" className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all">
                Cancelar
              </button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

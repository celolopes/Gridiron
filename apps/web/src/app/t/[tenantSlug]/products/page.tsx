import { fetchApi } from "../../../../../lib/api";
import { GlassButton } from "@gridiron/ui";
import Link from "next/link";
import { ShoppingBag, Star, SlidersHorizontal } from "lucide-react";

export default async function CatalogPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  let products: any[] = [];
  try {
    products = await fetchApi(`/tenants/${tenantSlug}/catalog/products`);
  } catch (e) {
    console.error("Failed to fetch catalog");
  }

  return (
    <div className="container mx-auto px-6 pt-32 pb-24">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
            Catálogo <span className="text-accent underline decoration-4 underline-offset-8">Completo</span>
          </h1>
          <p className="text-zinc-500 font-medium text-lg">Performance e autenticidade em cada detalhe da nossa coleção.</p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-6 py-3 rounded-full border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-black uppercase tracking-widest text-[10px]">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <div className="text-xs font-bold text-zinc-400">
            {products.length} {products.length === 1 ? "Produto" : "Produtos"}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-40 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px]">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-zinc-300 opacity-20" />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Ops! Loja Vazia</h2>
          <p className="text-zinc-500 font-medium">Estamos preparando novidades incríveis para você. Volte em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product: any) => (
            <Link key={product.id} href={`/t/${tenantSlug}/products/${product.slug || product.id}`} className="group">
              <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden mb-6 bg-white dark:bg-zinc-900 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <ShoppingBag className="w-12 h-12 opacity-10" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4">
                  {product.price < 200 && <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Sale</span>}
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full shadow-2xl">Detalhes</span>
                  </div>
                </div>
              </div>

              <div className="px-2">
                <h3 className="font-black uppercase tracking-tighter text-xl mb-1 group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-accent text-lg">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</p>
                  <div className="flex space-x-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-black text-zinc-400">5.0</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

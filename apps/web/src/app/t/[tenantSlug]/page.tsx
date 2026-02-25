import { fetchApi } from "../../../../lib/api";
import { GlassCard, GlassButton } from "@gridiron/ui";
import Link from "next/link";
import { ShoppingBag, Star, ShieldCheck, Truck } from "lucide-react";

export default async function TenantHome({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;

  let products: any[] = [];
  try {
    products = await fetchApi(`/tenants/${tenantSlug}/catalog/products`, {
      next: { revalidate: 60 },
    });
  } catch (e) {
    console.error("Failed to load products");
  }

  return (
    <div className="pb-24">
      {/* Hero Section - Full Width & Impactful */}
      <section className="relative min-h-[85vh] flex items-center pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover scale-105" alt="Hero Background" />
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-accent/20 border border-accent/20 px-3 py-1 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.2em]">New Season 2024/25</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85] mb-8">
              The <span className="text-accent">Elite</span>
              <br />
              Collection
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-xl font-medium leading-relaxed">
              Performance de elite, estilo lendário. Vista a armadura dos seus heróis com a coleção de jerseys mais completa e autêntica do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/t/${tenantSlug}/products`}>
                <GlassButton size="lg" className="px-10 rounded-full font-black uppercase tracking-widest text-sm bg-white text-black hover:bg-accent hover:text-white transition-all border-none">
                  Comprar Agora
                </GlassButton>
              </Link>
              <Link href={`/t/${tenantSlug}/products?category=jerseys`}>
                <GlassButton variant="secondary" size="lg" className="px-10 rounded-full font-black uppercase tracking-widest text-sm border-white/20 hover:border-white transition-all text-white">
                  Ver Jerseys
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-zinc-100 dark:bg-zinc-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: <ShieldCheck className="w-8 h-8 text-accent" />, title: "100% Original", desc: "Produtos oficiais e certificados" },
              { icon: <Truck className="w-8 h-8 text-accent" />, title: "Envio Rápido", desc: "Entrega expressa para todo Brasil" },
              { icon: <Star className="w-8 h-8 text-accent" />, title: "Premium VIP", desc: "Qualidade de jogador nos detalhes" },
              { icon: <ShoppingBag className="w-8 h-8 text-accent" />, title: "Compra Segura", desc: "Sua segurança é nossa prioridade" },
            ].map((benefit, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="mb-4 p-4 rounded-3xl bg-white dark:bg-black shadow-sm group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  {benefit.icon}
                </div>
                <h3 className="font-black uppercase tracking-tighter transition-colors group-hover:text-accent">{benefit.title}</h3>
                <p className="text-xs text-zinc-500 font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Produtos <span className="text-accent">Destaque</span>
            </h2>
            <p className="text-zinc-500 font-medium">Os itens mais desejados da temporada, selecionados para você.</p>
          </div>
          <Link href={`/t/${tenantSlug}/products`} className="flex items-center space-x-2 text-sm font-black uppercase tracking-[0.2em] group">
            <span className="group-hover:text-accent transition-colors">Explorar Tudo</span>
            <span className="w-8 h-[1px] bg-zinc-300 group-hover:bg-accent transition-all group-hover:w-12" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px]">
            <p className="text-zinc-500 font-medium">Nenhum produto em destaque no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product: any) => (
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
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.price < 200 && <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Oferta</span>}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full shadow-2xl">Ver Detalhes</span>
                    </div>
                  </div>
                </div>

                <div className="px-2">
                  <h3 className="font-black uppercase tracking-tighter text-lg mb-1 group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-accent">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

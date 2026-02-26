import { fetchApi } from "../../../../lib/api";
import { GlassCard, GlassButton } from "@gridiron/ui";
import Link from "next/link";
import Image from "next/image";
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
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background image using native img for reliability */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=2070&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
            alt="NFL Stadium Background"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />
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

      {/* Benefits Section - Premium Floating Glass Bar */}
      <section className="relative z-20 -mt-16 mb-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-[40px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, title: "100% Original", desc: "Oficial & Certificado" },
              { icon: <Truck className="w-6 h-6" />, title: "Envio Rápido", desc: "Todo o Brasil" },
              { icon: <Star className="w-6 h-6" />, title: "Premium VIP", desc: "Qualidade de Elite" },
              { icon: <ShoppingBag className="w-6 h-6" />, title: "Compra Segura", desc: "Dados Protegidos" },
            ].map((benefit, i) => (
              <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left group/item relative z-10 transition-transform hover:scale-105 duration-300">
                <div className="mb-4 p-3 rounded-2xl bg-accent/10 text-accent group-hover/item:bg-accent group-hover/item:text-white shadow-lg shadow-accent/5 transition-all duration-500">
                  {benefit.icon}
                </div>
                <h3 className="text-xs font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 group-hover/item:text-accent transition-colors">{benefit.title}</h3>
                <p className="hidden md:block text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-1 opacity-70">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-zinc-900 dark:text-white">
              Produtos <span className="text-accent">Destaque</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Os itens mais desejados da temporada, selecionados para você.</p>
          </div>
          <Link href={`/t/${tenantSlug}/products`} className="flex items-center space-x-2 text-sm font-black uppercase tracking-[0.2em] group">
            <span className="group-hover:text-accent transition-colors text-zinc-800 dark:text-zinc-200">Explorar Tudo</span>
            <span className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700 group-hover:bg-accent transition-all group-hover:w-12" />
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
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
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

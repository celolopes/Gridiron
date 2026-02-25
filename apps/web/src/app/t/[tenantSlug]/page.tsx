import { fetchApi } from "../../../../lib/api";
import { GlassCard, GlassButton } from "@gridiron/ui";
import Link from "next/link";

export default async function TenantHome({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;

  // Track Product View (Server-side tracking for initial render could be tricky for unique users,
  // but we'll track a general PAGE_VIEW or PRODUCT_VIEW here for MVP).
  // Ideally, this is done client-side with an effect.

  let products: any[] = [];
  try {
    products = await fetchApi(`/tenants/${tenantSlug}/catalog/products`, {
      next: { revalidate: 60 },
    });
  } catch (e) {
    console.error("Failed to load products");
  }

  return (
    <div className="container mx-auto px-4 space-y-12">
      {/* Hero Section */}
      <section className="relative h-[60vh] rounded-[40px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-black/80 to-black/40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop')] object-cover mix-blend-overlay opacity-50" />
        <GlassCard intensity="high" className="relative z-10 p-12 text-center max-w-2xl border-white/10">
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6">A Coleção Definitiva</h1>
          <p className="text-xl text-gray-200 mb-8">Encontre a authentic jersey do seu time do coração com a máxima qualidade e conforto.</p>
          <Link href={`/t/${tenantSlug}/products`}>
            <GlassButton size="lg" className="px-12 rounded-full font-bold">
              Explorar Catálogo
            </GlassButton>
          </Link>
        </GlassCard>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Destaques</h2>
          <Link href={`/t/${tenantSlug}/products`} className="text-blue-500 hover:underline font-medium">
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product: any) => {
            const isBestSeller = product.demandScores?.some((s: any) => s.score > 100);
            const isLowStock = product.variants?.some((v: any) => v.inventory?.available > 0 && v.inventory?.available < 5);

            return (
              <Link key={product.id} href={`/t/${tenantSlug}/products/${product.slug || product.id}`}>
                <GlassCard className="group cursor-pointer hover:shadow-2xl hover:-translate-y-1 p-4 border border-white/5 relative h-full">
                  {isBestSeller && <div className="absolute top-6 left-6 z-10 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">MAIS VENDIDO</div>}
                  {isLowStock && <div className="absolute top-6 right-6 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">ÚLTIMAS UNIDADES</div>}

                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-white/5 relative">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">Sem imagem</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg truncate mb-1">{product.name}</h3>
                  <p className="text-zinc-400 font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</p>
                  <GlassButton variant="secondary" className="w-full mt-4">
                    Comprar
                  </GlassButton>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

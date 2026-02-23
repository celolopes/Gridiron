import { fetchApi } from "../../../../../lib/api";
import { GlassCard, GlassButton } from "@gridiron/ui";

export default async function CatalogPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  let products: any[] = [];
  try {
    products = await fetchApi(`/tenants/${tenantSlug}/catalog/products`);
  } catch (e) {
    console.error("Failed to fetch catalog");
  }

  return (
    <div className="container mx-auto px-4">
      <div className="py-8 border-b border-glass-border mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Catálogo</h1>
        <p className="text-muted-foreground text-lg">Confira nossa coleção completa de Authentic Jerseys.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <a key={product.id} href={`/t/${tenantSlug}/products/${product.slug || product.id}`}>
            <GlassCard className="group cursor-pointer hover:shadow-2xl hover:-translate-y-1 p-4 border border-glass-border">
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-white/5 relative">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
                )}
              </div>
              <h3 className="font-semibold text-lg truncate mb-1">{product.name}</h3>
              <p className="text-muted-foreground font-medium mb-3">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</p>
              <GlassButton variant="secondary" className="w-full">
                Comprar
              </GlassButton>
            </GlassCard>
          </a>
        ))}
      </div>
    </div>
  );
}

import { fetchApi } from "../../../../../../lib/api";
import { GlassCard, GlassButton, Badge } from "@gridiron/ui";

export default async function ProductDetailPage({ params }: { params: Promise<{ tenantSlug: string; productSlug: string }> }) {
  const { tenantSlug, productSlug } = await params;

  let product: any = null;
  try {
    product = await fetchApi(`/tenants/${tenantSlug}/catalog/products/${productSlug}`);
  } catch (e) {
    console.error("Failed to load product", e);
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-20 text-center text-xl">Produto não encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <GlassCard intensity="low" className="aspect-square rounded-[32px] overflow-hidden bg-white/5 border border-glass-border">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
          )}
        </GlassCard>

        {/* Info */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <Badge variant="glass" className="mb-4">
              NFL Autêntica
            </Badge>
            <h1 className="text-4xl font-black tracking-tight mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-accent">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="space-y-4 pt-4 border-t border-glass-border">
            <h3 className="font-semibold text-lg">Tamanho</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants?.map((v: any) => (
                <button key={v.id} className="h-12 px-6 rounded-apple-sm border border-glass-border hover:border-accent hover:text-accent font-medium transition-colors">
                  {v.name.split(" - ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <a href={`/t/${tenantSlug}/checkout`}>
              <GlassButton size="lg" className="w-full text-lg shadow-xl shadow-accent/20">
                Comprar via Pix
              </GlassButton>
            </a>
            <p className="text-center text-sm text-muted-foreground mt-4">Transação manual segura na Fase 1.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

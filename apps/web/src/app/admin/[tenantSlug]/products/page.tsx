import { fetchApi } from "../../../../../lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function AdminProductsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let products: any[] = [];
  let usage: any = null;
  try {
    const [productsData, usageData] = await Promise.all([
      fetchApi<any[]>(`/tenants/${tenantSlug}/catalog/products`, { adminToken: token }),
      fetchApi<any>(`/tenants/${tenantSlug}/usage`, { adminToken: token }),
    ]);
    products = productsData || [];
    usage = usageData || null;
  } catch (e) {
    console.error("Failed to fetch products or usage", e);
  }

  const currentProducts = usage?.products?.current || 0;
  const maxProducts = usage?.products?.limit || 20;
  const isLimitReached = currentProducts >= maxProducts;
  const progressPercent = Math.min((currentProducts / maxProducts) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black mb-1">Produtos</h2>
          <p className="text-neutral-400">Gerencie seu catálogo de jerseys e acessórios.</p>
        </div>

        <div className="flex items-center gap-6">
          {usage && (
            <div className="flex flex-col gap-1.5 w-40">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-400">Uso do Plano</span>
                <span className={isLimitReached ? "text-red-400" : "text-white"}>
                  {currentProducts} / {maxProducts}
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isLimitReached ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}

          <Link href={`/admin/${tenantSlug}/products/new`} className={isLimitReached ? "pointer-events-none opacity-50" : ""}>
            <button
              disabled={isLimitReached}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-xl transition-colors shrink-0"
            >
              Novo Produto
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all group">
            <div className="relative h-48 bg-neutral-800">
              {product.images?.[0] ? (
                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">Sem imagem</div>
              )}
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                  {product.variants?.[0]?.inventory?.available || 0} em estoque
                </span>
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-bold text-white mb-1 truncate">{product.name}</h4>
              <p className="text-neutral-500 text-xs mb-4 line-clamp-2 leading-relaxed">{product.description || "Sem descrição disponível."}</p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-black text-blue-400">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</span>
                <Link href={`/admin/${tenantSlug}/products/${product.id}`}>
                  <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-20 text-center bg-neutral-900/50 border border-dashed border-neutral-800 rounded-3xl">
            <p className="text-neutral-500">Nenhum produto cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

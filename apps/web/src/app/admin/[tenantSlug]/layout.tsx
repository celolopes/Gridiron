import { fetchApi } from "../../../../lib/api";

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;

  // For Admin, we can have a static dark/professional theme rather than the tenant's dynamic store theme.
  // Still fetching tenant settings to show logo/name.
  let settings: any = null;
  try {
    settings = await fetchApi(`/tenants/${tenantSlug}/settings`);
  } catch (e) {
    console.error("Failed to load tenant settings", e);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 dark flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <h1 className="font-bold text-lg">{settings?.brandName || "Admin"}</h1>
          <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-bold bg-accent text-white rounded-full">Painel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href={`/admin/${tenantSlug}`} className="block px-4 py-2 text-sm rounded-md bg-neutral-800 font-medium text-white">
            Dashboard
          </a>
          <a href={`/admin/${tenantSlug}/orders`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            Pedidos
          </a>
          <a href={`/admin/${tenantSlug}/products`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            Produtos
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 flex items-center px-8 border-b border-neutral-800 bg-neutral-900/30 backdrop-blur-md sticky top-0 z-10 w-full justify-end">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-neutral-400">Admin User</span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold">A</div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

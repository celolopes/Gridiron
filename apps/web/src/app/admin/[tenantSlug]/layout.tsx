import { fetchApi } from "../../../../lib/api";
import Link from "next/link";
import { cookies } from "next/headers";
import { GridironLogo } from "../../../components/GridironLogo";
import { UpgradeBanner } from "./components/UpgradeBanner";
import { Store } from "lucide-react";

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

  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  // Extract user info from Supabase JWT payload
  let userProfile = { name: "Admin", email: "", avatar: "" };
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
      const payload = JSON.parse(payloadJson);
      userProfile.name = payload.user_metadata?.full_name || payload.email?.split("@")[0] || "Admin";
      userProfile.email = payload.email || "";
      userProfile.avatar = payload.user_metadata?.avatar_url || payload.user_metadata?.picture || "";
    } catch (e) {
      console.error("Failed to parse token payload", e);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 dark flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800 gap-3">
          <Link href={`/admin/${tenantSlug}`} className="hover:opacity-80 transition-opacity">
            <GridironLogo variant="dark" size="sm" />
          </Link>
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-blue-600 shadow-md shadow-blue-500/20 text-white rounded-full">Painel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href={`/admin/${tenantSlug}`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href={`/admin/${tenantSlug}/finance`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            Financeiro
          </Link>
          <Link href={`/admin/${tenantSlug}/orders`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            Pedidos
          </Link>
          <Link href={`/admin/${tenantSlug}/products`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            Produtos
          </Link>
          <Link href={`/admin/${tenantSlug}/suppliers`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            Fornecedores
          </Link>
          <Link href={`/admin/${tenantSlug}/settings`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            ⚙️ Configurações
          </Link>
          <Link href={`/admin/${tenantSlug}/billing`} className="block px-4 py-2 text-sm rounded-md hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors">
            💳 Cobrança
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 flex items-center px-8 border-b border-neutral-800 bg-neutral-900/30 backdrop-blur-md sticky top-0 z-10 w-full justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-neutral-300 bg-neutral-800/50 px-3 py-1.5 rounded-md border border-neutral-700/50 flex items-center gap-2">
              <Store size={14} className="text-blue-400" />
              Loja Selecionada: <span className="text-white font-bold truncate max-w-[150px]">{settings?.brandName || tenantSlug}</span>
            </span>
            <Link
              href="/auth/select-store"
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              Trocar / Criar Loja
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-white leading-tight">{userProfile.name}</span>
              <span className="text-[11px] text-neutral-400 font-medium">{userProfile.email}</span>
            </div>
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className="w-10 h-10 rounded-full border border-neutral-700 object-cover shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-600/30">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <UpgradeBanner tenantSlug={tenantSlug} />

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

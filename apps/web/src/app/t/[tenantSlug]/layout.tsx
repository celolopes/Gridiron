import { fetchApi } from "../../../../lib/api";
import Link from "next/link";

export default async function TenantLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;

  let tenantSettings: any = null;
  try {
    tenantSettings = await fetchApi(`/tenants/${tenantSlug}/settings`);
  } catch (e) {
    console.error(`Failed to load tenant ${tenantSlug}`);
  }

  const primaryColor = tenantSettings?.primaryColor || "#000000";
  const accentColor = tenantSettings?.accentColor || "#0a84ff";
  const themeMode = tenantSettings?.themeMode || "light";

  return (
    <div
      className={`min-h-screen ${themeMode === "dark" ? "dark bg-black text-white" : "bg-zinc-50 text-zinc-900"}`}
      style={
        {
          "--primary": primaryColor,
          "--accent": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <header className="fixed top-0 w-full z-50 border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/70 dark:bg-black/70">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={`/t/${tenantSlug}`} className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tighter uppercase italic text-primary">{tenantSettings?.brandName || "Gridiron"}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href={`/t/${tenantSlug}`} className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-all">
              Início
            </Link>
            <Link href={`/t/${tenantSlug}/products`} className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-all">
              Catálogo
            </Link>
            <Link href={`/t/${tenantSlug}/products?category=jerseys`} className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-all">
              Jerseys
            </Link>
          </nav>

          <div className="flex items-center space-x-6">
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="absolute top-0 right-0 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
            </button>
            <Link
              href="/admin/login"
              className="px-5 py-2 rounded-full border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 pt-20 pb-10 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-2">{tenantSettings?.brandName || "Gridiron Store"}</h3>
              <p className="text-sm text-zinc-500 max-w-xs">A melhor experiência em jerseys autênticas e acessórios premium para fãs de verdade.</p>
            </div>
            <div className="flex space-x-6 text-sm font-bold uppercase tracking-widest">
              <Link href="#" className="hover:text-accent">
                Sobre
              </Link>
              <Link href="#" className="hover:text-accent">
                Envio
              </Link>
              <Link href="#" className="hover:text-accent">
                Contato
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center text-xs text-zinc-400 font-medium">
            © {new Date().getFullYear()} {tenantSettings?.brandName || "Gridiron"}. Powered by Gridiron SaaS.
          </div>
        </div>
      </footer>
    </div>
  );
}

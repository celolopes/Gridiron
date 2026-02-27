import { fetchApi } from "../../../../lib/api";
import Link from "next/link";
import { CartProvider } from "./CartProvider";
import { CartPanel } from "./CartPanel";
import { CartButton } from "./CartButton";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

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
  const themeMode = (tenantSettings?.themeMode as "light" | "dark") || "dark";

  return (
    <CartProvider tenantSlug={tenantSlug}>
      <ThemeProvider defaultTheme={themeMode} tenantSlug={tenantSlug}>
        <div
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
              <Link href={`/t/${tenantSlug}`} className="flex items-center space-x-2 group">
                {tenantSettings?.logoUrl ? (
                  <img
                    src={tenantSettings.logoUrl}
                    alt={tenantSettings.brandName || "Logo"}
                    className="h-12 max-w-[200px] object-contain transition-transform group-hover:scale-105 dark:brightness-0 dark:invert"
                  />
                ) : (
                  <span className="text-2xl font-black tracking-tighter uppercase italic transition-all group-hover:skew-x-[-10deg] text-zinc-900 dark:text-zinc-100">
                    {tenantSettings?.brandName || "Gridiron"}
                  </span>
                )}
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link href={`/t/${tenantSlug}`} className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-accent dark:hover:text-accent transition-all">
                  Início
                </Link>
                <Link
                  href={`/t/${tenantSlug}/products`}
                  className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-accent dark:hover:text-accent transition-all"
                >
                  Catálogo
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <CartButton />
                <Link
                  href="/auth/login"
                  className="px-5 py-2 rounded-full border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  Admin
                </Link>
              </div>
            </div>
          </header>

          <main className="relative z-10">{children}</main>

          {/* Cart Slide Panel */}
          <CartPanel tenantSlug={tenantSlug} />

          <footer className="relative z-10 pt-20 pb-10 border-t border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                  {tenantSettings?.logoUrl ? (
                    <img src={tenantSettings.logoUrl} alt={tenantSettings.brandName || "Logo"} className="h-14 max-w-[220px] object-contain mb-3 mx-auto md:mx-0 dark:brightness-0 dark:invert" />
                  ) : (
                    <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-zinc-900 dark:text-white">{tenantSettings?.brandName || "Gridiron Store"}</h3>
                  )}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs font-medium leading-relaxed italic opacity-80">
                    A melhor experiência em jerseys autênticas e acessórios premium para fãs de verdade.
                  </p>
                </div>
                <div className="flex space-x-8 text-xs font-black uppercase tracking-[0.2em]">
                  <Link href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors">
                    Sobre
                  </Link>
                  <Link href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors">
                    Envio
                  </Link>
                  <Link href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors">
                    Contato
                  </Link>
                </div>
              </div>
              <div className="mt-16 text-center text-[10px] text-zinc-500 dark:text-zinc-600 font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} {tenantSettings?.brandName || "Gridiron"}. Powered by <span className="text-zinc-800 dark:text-white italic font-black">Gridiron SaaS</span>.
              </div>
            </div>
          </footer>
        </div>
      </ThemeProvider>
    </CartProvider>
  );
}

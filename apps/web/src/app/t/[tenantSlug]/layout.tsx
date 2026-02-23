import { fetchApi } from "../../../../lib/api";

export default async function TenantLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenantSlug: string }> }) {
  // Wait for dynamic params in Next.js 15+
  const { tenantSlug } = await params;

  // Fetch tenant settings to apply theming (V1 logic: we might just apply CSS variables in a style tag here)
  let tenantSettings: any = null;
  try {
    tenantSettings = await fetchApi(`/tenants/${tenantSlug}/settings`);
  } catch (e) {
    console.error(`Failed to load tenant ${tenantSlug}`);
  }

  const primaryColor = tenantSettings?.primaryColor || "#000000";
  const accentColor = tenantSettings?.accentColor || "#0a84ff";
  const opacity = tenantSettings?.glassOpacity || 0.15;
  const blur = tenantSettings?.blurIntensity || "16px";

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${tenantSettings?.themeMode === "dark" ? "dark" : ""}`}
      style={
        {
          "--primary": primaryColor,
          "--accent": accentColor,
          "--glass-opacity": opacity,
          "--blur-intensity": blur,
        } as React.CSSProperties
      }
    >
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-glass-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">{tenantSettings?.brandName || "Gridiron Store"}</h1>
          <nav>
            <a href={`/t/${tenantSlug}`} className="text-sm font-medium hover:text-accent transition-colors mr-4">
              Home
            </a>
            <a href={`/t/${tenantSlug}/products`} className="text-sm font-medium hover:text-accent transition-colors">
              Catálogo
            </a>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-12">{children}</main>
    </div>
  );
}

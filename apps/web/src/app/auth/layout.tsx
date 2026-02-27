import type { ReactNode } from "react";
import Link from "next/link";
import { GridironLogo } from "../../components/GridironLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050510] font-inter selection:bg-blue-500/30">
      {/* Background blobs */}
      <div className="absolute top-0 -left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/12 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 h-[800px] w-[800px] rounded-full bg-purple-600/12 blur-[140px] pointer-events-none" />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-3">
          <Link href="/" className="group">
            <GridironLogo variant="dark" size="sm" />
          </Link>
        </div>
      </nav>

      {/* Content — logo grande centralizada + form */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-10 pt-20">
        {/* Big centered logo above the form */}
        <div className="mb-10 flex flex-col items-center">
          <GridironLogo variant="dark" size="lg" showTagline />

          {/* Glow under logo */}
          <div className="mt-4 h-[1px] w-48 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
        </div>

        <div className="w-full max-w-md">{children}</div>

        <p className="mt-10 text-xs text-zinc-700">© 2026 Gridiron. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

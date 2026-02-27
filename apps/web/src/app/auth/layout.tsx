import type { ReactNode } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-inter selection:bg-blue-500/30">
      {/* Background blobs */}
      <div className="absolute top-0 -left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 h-[800px] w-[800px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 group-hover:bg-blue-500 transition-colors">
              <Layers className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Gridiron</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-md px-6 pt-28 pb-20">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, ArrowRight, Loader2, Plus } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { API_URL } from "../../../../lib/api";
import { GridironLogo } from "../../../components/GridironLogo";
import { GlassCard } from "@gridiron/ui";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export default function SelectStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Tenant[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push("/auth/login");
          return;
        }

        const email = session.user.email;
        if (!email) throw new Error("Usuário sem e-mail cadastrado.");

        const res = await fetch(`${API_URL}/tenants/by-email/${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) throw new Error("Falha ao buscar lojas. Tente novamente.");

        const data = await res.json();

        // Always standardise to array
        const storesArray = Array.isArray(data) ? data : [data];

        if (storesArray.length === 0) {
          router.push("/onboarding");
        } else {
          setStores(storesArray);
        }
      } catch (err: any) {
        setError(err.message || "Erro inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050510] font-inter selection:bg-blue-500/30">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-1/4 h-[800px] w-[800px] rounded-full bg-purple-600/10 blur-[120px]" />

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/">
            <GridironLogo variant="dark" size="sm" />
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-2xl px-6 pt-32 pb-40">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <h1 className="font-outfit text-4xl font-bold text-white mb-3">Selecione uma loja</h1>
            <p className="text-zinc-400 text-lg">Em qual painel de administração você quer entrar?</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
              <p className="text-zinc-400">Buscando suas lojas...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center text-red-400">
              <p className="mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 transition-colors rounded-lg text-white text-sm font-semibold">
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map((store, i) => (
                <motion.button
                  key={store.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => router.push(`/admin/${store.slug}`)}
                  className="w-full text-left group"
                >
                  <GlassCard className="p-6 border-white/5 hover:border-blue-500/50 hover:bg-white/[0.04] transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Store size={24} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{store.name}</h3>
                        <p className="text-sm font-mono text-zinc-500">{store.slug}.gridiron.app</p>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                      <ArrowRight size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                  </GlassCard>
                </motion.button>
              ))}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stores.length * 0.1 }} className="pt-6">
                <Link href="/onboarding" className="w-full">
                  <GlassCard className="p-6 border-white/5 border-dashed border-2 hover:border-blue-500/50 hover:bg-white/[0.04] transition-all flex items-center justify-center gap-3 cursor-pointer">
                    <Plus size={20} className="text-blue-400" />
                    <span className="text-zinc-300 font-medium">Criar uma nova loja virtual</span>
                  </GlassCard>
                </Link>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

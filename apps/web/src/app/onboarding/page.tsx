"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket, Store, Mail, AtSign, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassButton, GlassCard } from "@gridiron/ui";
import { API_URL } from "../../../lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tenants/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: storeName,
          slug,
          adminEmail: email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Falha ao criar loja");
      }

      // Success! Redirect to login with a hint
      router.push(`/admin/login?email=${encodeURIComponent(email)}&slug=${slug}&newStore=true`);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-inter selection:bg-blue-500/30">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-1/4 h-[800px] w-[800px] rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-xl px-6 pt-20 pb-40">
        <Link href="/" className="mb-12 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Voltar para o início
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Rocket className="text-white" size={32} />
          </div>

          <h1 className="font-outfit text-4xl font-bold text-white mb-4">Crie sua loja Gridiron</h1>
          <p className="text-zinc-400 text-lg mb-10">Você está a poucos passos de ter o seu próprio império de jerseys NFL.</p>

          <GlassCard className="p-8 border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Store size={14} className="text-blue-400" /> Nome da Loja
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jersey King Store"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <AtSign size={14} className="text-blue-400" /> Link da Loja (Slug)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="ex: jersey-king"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 pl-4 pr-32 text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                    value={slug}
                    onChange={handleSlugChange}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 uppercase tracking-wider">.gridiron.app</div>
                </div>
                <p className="text-[10px] text-zinc-500 px-1">Apenas letras, números e hifas.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Mail size={14} className="text-blue-400" /> Seu E-mail para Admin
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">{error}</div>}

              <GlassButton type="submit" disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700 h-14 text-lg font-bold group">
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Confirmar e criar loja
                    <ArrowLeft className="ml-2 rotate-180 transition-transform group-hover:translate-x-1" size={20} />
                  </>
                )}
              </GlassButton>
            </form>
          </GlassCard>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Ao clicar em confirmar, você concorda com nossos{" "}
            <Link href="#" className="underline">
              Termos de Uso
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}

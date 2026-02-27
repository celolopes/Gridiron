"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Store, Mail, AtSign, Loader2, ShoppingBag, BarChart3, Palette } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassButton, GlassCard } from "@gridiron/ui";
import { API_URL } from "../../../lib/api";
import { GridironLogo } from "../../components/GridironLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const LOADING_STEPS = [
    { message: "Iniciando criação da sua loja...", duration: 2000 },
    { message: "Configurando banco de dados seguro...", duration: 2500 },
    { message: "Criando sua conta de administrador...", duration: 2000 },
    { message: "Preparando sua área de vendas...", duration: 2500 },
    { message: "Finalizando os últimos ajustes...", duration: 3000 },
  ];

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCurrentStep(0);

    const progressInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch(`${API_URL}/tenants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: storeName, slug, adminEmail: email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Falha ao criar loja");
      }

      setCurrentStep(LOADING_STEPS.length - 1);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(`/admin/login?email=${encodeURIComponent(email)}&slug=${slug}&newStore=true`);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado");
      setLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

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

      <div className="relative z-10 mx-auto max-w-xl px-6 pt-28 pb-40">
        {loading ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center pt-20">
            <div className="relative mb-12">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
              <div className="relative h-24 w-24 flex items-center justify-center rounded-3xl bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <Loader2 className="animate-spin text-white" size={48} />
              </div>
            </div>

            <h2 className="font-outfit text-3xl font-bold text-white mb-6">Criando sua loja...</h2>

            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-full h-3 mb-8 overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                initial={{ width: "2%" }}
                animate={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            <div className="h-8 overflow-hidden">
              <motion.p key={currentStep} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="text-zinc-400 text-lg font-medium">
                {LOADING_STEPS[currentStep].message}
              </motion.p>
            </div>

            <p className="mt-20 text-xs text-zinc-600 uppercase tracking-[0.2em]">Não feche esta janela</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Logo + Title */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <GridironLogo variant="dark" size="lg" showTagline />
              </div>
              <div className="w-16 h-[2px] mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-8" />
              <h1 className="font-outfit text-4xl font-bold text-white mb-3">Crie sua loja virtual</h1>
              <p className="text-zinc-400 text-lg">Preencha os dados abaixo e tenha sua loja no ar em minutos.</p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: ShoppingBag, label: "Checkout integrado" },
                { icon: BarChart3, label: "Painel completo" },
                { icon: Palette, label: "Personalizável" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <Icon size={18} className="text-blue-400" />
                  <span className="text-[11px] text-zinc-500 font-medium text-center">{label}</span>
                </div>
              ))}
            </div>

            <GlassCard className="p-8 border-white/10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Store size={14} className="text-blue-400" /> Nome da Loja
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Moda Elegante, TechGear BR"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
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
                      placeholder="ex: minha-loja"
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 pr-32 text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                      value={slug}
                      onChange={handleSlugChange}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 uppercase tracking-wider">.GRIDIRON.APP</div>
                  </div>
                  <p className="text-[10px] text-zinc-600 px-1">Apenas letras minúsculas, números e hifens.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Mail size={14} className="text-blue-400" /> Seu E-mail para Admin
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>}

                <GlassButton type="submit" disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-500 h-14 text-base font-bold group shadow-lg shadow-blue-600/20">
                  Confirmar e criar loja
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
                </GlassButton>
              </form>
            </GlassCard>

            <p className="mt-8 text-center text-sm text-zinc-600">
              Ao clicar em confirmar, você concorda com nossos{" "}
              <Link href="#" className="underline hover:text-zinc-400 transition-colors">
                Termos de Uso
              </Link>
              .
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-white/5 py-6 px-6 text-center">
        <p className="text-xs text-zinc-700">© 2026 Gridiron. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

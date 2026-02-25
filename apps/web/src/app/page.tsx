"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Zap, ShieldCheck, Globe, BarChart3, ArrowRight, ChevronRight, Layers, Layout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GlassButton, GlassCard } from "@gridiron/ui";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black selection:bg-blue-500/30 font-inter">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-0 -right-1/4 h-[800px] w-[800px] rounded-full bg-purple-600/20 blur-[120px]" />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Layers className="text-white" size={24} />
            </div>
            <span className="text-xl font-outfit font-bold tracking-tight text-white">Gridiron</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Recursos
            </Link>
            <Link href="#demo" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Demonstração
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Preços
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="text-sm font-medium text-zinc-400 hover:text-white">
              Entrar
            </Link>
            <GlassButton size="sm" className="bg-white/10 text-white hover:bg-white/20">
              Começar agora
            </GlassButton>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-40">
        {/* Hero Section */}
        <motion.div className="grid gap-16 lg:grid-cols-2 lg:items-center" initial="hidden" animate="visible" variants={containerVariants}>
          <div className="flex flex-col gap-8">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-400 uppercase">
                <Zap size={14} /> SaaS para Jerseys NFL
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-outfit text-5xl font-extrabold leading-[1.15] text-white md:text-7xl">
              A sua loja de jerseys, <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">em alto nível.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-xl text-lg leading-relaxed text-zinc-400">
              Crie o seu e-commerce especializado em jerseys da NFL em minutos. UI premium com Glassmorphism, checkout otimizado e painel administrativo potente.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
              <GlassButton className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg">
                Criar minha loja <ArrowRight className="ml-2" size={20} />
              </GlassButton>
              <GlassButton variant="secondary" className="px-8 py-4 text-lg border-white/10 bg-white/5 text-white hover:bg-white/10">
                Ver demonstração
              </GlassButton>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 mt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-zinc-800" />
                ))}
              </div>
              <p className="text-sm text-zinc-500">
                <span className="font-bold text-white">+500 lojistas</span> já escalando com o Gridiron.
              </p>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="relative">
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-zinc-900/50 p-2 backdrop-blur-2xl">
              <Image src="/hero.png" alt="Gridiron Storefront Preview" width={800} height={600} className="rounded-[1.5rem] shadow-2xl" />
            </div>

            {/* Stats Card Overlay */}
            <div className="absolute -bottom-10 -left-10 hidden md:block">
              <GlassCard className="p-6 border-blue-500/20">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-500/20 p-2">
                    <BarChart3 className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Vendas Hoje</p>
                    <p className="text-2xl font-bold text-white">R$ 12.450</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <section id="features" className="mt-40">
          <div className="mb-20 text-center">
            <h2 className="font-outfit text-3xl font-bold text-white md:text-5xl">Tudo o que você precisa para dominar.</h2>
            <p className="mt-4 text-zinc-400">Funcionalidades pensadas para o mercado de jerseys.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <GlassCard className="group p-8 border-white/5 transition-all hover:border-blue-500/30">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Layout size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Storefront Apple-Style</h3>
              <p className="text-zinc-400">UI impecável focada em conversão, com efeitos de vidro e tipografia moderna.</p>
            </GlassCard>

            <GlassCard className="group p-8 border-white/5 transition-all hover:border-purple-500/30">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Zap size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Deploy Instantâneo</h3>
              <p className="text-zinc-400">Em poucos cliques seu domínio está no ar com SSL e CDN para performance máxima.</p>
            </GlassCard>

            <GlassCard className="group p-8 border-white/5 transition-all hover:border-green-500/30">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600/20 text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Gestão Segura</h3>
              <p className="text-zinc-400">Painel administrativo com proteção contra brute force e isolamento total de dados.</p>
            </GlassCard>
          </div>
        </section>

        {/* Call to Action Bar */}
        <motion.div className="mt-40 overflow-hidden rounded-[3rem] bg-zinc-900 border border-white/10 p-12 text-center relative" whileHover={{ scale: 1.01 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
          <h2 className="relative z-10 font-outfit text-4xl font-bold text-white">Pronto para entrar em campo?</h2>
          <p className="relative z-10 mt-4 text-lg text-zinc-400">Junte-se à elite dos lojistas de jerseys NFL.</p>
          <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <GlassButton className="bg-white text-black hover:bg-zinc-200 px-10 py-5 text-xl font-bold">Criar minha loja agora</GlassButton>
            <p className="text-sm text-zinc-500 flex items-center gap-2">
              <Globe size={16} /> Experimente 14 dias grátis
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 text-center">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 grayscale group hover:grayscale-0 transition-all">
            <Layers className="text-blue-500" size={20} />
            <span className="text-lg font-outfit font-bold text-zinc-400 group-hover:text-white">Gridiron</span>
          </div>
          <p className="text-sm text-zinc-500">© 2026 Gridiron SaaS. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-zinc-500 hover:text-white">
              Termos
            </Link>
            <Link href="#" className="text-xs text-zinc-500 hover:text-white">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

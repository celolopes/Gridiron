"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Zap, ShieldCheck, Globe, BarChart3, ArrowRight, Layout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GlassButton, GlassCard } from "@gridiron/ui";
import { GridironLogo } from "../../components/GridironLogo";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black selection:bg-blue-500/30 font-inter">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-1/4 h-[900px] w-[900px] rounded-full bg-blue-600/20 blur-[130px]" />
      <div className="absolute bottom-0 -right-1/4 h-[900px] w-[900px] rounded-full bg-purple-600/20 blur-[130px]" />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/">
            <GridironLogo variant="dark" size="sm" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Recursos
            </Link>
            <Link href="/t/demo" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Demonstração
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Preços
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/auth/signup">
              <GlassButton size="sm" className="bg-blue-600 text-white hover:bg-blue-500 px-5">
                Começar agora
              </GlassButton>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-40">
        {/* ── Hero Section ── */}
        <motion.div className="grid gap-16 lg:grid-cols-2 lg:items-center" initial="hidden" animate="visible" variants={containerVariants}>
          <div className="flex flex-col gap-8">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-400 uppercase">
                <Zap size={14} /> SaaS para Jerseys NFL
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-outfit text-5xl font-extrabold leading-[1.15] text-white md:text-7xl">
              A sua loja de jerseys, <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">em alto nível.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-xl text-lg leading-relaxed text-zinc-400">
              Crie o seu e-commerce especializado em jerseys da NFL em minutos. UI premium com Glassmorphism, checkout otimizado e painel administrativo potente.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <GlassButton className="bg-blue-600 text-white hover:bg-blue-500 px-8 py-4 text-lg">
                  Criar minha loja <ArrowRight className="ml-2" size={20} />
                </GlassButton>
              </Link>
              <Link href="/t/demo">
                <GlassButton variant="secondary" className="px-8 py-4 text-lg border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Ver demonstração
                </GlassButton>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 mt-2">
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

        {/* ── Trusted By / Logo Banner ── */}
        <motion.div className="mt-24 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-8">Powered by</p>
          <div className="flex items-center justify-center gap-3">
            <GridironLogo variant="dark" size="lg" showTagline />
          </div>
          <div className="mt-6 h-[1px] w-64 mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

        {/* ── Features Grid ── */}
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

        {/* ── Call to Action Bar ── */}
        <motion.div
          className="mt-40 overflow-hidden rounded-[3rem] bg-zinc-900 border border-white/10 p-16 text-center relative"
          whileHover={{ scale: 1.01 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />

          {/* Logo inside CTA */}
          <div className="relative z-10 flex justify-center mb-8">
            <GridironLogo variant="dark" size="md" showTagline />
          </div>

          <h2 className="relative z-10 font-outfit text-4xl font-bold text-white">Pronto para entrar em campo?</h2>
          <p className="relative z-10 mt-4 text-lg text-zinc-400">Junte-se à elite dos lojistas de jerseys NFL.</p>
          <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link href="/auth/signup">
              <GlassButton className="bg-white text-black hover:bg-zinc-200 px-10 py-5 text-xl font-bold">Criar minha loja agora</GlassButton>
            </Link>
            <p className="text-sm text-zinc-500 flex items-center gap-2">
              <Globe size={16} /> Experimente 14 dias grátis
            </p>
          </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Logo + tagline */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <GridironLogo variant="dark" size="md" showTagline />
              <p className="text-xs text-zinc-600 max-w-[260px] text-center md:text-left leading-relaxed">A plataforma SaaS líder em e-commerce de jerseys NFL no Brasil.</p>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-2">Links</p>
              <div className="flex gap-6">
                <Link href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
                  Termos
                </Link>
                <Link href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
                  Privacidade
                </Link>
                <Link href="/auth/login" className="text-xs text-zinc-500 hover:text-white transition-colors">
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-zinc-700">© 2026 Gridiron SaaS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

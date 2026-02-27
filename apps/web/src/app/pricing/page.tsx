"use client";

import { motion } from "framer-motion";
import { Check, X, Zap, Shield, Globe, BarChart3, Headphones, ShoppingCart, Package, Palette, Star, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GridironLogo } from "../../components/GridironLogo";

const FREE_FEATURES = [
  { label: "1 loja virtual", ok: true },
  { label: "Até 20 produtos", ok: true },
  { label: "Domínio gridiron.app", ok: true },
  { label: "Checkout via PIX (link manual)", ok: true },
  { label: "Painel administrativo básico", ok: true },
  { label: "Relatórios simples", ok: true },
  { label: "Suporte por e-mail (até 72h)", ok: true },
  { label: "Produtos ilimitados", ok: false },
  { label: "Domínio personalizado", ok: false },
  { label: "Checkout completo (cartão + boleto)", ok: false },
  { label: "Relatórios avançados com IA", ok: false },
  { label: "Suporte prioritário 24/7", ok: false },
];

const PRO_FEATURES = [
  { label: "Lojas ilimitadas", ok: true },
  { label: "Produtos ilimitados", ok: true },
  { label: "Domínio personalizado grátis", ok: true },
  { label: "Checkout completo: PIX, cartão e boleto", ok: true },
  { label: "Painel admin completo + relatórios", ok: true },
  { label: "Análise de demanda com Inteligência Artificial", ok: true },
  { label: "Temas e branding personalizado (logo + hero)", ok: true },
  { label: "Integrações: Correios, Melhor Envio", ok: true },
  { label: "Suporte prioritário 24/7 via chat", ok: true },
  { label: "SSL automático e CDN global", ok: true },
  { label: "Multi-usuário no painel admin", ok: true },
  { label: "Backup automático diário", ok: true },
];

const TESTIMONIALS = [
  {
    name: "Ana Paula Ferreira",
    role: "Fundadora · ModaOnline",
    avatar: "AP",
    color: "from-pink-500 to-rose-600",
    text: "Em menos de 1 hora já tinha minha loja no ar. O painel é intuitivo e as vendas começaram no mesmo dia!",
    stars: 5,
  },
  {
    name: "Rafael Souza",
    role: "E-commerce · TechGear BR",
    avatar: "RS",
    color: "from-blue-500 to-cyan-600",
    text: "Migrei de outra plataforma e a diferença é absurda. O checkout customizável aumentou minha conversão em 40%.",
    stars: 5,
  },
  {
    name: "Camila Torres",
    role: "Empreendedora · CasaDecor",
    avatar: "CT",
    color: "from-violet-500 to-purple-600",
    text: "O suporte responde rápido e os relatórios de IA me ajudam muito a entender o que vender. Recomendo demais!",
    stars: 5,
  },
  {
    name: "Diego Martins",
    role: "CEO · FitStore",
    avatar: "DM",
    color: "from-emerald-500 to-teal-600",
    text: "Plataforma robusta, estável e com um design que passa muita credibilidade para os meus clientes.",
    stars: 5,
  },
];

const FAQ = [
  {
    q: "O plano gratuito tem limite de tempo?",
    a: "Não! O plano Free é para sempre, sem expirar. Você pode usar com até 20 produtos e 1 loja sem nenhum custo.",
  },
  {
    q: "O período de 14 dias do Pro é gratuito?",
    a: "Sim, completamente. Você experimenta todos os recursos do plano Pro por 14 dias sem precisar de cartão de crédito.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Claro. Sem fidelidade, sem multa. Cancele a qualquer momento direto pelo painel e você volta automaticamente para o Free.",
  },
  {
    q: "O domínio personalizado está incluso no Pro?",
    a: "O Gridiron configura o seu domínio gratuitamente no plano Pro. Você só precisa adquirir o domínio em um registrador.",
  },
  {
    q: "Que meios de pagamento o checkout suporta?",
    a: "No Pro: PIX, cartão de crédito/débito e boleto bancário. No Free, apenas PIX via link manual.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const monthlyPrice = 97;
  const annualPrice = Math.round(monthlyPrice * 0.8);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-inter selection:bg-blue-500/30">
      <div className="absolute top-0 -left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/15 blur-[130px]" />
      <div className="absolute bottom-0 -right-1/4 h-[800px] w-[800px] rounded-full bg-purple-600/15 blur-[130px]" />

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/">
            <GridironLogo variant="dark" size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-40">
        {/* ── Header ── */}
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-400 uppercase mb-6">
            <Zap size={14} /> Simples e transparente
          </span>
          <h1 className="font-outfit text-5xl font-extrabold text-white mb-4">Escolha o seu plano</h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">Comece de graça e escale quando precisar. Sem letras miúdas, sem surpresas.</p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium transition-colors ${!annual ? "text-white" : "text-zinc-500"}`}>Mensal</span>
            <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-all ${annual ? "bg-blue-600" : "bg-zinc-700"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? "text-white" : "text-zinc-500"}`}>
              Anual <span className="text-emerald-400 font-bold">-20%</span>
            </span>
          </div>
        </motion.div>

        {/* ── Plans ── */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-28">
          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm flex flex-col"
          >
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Gratuito</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black text-white">R$ 0</span>
                <span className="text-zinc-500 mb-2">/mês</span>
              </div>
              <p className="text-sm text-zinc-500">Para sempre. Sem cartão.</p>
            </div>

            <Link href="/auth/signup" className="w-full py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-bold text-center transition-all mb-8 block">
              Começar grátis
            </Link>

            <ul className="space-y-3 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f.label} className={`flex items-start gap-3 text-sm ${f.ok ? "text-zinc-300" : "text-zinc-600"}`}>
                  {f.ok ? <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" /> : <X size={16} className="text-zinc-700 flex-shrink-0 mt-0.5" />}
                  {f.label}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* PRO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="relative rounded-3xl border border-blue-500/40 bg-gradient-to-b from-blue-950/40 to-black/40 p-8 backdrop-blur-sm flex flex-col overflow-hidden shadow-xl shadow-blue-500/10"
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full" />

            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                <Star size={11} fill="white" /> MAIS POPULAR
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Pro</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black text-white">R$ {annual ? annualPrice : monthlyPrice}</span>
                <span className="text-zinc-400 mb-2">/mês</span>
              </div>
              {annual && (
                <p className="text-xs text-emerald-400 font-semibold">
                  Equivale a R$ {(annualPrice * 12).toLocaleString("pt-BR")}/ano — economize R$ {((monthlyPrice - annualPrice) * 12).toLocaleString("pt-BR")}!
                </p>
              )}
              <p className="text-sm text-zinc-400 mt-1">14 dias grátis, sem cartão.</p>
            </div>

            <Link
              href="/auth/signup"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold text-center transition-all mb-8 block shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              Experimentar 14 dias grátis <ArrowRight size={16} />
            </Link>

            <ul className="space-y-3 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f.label} className="flex items-start gap-3 text-sm text-zinc-200">
                  <Check size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  {f.label}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Feature comparison badges ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-28 max-w-4xl mx-auto">
          {[
            { icon: ShoppingCart, label: "Checkout Integrado", sub: "PIX, cartão e boleto" },
            { icon: BarChart3, label: "IA de Demanda", sub: "Sugestões de reposição" },
            { icon: Palette, label: "Branding Total", sub: "Logo, hero e cores" },
            { icon: Headphones, label: "Suporte 24/7", sub: "Chat e e-mail prioritário" },
            { icon: Globe, label: "Domínio Próprio", sub: "SSL automático" },
            { icon: Package, label: "Sem limite de produtos", sub: "Catálogo ilimitado" },
            { icon: Shield, label: "Dados Isolados", sub: "Multi-tenant seguro" },
            { icon: Layers, label: "Multi-loja", sub: "Gerencie várias lojas" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col gap-2 p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-blue-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 flex items-center justify-center">
                <Icon size={18} className="text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-white mt-1">{label}</p>
              <p className="text-xs text-zinc-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonials ── */}
        <div className="mb-28">
          <h2 className="font-outfit text-3xl font-bold text-white text-center mb-12">O que nossos lojistas dizem</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-3xl mx-auto mb-28">
          <h2 className="font-outfit text-3xl font-bold text-white text-center mb-12">Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="text-sm font-semibold text-white">{item.q}</span>
                  <span className={`text-zinc-400 transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <motion.div
          className="text-center p-16 rounded-[3rem] border border-white/10 bg-zinc-900 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
          <div className="relative z-10">
            <p className="text-zinc-500 text-sm uppercase tracking-widest font-semibold mb-6">Comece hoje</p>
            <h2 className="font-outfit text-4xl font-bold text-white mb-4">Sua loja online em minutos</h2>
            <p className="text-zinc-400 mb-10 max-w-lg mx-auto">14 dias com todos os recursos Pro, sem cartão de crédito. Depois você decide.</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-xl shadow-blue-600/25"
            >
              Criar minha loja grátis <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <Link href="/">
          <GridironLogo variant="dark" size="sm" className="mx-auto justify-center mb-3" />
        </Link>
        <p className="text-xs text-zinc-700">© 2026 Gridiron. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

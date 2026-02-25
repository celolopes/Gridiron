"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Layers, Loader2 } from "lucide-react";
import { GlassCard, GlassButton, GlassInput } from "@gridiron/ui";
import { API_URL } from "../../../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Credenciais inválidas");
      }

      const { access_token } = await response.json();

      // Store token in cookie for server-side access
      document.cookie = `adminToken=${access_token}; path=/; samesite=strict; max-age=3600`;

      // Decode JWT roughly to get the tenantSlug (or simpler, just redirect to a generic success page
      // where we fetch the profile to find the tenant)
      // For MVP simplicity, we'll try to find the tenantSlug from the token payload if possible,
      // or redirect to a loading page.

      const payload = JSON.parse(atob(access_token.split(".")[1]));
      const tenantSlug = payload.tenantSlug;

      if (tenantSlug) {
        router.push(`/admin/${tenantSlug}`);
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
      <div className="absolute bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 mb-6 shadow-xl shadow-blue-500/20">
            <Layers className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-zinc-500">Faça login para gerenciar sua loja Gridiron.</p>
        </div>

        <GlassCard className="p-8 border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-zinc-400">Senha</label>
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </motion.div>
            )}

            <GlassButton type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-lg font-bold">
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </GlassButton>
          </form>
        </GlassCard>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Problemas ao acessar?{" "}
          <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
            Fale com o suporte
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

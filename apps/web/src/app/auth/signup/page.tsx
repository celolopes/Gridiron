"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle, Store, AtSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { API_URL } from "../../../../lib/api";
import { GoogleSignInButton } from "../_components/GoogleSignInButton";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "store">("account");

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Store fields
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setStoreSlug(value);
  };

  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setStep("store");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1) Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { store_name: storeName, store_slug: storeSlug },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });
      if (authError) throw authError;

      // 2) Create the tenant via our API
      await fetch(`${API_URL}/tenants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: storeName, slug: storeSlug, adminEmail: email }),
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Conta criada! 🎉</h1>
        <p className="text-zinc-400 mb-2">Enviamos um link de confirmação para:</p>
        <p className="text-white font-semibold mb-8">{email}</p>
        <p className="text-sm text-zinc-500 mb-8">Abra seu e-mail e clique no link para ativar sua conta. Após confirmar, você poderá fazer login.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all">
          Ir para o Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Criar sua conta</h1>
        <p className="text-zinc-400">Comece gratuitamente. Sem cartão de crédito.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Sua conta", "Sua loja"].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                (step === "account" && i === 0) || (step === "store" && i === 1) ? "bg-blue-600 text-white" : i === 0 && step === "store" ? "bg-emerald-500 text-white" : "bg-white/10 text-zinc-500"
              }`}
            >
              {i === 0 && step === "store" ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium ${step === (i === 0 ? "account" : "store") ? "text-white" : "text-zinc-500"}`}>{label}</span>
            {i === 0 && <div className="flex-1 h-[1px] bg-white/10 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {step === "account" ? (
          <form onSubmit={handleAccountNext} className="space-y-5">
            {/* Google sign up */}
            <GoogleSignInButton label="Cadastrar com Google" />

            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-xs text-zinc-600 font-medium uppercase tracking-widest">ou</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Confirmar Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
              Continuar →
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Store size={14} className="text-blue-400" />
                Nome da Loja
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Moda Elegante, TechGear BR"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <AtSign size={14} className="text-blue-400" />
                Link da Loja
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={storeSlug}
                  onChange={handleSlugChange}
                  placeholder="minha-loja"
                  className="w-full px-4 py-3 pr-32 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">.gridiron.app</span>
              </div>
              <p className="text-[10px] text-zinc-500">Apenas letras minúsculas, números e hifens.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("account");
                  setError("");
                }}
                className="px-6 py-3.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-sm font-bold transition-all"
              >
                ← Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Criar Conta
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Já tem uma conta?{" "}
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Entrar
        </Link>
      </p>
    </motion.div>
  );
}

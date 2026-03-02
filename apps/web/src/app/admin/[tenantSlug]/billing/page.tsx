"use client";

import { useState, useEffect, use } from "react";
import { fetchApi } from "../../../../../lib/api";
import { CreditCard, CheckCircle2, AlertTriangle, Zap, Loader2 } from "lucide-react";

// simple helper to read cookie
function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
  return undefined;
}

export default function BillingPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = use(params);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, [tenantSlug]);

  const loadStatus = async () => {
    try {
      const adminToken = getCookie("adminToken");
      const res = await fetchApi<any>(`/billing/status/${tenantSlug}`, { adminToken });
      setStatus(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load billing status");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const adminToken = getCookie("adminToken");
      const res = await fetchApi<any>("/billing/checkout", {
        method: "POST",
        adminToken,
        body: JSON.stringify({
          tenantSlug,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1T6XRaPaS87I74rZQSImorxX",
          successUrl: `${window.location.origin}/admin/${tenantSlug}/billing?success=true`,
          cancelUrl: `${window.location.origin}/admin/${tenantSlug}/billing?canceled=true`,
        }),
      });
      window.location.href = res.url;
    } catch (err: any) {
      setErrorMsg("Erro ao iniciar checkout: " + (err.message || ""));
      setActionLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const adminToken = getCookie("adminToken");
      const res = await fetchApi<any>("/billing/portal", {
        method: "POST",
        adminToken,
        body: JSON.stringify({
          tenantSlug,
          returnUrl: `${window.location.origin}/admin/${tenantSlug}/billing`,
        }),
      });
      window.location.href = res.url;
    } catch (err: any) {
      setErrorMsg("Erro ao abrir portal do cliente: " + (err.message || ""));
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isPro = status?.plan === "PRO" || status?.plan === "ENTERPRISE";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Cobrança e Assinatura</h1>
        <p className="text-neutral-400">Gerencie seu plano, faturas e métodos de pagamento.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">
                Plano Atual: <span className={isPro ? "text-blue-400" : "text-zinc-300"}>{status?.plan}</span>
              </h2>
              {status?.status === "ACTIVE" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={14} /> Ativo
                </span>
              )}
              {status?.status === "TRIALING" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                  <Zap size={14} /> Período de Teste
                </span>
              )}
              {status?.status === "PAST_DUE" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">
                  <AlertTriangle size={14} /> Pagamento Atrasado
                </span>
              )}
            </div>

            <p className="text-sm border-neutral-800 text-neutral-400 max-w-lg mb-6">
              {isPro
                ? "Você tem acesso a todos os recursos da plataforma, incluindo produtos ilimitados, temas premium e checkout transparente."
                : "Você está no plano gratuito. Existe um limite de até 20 produtos e 50 pedidos por mês."}
            </p>

            {status?.currentPeriodEnd && isPro && <p className="text-xs text-neutral-500">Próxima renovação: {new Date(status.currentPeriodEnd).toLocaleDateString("pt-BR")}</p>}
            {status?.trialEndsAt && status.status === "TRIALING" && (
              <p className="text-xs text-blue-400 mt-2">Seu teste grátis termina em: {new Date(status.trialEndsAt).toLocaleDateString("pt-BR")}</p>
            )}
          </div>

          <div className="flex-shrink-0">
            {isPro ? (
              <button
                onClick={handlePortal}
                disabled={actionLoading}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Gerenciar Assinatura
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={actionLoading}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                Fazer Upgrade para o Pro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison or Status */}
      {!isPro && (
        <div className="rounded-2xl border border-blue-900/40 bg-blue-900/10 p-6 md:p-8">
          <h3 className="text-lg font-bold text-white mb-4">Por que fazer o upgrade?</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Produtos Ilimitados</p>
                <p className="text-sm text-neutral-400">Venda quantos produtos quiser, sem se preocupar com limites.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Checkout Completo</p>
                <p className="text-sm text-neutral-400">Aceite cartão de crédito, boleto e PIX automático diretamente na sua loja.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Domínio Próprio</p>
                <p className="text-sm text-neutral-400">Use seu próprio domínio (ex: sualoja.com.br) passando mais credibilidade.</p>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

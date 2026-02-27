"use client";

import { useState, useEffect } from "react";
import { Zap, X, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "../../../../../lib/api";

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
  return undefined;
}

export function UpgradeBanner({ tenantSlug }: { tenantSlug: string }) {
  const [billingStatus, setBillingStatus] = useState<any>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check local storage if dismissed
    if (localStorage.getItem(`dismissed_upgrade_${tenantSlug}`)) {
      return;
    }
    setDismissed(false);

    const adminToken = getCookie("adminToken");
    fetchApi<any>(`/billing/status/${tenantSlug}`, { adminToken })
      .then((data: any) => {
        setBillingStatus(data);
      })
      .catch((err: any) => {
        console.error("Failed to fetch billing status for banner", err);
      });
  }, [tenantSlug]);

  if (dismissed || !billingStatus) {
    return null;
  }

  const { plan, status, trialEndsAt } = billingStatus;

  // Render logic for different states
  if (status === "TRIALING" && trialEndsAt) {
    const daysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    return (
      <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex gap-4 items-center">
          <div className="p-3 rounded-full flex-shrink-0 bg-blue-500/20 text-blue-400">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Período de teste em andamento</h3>
            <p className="text-sm text-neutral-400 max-w-lg">
              Você tem {daysLeft} dias restantes de uso gratuito do plano PRO. Assine até {new Date(trialEndsAt).toLocaleDateString("pt-BR")} para não perder os recursos Premium.
            </p>
          </div>
        </div>

        <Link href={`/admin/${tenantSlug}/billing`} className="w-full md:w-auto shrink-0">
          <button className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
            Ver Planos e Assinar
            <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    );
  }

  if (plan === "FREE") {
    return (
      <div className="mb-6 rounded-xl border border-neutral-700/50 bg-neutral-800/20 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <button
          onClick={() => {
            localStorage.setItem(`dismissed_upgrade_${tenantSlug}`, "true");
            setDismissed(true);
          }}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4 items-center">
          <div className="p-3 rounded-full flex-shrink-0 bg-neutral-700/50 text-neutral-300">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Faça upgrade e remova os limites do plano gratuito</h3>
            <p className="text-sm text-neutral-400 max-w-lg">No plano Pro você tem produtos e pedidos ilimitados, além do checkout transparente diretamente na loja.</p>
          </div>
        </div>

        <Link href={`/admin/${tenantSlug}/billing`} className="w-full md:w-auto shrink-0">
          <button className="w-full px-5 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
            Ver Planos
            <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    );
  }

  return null;
}

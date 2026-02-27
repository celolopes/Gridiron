"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { API_URL } from "../../../../lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session — Supabase automatically exchanges the code in the URL
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error("Não foi possível autenticar. Tente novamente.");
        }

        const user = session.user;

        // Check if this user already has a tenant
        const tenantsRes = await fetch(`${API_URL}/tenants/by-email/${encodeURIComponent(user.email || "")}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (tenantsRes.ok) {
          const tenantData = await tenantsRes.json();
          setStatus("success");
          // Redirect to their admin dashboard
          setTimeout(() => router.push(`/admin/${tenantData.slug}`), 1200);
        } else {
          // New user — send to onboarding to create their store
          setStatus("success");
          setTimeout(() => router.push("/onboarding"), 1200);
        }
      } catch (err: any) {
        setError(err.message || "Erro inesperado.");
        setStatus("error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Loader2 size={40} className="text-blue-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Autenticando...</h2>
            <p className="text-zinc-400 text-sm">Aguarde um momento.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Autenticado!</h2>
            <p className="text-zinc-400 text-sm">Redirecionando...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Erro ao autenticar</h2>
            <p className="text-zinc-400 text-sm mb-6">{error}</p>
            <button onClick={() => router.push("/auth/login")} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all">
              Tentar novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}

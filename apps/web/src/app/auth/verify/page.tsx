"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("success");
      } else if (event === "USER_UPDATED") {
        setStatus("success");
      }
    });

    // Also check if there's already a session (in case of page reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus("success");
      else {
        // Give Supabase time to process the URL hash token
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s2 } }) => {
            if (s2) setStatus("success");
            else {
              setStatus("error");
              setMessage("O link de verificação pode ter expirado. Tente se cadastrar novamente.");
            }
          });
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      {status === "loading" && (
        <>
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Loader2 size={40} className="text-blue-400 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Verificando...</h1>
          <p className="text-zinc-400">Aguarde enquanto confirmamos seu e-mail.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">E-mail confirmado! 🎉</h1>
          <p className="text-zinc-400 mb-8">Sua conta foi ativada com sucesso. Agora você pode fazer login e gerenciar sua loja.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            Ir para o Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Link inválido</h1>
          <p className="text-zinc-400 mb-8">{message}</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all">
            Criar nova conta
          </Link>
        </>
      )}
    </motion.div>
  );
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// createClient throws if supabaseUrl is empty (happens during Next.js static build
// when env vars are not injected). We guard here so the build doesn't fail.
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Implicit flow: tokens returned in URL hash, no PKCE code_verifier needed.
        // PKCE (default) loses its localStorage state during Google's redirect chain
        // on some hosting environments (Render), causing "OAuth state parameter missing".
        flowType: "implicit",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : (null as any);

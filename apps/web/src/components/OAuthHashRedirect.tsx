"use client";

import { useEffect } from "react";

/**
 * OAuthHashRedirect — Mounted in the root layout.
 * When Supabase OAuth redirects to the Site URL (/) with tokens in the hash
 * (because PKCE state was lost or the implicit flow is active),
 * this component detects it and uses window.location.replace to forward
 * to /auth/callback preserving the entire hash fragment.
 */
export function OAuthHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    // Only intercept if we're on the root path AND there are OAuth tokens/errors in the hash
    if (window.location.pathname === "/" && hash && (hash.includes("access_token") || hash.includes("error_description"))) {
      // Use native navigation to preserve the hash reliably
      window.location.replace(`/auth/callback${hash}`);
    }
  }, []);

  return null;
}

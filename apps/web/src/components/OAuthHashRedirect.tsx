"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * OAuthHashRedirect — Mounted in the root layout.
 * When Supabase OAuth redirects to the Site URL (/) instead of /auth/callback
 * (because the redirect URL wasn't allowed), the tokens land in window.location.hash.
 * This component detects that and silently forwards to /auth/callback preserving the hash.
 */
export function OAuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    // If the root URL has OAuth tokens in the hash, redirect to callback page
    if (hash && (hash.includes("access_token") || hash.includes("error_description"))) {
      // Redirect to /auth/callback preserving the hash so it can parse the tokens
      router.replace(`/auth/callback${hash}`);
    }
  }, [router]);

  return null;
}

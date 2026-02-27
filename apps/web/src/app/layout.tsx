import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { OAuthHashRedirect } from "../components/OAuthHashRedirect";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gridiron | Plataforma de Lojas Virtuais",
  description: "Lance sua loja virtual em minutos. UI premium, checkout otimizado, domínio próprio e painel administrativo completo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Safety net: forwards OAuth hash tokens to /auth/callback if they land on root */}
        <OAuthHashRedirect />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

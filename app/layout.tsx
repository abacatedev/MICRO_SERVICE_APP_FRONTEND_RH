import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Tipografia do guia visual: IBM Plex Sans no texto e IBM Plex Sans Condensed
 * só nos números grandes (cards de regra e alertas).
 */
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

const plexCond = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-cond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pré-Censo dos Servidores — Diagnóstico de cadastros",
  description:
    "Painel de diagnóstico do Pré-Censo: vínculos ativos, pendências de cadastro por regra e por secretaria, e lista nominal de servidores.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${plex.variable} ${plexCond.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}

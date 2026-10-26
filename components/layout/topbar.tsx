"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronRight, Moon, RefreshCw, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { navLabels } from "@/lib/nav";
import { useSessaoRH } from "@/lib/rh/api";
import { iniciais, primeiroNome } from "@/lib/rh/perfil";
import { useAcaoAtualizacao } from "@/components/layout/atualizacao";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Alternar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted && isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const current = navLabels[pathname] ?? "Visão geral";
  const acao = useAcaoAtualizacao();
  const sessao = useSessaoRH();

  const nome = sessao.data?.name || sessao.data?.email || "";
  const avatar = iniciais(nome || "?");
  const primeiro = primeiroNome(nome);

  return (
    <header className="bg-background/85 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 border-b backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger className="-ml-1.5" />

        <nav aria-label="Trilha de navegação" className="hidden items-center gap-1.5 text-[13px] sm:flex">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Pré-Censo dos Servidores
          </Link>
          <ChevronRight className="text-muted-foreground/60 size-3.5" />
          <span className="font-medium">{current}</span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {acao && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={acao.atualizar}
              disabled={acao.ocupado}
              aria-label={acao.rotulo}
              title={acao.dica ?? acao.rotulo}
            >
              <RefreshCw
                className={cn("size-4", acao.ocupado && "animate-spin")}
                aria-hidden="true"
              />
            </Button>
          )}

          <ThemeToggle />

          <div className="bg-border mx-0.5 hidden h-5 w-px sm:block" />

          <button
            type="button"
            className={cn(
              "hover:bg-muted flex items-center gap-2 rounded-full py-0.5 pr-2 pl-0.5 transition-colors",
            )}
            aria-label="Conta"
          >
            <span className="bg-primary/12 text-primary flex size-7 items-center justify-center rounded-full text-[11px] font-semibold">
              {avatar}
            </span>
            <span className="hidden text-[12.5px] font-medium sm:block">{primeiro || "—"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

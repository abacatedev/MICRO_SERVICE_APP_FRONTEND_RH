"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  CalendarRange,
  ChevronRight,
  Command,
  Download,
  Moon,
  Search,
  Sun,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { navLabels } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [period, setPeriod] = React.useState("30d");

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
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notificações">
                <Bell className="size-4" />
                <span className="bg-destructive absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-background" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex-col items-start gap-0.5 py-2">
                <span className="text-[13px] font-medium">Meta de outubro atingida</span>
                <span className="text-muted-foreground text-[11.5px]">
                  Receita passou de R$ 1,2 mi · há 2 h
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-0.5 py-2">
                <span className="text-[13px] font-medium">Sincronização concluída</span>
                <span className="text-muted-foreground text-[11.5px]">
                  14 fontes atualizadas · há 5 h
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-0.5 py-2">
                <span className="text-[13px] font-medium">Queda em Marketplace</span>
                <span className="text-muted-foreground text-[11.5px]">
                  Receita 8,4% abaixo da média · ontem
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
              AV
            </span>
            <span className="hidden text-[12.5px] font-medium sm:block">Ana</span>
          </button>
        </div>
      </div>
    </header>
  );
}

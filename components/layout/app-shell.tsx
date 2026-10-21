"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  LARGURA_ABERTA,
  LARGURA_FECHADA,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

function Shell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className="bg-background flex min-h-dvh flex-col"
      // A largura do menu vira variável para o `pl` responsivo abaixo.
      style={{ "--sidebar-largura": `${collapsed ? LARGURA_FECHADA : LARGURA_ABERTA}px` } as React.CSSProperties}
    >
      <Sidebar />
      <div className="flex flex-1 flex-col transition-[padding-left] duration-200 ease-out motion-reduce:transition-none lg:pl-[var(--sidebar-largura)]">
        <Topbar />
        {/* Sem max-width: a tela usa toda a largura disponível, alinhada à topbar. */}
        <main className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Shell>{children}</Shell>
    </SidebarProvider>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, LogOut, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { mainNav, secondaryNav, type NavItem } from "@/lib/nav";
import { useSessaoRH } from "@/lib/rh/api";
import { iniciais, rotuloPerfilRH, horaExpira } from "@/lib/rh/perfil";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LARGURA_ABERTA, LARGURA_FECHADA, useSidebar } from "@/components/ui/sidebar";
import { MarcaPreCenso } from "@/components/layout/marca";

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      // Colapsado, o rótulo some: o nome vira tooltip e nome acessível.
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center rounded-lg text-[13px] font-medium transition-colors",
        collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2",
        active
          ? "bg-sidebar-accent text-primary"
          : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {active && (
        <span className="bg-primary absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />
      )}
      <Icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
        strokeWidth={1.9}
      />

      {collapsed ? (
        item.badge ? (
          <span className="bg-primary absolute top-1.5 right-2 size-1.5 rounded-full" />
        ) : null
      ) : (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span className="bg-muted text-muted-foreground ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* marca */}
      <div
        className={cn(
          "flex h-15 shrink-0 items-center gap-2",
          collapsed ? "justify-center px-0" : "px-5",
        )}
      >
        <MarcaPreCenso
          className="size-13 shrink-0 text-[#123C6E] dark:text-[#8AB0E0]"
          titulo={collapsed ? "Pré-Censo dos Servidores" : undefined}
        />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold tracking-tight">
              Pré-Censo dos Servidores
            </p>
            <p className="text-muted-foreground truncate text-[11px]">Diagnóstico de cadastros</p>
          </div>
        )}
      </div>

      

      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-2">

        <div className={cn("space-y-0.5", collapsed && "pt-2")}>
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className={cn("space-y-0.5", collapsed ? "mt-2.5" : "mt-5")}>
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* plano — escondido no modo ícone */}


      <Separator />

      <UserSection collapsed={collapsed} />
    </div>
  );
}

function UserSection({ collapsed }: { collapsed: boolean }) {
  const sessao = useSessaoRH();

  // 401 → redireciona para login (o useRecurso já faz isso, mas garantimos)
  React.useEffect(() => {
    if (sessao.status === 401) {
      window.location.href = `/api/rh/login?retorno=${encodeURIComponent(window.location.pathname)}`;
    }
  }, [sessao.status]);

  const nome = sessao.data?.name || sessao.data?.email || "";
  const perfil = rotuloPerfilRH(sessao.data?.roles?.[0]);
  const avatar = iniciais(nome || "?");
  const email = sessao.data?.email ?? "";
  const expira = sessao.data?.sessao_expira_em;

  if (sessao.isLoading) {
    return (
      <div className={cn("flex shrink-0 items-center gap-2.5", collapsed ? "justify-center px-0 py-3" : "px-4 py-3")}>
        <Skeleton className="size-8 rounded-full" />
        {!collapsed && (
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2.5",
        collapsed ? "justify-center px-0 py-3" : "px-4 py-3",
      )}
    >
      <span
        className="bg-primary/12 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        title={collapsed ? `${nome} · ${perfil}` : undefined}
      >
        {avatar}
      </span>
      {!collapsed && (
        <>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12.5px] font-medium">{nome || "—"}</p>
            <p className="text-muted-foreground truncate text-[10.5px]">{perfil}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Menu da conta">
                <ChevronsUpDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-[12.5px] font-medium">{nome || "—"}</p>
                <p className="text-muted-foreground text-[11px]">{email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground text-[11px]" disabled>
                Sessão até {horaExpira(expira)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`/api/rh/logout?retorno=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`} className="flex items-center gap-2 text-[12.5px]">
                  <LogOut className="size-3.5" />
                  Sair
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}

export function Sidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const fechar = () => setMobileOpen(false);

  return (
    <>
      <aside
        id="app-sidebar"
        data-state={collapsed ? "collapsed" : "expanded"}
        className="bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block"
        style={{ width: collapsed ? LARGURA_FECHADA : LARGURA_ABERTA }}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* drawer mobile — sempre aberto por inteiro, nunca no modo ícone */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={fechar}
          className={cn(
            "absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "bg-sidebar border-sidebar-border absolute inset-y-0 left-0 w-[268px] border-r shadow-2xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fechar}
            className="absolute top-4 right-3 z-10"
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </Button>
          <SidebarContent collapsed={false} onNavigate={fechar} />
        </aside>
      </div>
    </>
  );
}

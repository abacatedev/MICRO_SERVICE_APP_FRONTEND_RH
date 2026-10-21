"use client";

/**
 * Estado de colapso do menu lateral.
 *
 * Segue o desenho do bloco `sidebar` do shadcn (Provider + useSidebar + Trigger),
 * mas sem as dependências que ele traz (Tooltip, Sheet, Dialog): o drawer mobile
 * deste projeto já existe e os rótulos usam `title` nativo.
 *
 * Colapsado, o menu vira uma faixa de ícones de 64px; a preferência fica no
 * localStorage e é aplicada antes da primeira pintura para não piscar aberto.
 */

import * as React from "react";
import { PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Larguras em px — o `AppShell` usa as mesmas para deslocar o conteúdo. */
export const LARGURA_ABERTA = 248;
export const LARGURA_FECHADA = 64;

const CHAVE = "nexo-bi:sidebar-fechado";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (aberto: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar precisa estar dentro de <SidebarProvider>.");
  return ctx;
}

/** `useLayoutEffect` no cliente, `useEffect` no servidor (evita o aviso de SSR). */
const useLayoutSync = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const consulta = window.matchMedia("(max-width: 1023px)");
    const aplicar = () => setIsMobile(consulta.matches);
    aplicar();
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, []);

  return isMobile;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // Aplica a preferência salva antes da pintura: sem isso, quem deixou o menu
  // fechado veria a barra abrir e encolher a cada navegação.
  useLayoutSync(() => {
    try {
      if (window.localStorage.getItem(CHAVE) === "1") setCollapsed(true);
    } catch {
      /* modo privado / storage bloqueado: segue com o padrão */
    }
  }, []);

  // Persiste depois, fora do updater de estado.
  React.useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, collapsed ? "1" : "0");
    } catch {
      /* sem storage, sem problema */
    }
  }, [collapsed]);

  const toggle = React.useCallback(() => setCollapsed((atual) => !atual), []);

  // ⌘B / Ctrl+B, como no shadcn.
  React.useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key.toLowerCase() !== "b") return;
      if (!(evento.metaKey || evento.ctrlKey) || evento.altKey) return;
      evento.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [toggle]);

  const valor = React.useMemo<SidebarContextValue>(
    () => ({ collapsed, toggle, mobileOpen, setMobileOpen, isMobile }),
    [collapsed, toggle, mobileOpen, isMobile],
  );

  return <SidebarContext.Provider value={valor}>{children}</SidebarContext.Provider>;
}

/**
 * Botão do topo. No desktop recolhe/expande; no mobile abre o drawer.
 * O ícone indica a direção do movimento, não o estado atual.
 */
export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { collapsed, toggle, isMobile, mobileOpen, setMobileOpen } = useSidebar();

  const Icone = isMobile ? PanelLeft : collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isMobile ? "Abrir menu" : collapsed ? "Expandir menu" : "Recolher menu"}
      aria-expanded={isMobile ? mobileOpen : !collapsed}
      aria-controls="app-sidebar"
      title={
        isMobile
          ? "Abrir menu"
          : collapsed
            ? "Expandir menu (Ctrl/⌘+B)"
            : "Recolher menu (Ctrl/⌘+B)"
      }
      onClick={() => (isMobile ? setMobileOpen(!mobileOpen) : toggle())}
      className={cn("text-muted-foreground shrink-0", className)}
      {...props}
    >
      <Icone className="size-4.5" strokeWidth={1.9} />
    </Button>
  );
}

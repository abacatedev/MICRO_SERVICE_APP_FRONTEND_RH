"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { BASE_RH as BASE } from "@/lib/http/recurso";
import type { ItemRelatorio } from "@/lib/relatorios/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/* Hook para carregar ficha                                            */
/* ------------------------------------------------------------------ */

interface EstadoFicha {
  data: unknown | null;
  isLoading: boolean;
  erro: string | null;
  status: number | null;
}

function useFicha(url: string | null) {
  const [estado, setEstado] = React.useState<EstadoFicha>({
    data: null,
    isLoading: false,
    erro: null,
    status: null,
  });

  React.useEffect(() => {
    if (!url) return;
    let vivo = true;
    setEstado({ data: null, isLoading: true, erro: null, status: null });

    void (async () => {
      try {
        const res = await fetch(url, {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!vivo) return;
        if (res.status === 404) {
          setEstado({ data: null, isLoading: false, erro: null, status: 404 });
          return;
        }
        if (!res.ok) {
          setEstado({
            data: null,
            isLoading: false,
            erro: `Erro ${res.status}`,
            status: res.status,
          });
          return;
        }
        const json = await res.json();
        if (!vivo) return;
        setEstado({ data: json, isLoading: false, erro: null, status: res.status });
      } catch {
        if (!vivo) return;
        setEstado({ data: null, isLoading: false, erro: "Falha ao carregar", status: null });
      }
    })();

    return () => {
      vivo = false;
    };
  }, [url]);

  return estado;
}

/* ------------------------------------------------------------------ */
/* Ficha lateral                                                       */
/* ------------------------------------------------------------------ */

export interface FichaAberta {
  tipo: "pendencias" | "afastamentos";
  registro: string;
  nome?: string;
}

interface FichaLateralProps {
  aberta: FichaAberta | null;
  onFechar: () => void;
}

export function FichaLateral({ aberta, onFechar }: FichaLateralProps) {
  const url = aberta ? `${BASE}/servidores/${aberta.registro}/${aberta.tipo}` : null;
  const { data, isLoading, erro, status } = useFicha(url);

  const titulo = aberta?.tipo === "pendencias" ? "Pendências do cadastro" : "Histórico de afastamentos";

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-[420px] max-w-full flex-col border-l bg-background shadow-xl transition-transform duration-200",
        aberta ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold">{titulo}</h3>
          {aberta?.nome && (
            <p className="text-muted-foreground truncate text-[12px]">{aberta.nome}</p>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onFechar}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="space-y-3">
            <div className="bg-muted h-4 animate-pulse rounded" />
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
          </div>
        )}
        {!isLoading && status === 404 && aberta?.tipo === "pendencias" && (
          <p className="text-muted-foreground text-[13px]">
            Vínculo fora do diagnóstico (não está ativo)
          </p>
        )}
        {!isLoading && erro && (
          <p className="text-destructive text-[13px]">{erro}</p>
        )}
        {!isLoading && data && (
          <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { BarChart3, List, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RelatorioCatalogo } from "@/lib/relatorios/types";
import { Input } from "@/components/ui/input";

interface ListaRelatoriosProps {
  relatorios: RelatorioCatalogo[];
  selecionado: string | null;
  onSelecionar: (id: string) => void;
}

export function ListaRelatorios({ relatorios, selecionado, onSelecionar }: ListaRelatoriosProps) {
  const [busca, setBusca] = React.useState("");

  const grupos = React.useMemo(() => {
    const map = new Map<string, RelatorioCatalogo[]>();
    const filtrados = busca
      ? relatorios.filter(
          (r) =>
            r.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            r.descricao.toLowerCase().includes(busca.toLowerCase()),
        )
      : relatorios;
    filtrados.forEach((r) => {
      const lista = map.get(r.grupo) || [];
      lista.push(r);
      map.set(r.grupo, lista);
    });
    return Array.from(map.entries());
  }, [relatorios, busca]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          placeholder="Filtrar relatórios"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="h-8 pl-8 text-[12.5px]"
        />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {grupos.map(([grupo, itens]) => (
          <div key={grupo}>
            <h4 className="text-muted-foreground mb-1.5 text-[11px] font-semibold uppercase tracking-wide">
              {grupo}
            </h4>
            <div className="space-y-1">
              {itens.map((r) => {
                const ativo = r.id === selecionado;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelecionar(r.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                      ativo
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    {r.natureza === "agregado" ? (
                      <BarChart3 className="mt-0.5 size-3.5 shrink-0 opacity-70" />
                    ) : (
                      <List className="mt-0.5 size-3.5 shrink-0 opacity-70" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium leading-tight">
                        {r.titulo}
                      </p>
                      <p className="text-muted-foreground truncate text-[11px]">
                        {r.descricao}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {grupos.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-[12px]">
            Nenhum relatório encontrado
          </p>
        )}
      </div>
    </div>
  );
}

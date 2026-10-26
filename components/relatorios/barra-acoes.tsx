"use client";

import * as React from "react";
import { ChevronDown, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ColunaCatalogo } from "@/lib/relatorios/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BarraAcoesProps {
  colunas: ColunaCatalogo[];
  visiveis: string[];
  onToggleColuna: (id: string) => void;
  onMoverColuna: (id: string, dir: -1 | 1) => void;
  podeAgrupar: boolean;
  agrupado: boolean;
  onToggleAgrupar: () => void;
  total: number;
  exportando: boolean;
  onExportar: (formato: "csv" | "xlsx" | "pdf") => void;
}

export function BarraAcoes({
  colunas,
  visiveis,
  onToggleColuna,
  onMoverColuna,
  podeAgrupar,
  agrupado,
  onToggleAgrupar,
  total,
  exportando,
  onExportar,
}: BarraAcoesProps) {
  const pdfDesabilitado = total > 10000;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Colunas */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-[12px]">
            Colunas
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {colunas.map((c, idx) => {
            const ativo = visiveis.includes(c.id);
            const pos = visiveis.indexOf(c.id);
            return (
              <div
                key={c.id}
                className="flex items-center gap-1.5 px-2 py-1.5 text-[12.5px]"
              >
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={() => onToggleColuna(c.id)}
                  className="size-4 rounded accent-primary"
                />
                <span className="flex-1">{c.rotulo}</span>
                {ativo && (
                  <div className="flex items-center gap-0.5">
                    <button
                      disabled={pos <= 0}
                      onClick={() => onMoverColuna(c.id, -1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      disabled={pos >= visiveis.length - 1}
                      onClick={() => onMoverColuna(c.id, 1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Agrupar */}
      {podeAgrupar && (
        <label className="flex cursor-pointer items-center gap-1.5 text-[12.5px]">
          <input
            type="checkbox"
            checked={agrupado}
            onChange={onToggleAgrupar}
            className="size-4 rounded accent-primary"
          />
          Agrupar por pessoa
        </label>
      )}

      {/* Exportar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-[12px]"
            disabled={exportando}
          >
            <Download className="size-3.5" />
            {exportando ? "Gerando…" : "Exportar"}
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onExportar("csv")} className="text-[12.5px]">
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExportar("xlsx")} className="text-[12.5px]">
            Excel
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => !pdfDesabilitado && onExportar("pdf")}
            className={cn("text-[12.5px]", pdfDesabilitado && "opacity-50 cursor-not-allowed")}
            title={
              pdfDesabilitado
                ? "Até 10.000 linhas; filtre mais ou use Excel"
                : undefined
            }
          >
            PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

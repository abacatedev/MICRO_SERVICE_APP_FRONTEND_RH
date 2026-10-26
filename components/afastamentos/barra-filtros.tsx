"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/afastamentos/formato";
import type { FiltrosAfastamentos } from "@/lib/afastamentos/tipos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemFiltro {
  codigo: string;
  nome: string;
}

export function BarraFiltros({
  secretarias,
  tipos,
  anos,
  filtros,
  totalPrefeitura,
  temFiltro,
  onFiltros,
  onLimpar,
}: {
  secretarias: { codigo: string; nome: string; vinculos: number }[];
  tipos: ItemFiltro[];
  anos: number[];
  filtros: FiltrosAfastamentos;
  totalPrefeitura: number;
  temFiltro: boolean;
  onFiltros: (patch: Partial<FiltrosAfastamentos>) => void;
  onLimpar: () => void;
}) {
  return (
    <div className="border-border bg-card flex flex-wrap items-start gap-x-6 gap-y-3 rounded-[10px] border px-3.5 py-3">
      {/* Secretaria */}
      <div className="min-w-[200px] flex-1 sm:max-w-[320px]">
        <label htmlFor="af-sec" className="text-muted-foreground text-[12px] font-semibold">
          Secretaria
        </label>
        <Select value={filtros.sec} onValueChange={(v) => onFiltros({ sec: v })}>
          <SelectTrigger id="af-sec" className="mt-1.5 h-11 w-full rounded-[6px] text-[14px] font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toda a Prefeitura ({fmtNum(totalPrefeitura)})</SelectItem>
            {secretarias.map((s) => (
              <SelectItem key={s.codigo} value={s.codigo}>
                {s.nome} ({fmtNum(s.vinculos)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ano */}
      <div className="min-w-[120px]">
        <label htmlFor="af-ano" className="text-muted-foreground text-[12px] font-semibold">
          Ano
        </label>
        <Select value={filtros.ano} onValueChange={(v) => onFiltros({ ano: v })}>
          <SelectTrigger id="af-ano" className="mt-1.5 h-11 w-full rounded-[6px] text-[14px] font-semibold">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {anos.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de afastamento */}
      <div className="min-w-[200px] flex-1 sm:max-w-[320px]">
        <label htmlFor="af-tipo" className="text-muted-foreground text-[12px] font-semibold">
          Tipo de afastamento
        </label>
        <Select value={filtros.tipo} onValueChange={(v) => onFiltros({ tipo: v })}>
          <SelectTrigger id="af-tipo" className="mt-1.5 h-11 w-full rounded-[6px] text-[14px] font-semibold">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {tipos.map((t) => (
              <SelectItem key={t.codigo} value={t.codigo}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Limpar filtros */}
      {temFiltro && (
        <div className="flex items-end">
          <button
            type="button"
            onClick={onLimpar}
            className="text-primary focus-visible:outline-ring inline-flex items-center gap-1 text-[12px] font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="size-3" />
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}

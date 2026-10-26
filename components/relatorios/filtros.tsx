"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FiltroCatalogo, OpcoesResposta } from "@/lib/relatorios/types";
import { useDominio } from "@/lib/relatorios/api";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Chip de filtro ativo                                                */
/* ------------------------------------------------------------------ */

export interface FiltroAtivo {
  id: string;
  rotulo: string;
  valor: string | string[] | number | boolean | undefined;
}

function chipTexto(val: unknown): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "boolean") return val ? "Sim" : "Não";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

function rotuloCurto(rotulo: string): string {
  return rotulo.replace(/^SECRETARIA MUNICIPAL DE\s+/i, "").trim();
}

export function ChipsFiltros({
  ativos,
  onRemover,
}: {
  ativos: FiltroAtivo[];
  onRemover: (id: string) => void;
}) {
  if (ativos.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ativos.map((f) => (
        <span
          key={f.id}
          className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
        >
          <span className="text-muted-foreground">{f.rotulo}:</span>
          <span className="max-w-[200px] truncate">{chipTexto(f.valor)}</span>
          <button
            onClick={() => onRemover(f.id)}
            className="hover:text-foreground text-muted-foreground ml-0.5"
            aria-label={`Remover ${f.rotulo}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Controle individual de filtro                                       */
/* ------------------------------------------------------------------ */

interface ControleFiltroProps {
  filtro: FiltroCatalogo;
  valor: unknown;
  opcoes?: { valor: string; rotulo: string; total?: number }[];
  onChange: (id: string, val: unknown) => void;
}

export function ControleFiltro({ filtro, valor, opcoes, onChange }: ControleFiltroProps) {
  const id = filtro.id;

  /* ------ select / multipla com opções fixas ou das linhas ------- */
  if (
    (filtro.tipo === "selecao" || filtro.tipo === "multipla") &&
    (filtro.opcoes || opcoes)
  ) {
    const lista = opcoes ?? filtro.opcoes ?? [];
    const ehMultiplo = filtro.tipo === "multipla";
    const selecionados = ehMultiplo
      ? Array.isArray(valor)
        ? (valor as string[])
        : []
      : valor
        ? [String(valor)]
        : [];

    return (
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-[11px] font-medium">
          {filtro.somente ? `Somente ${filtro.rotulo.toLowerCase()}` : filtro.rotulo}
        </label>
        <select
          multiple={ehMultiplo}
          value={ehMultiplo ? selecionados : (valor as string) || ""}
          onChange={(e) => {
            if (ehMultiplo) {
              const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
              onChange(id, opts.length ? opts : undefined);
            } else {
              onChange(id, e.target.value || undefined);
            }
          }}
          className={cn(
            "border-border bg-background rounded-md border px-2 py-1 text-[12px] focus:ring-1 focus:ring-primary focus:outline-none",
            ehMultiplo && "min-h-[80px]",
          )}
        >
          {!ehMultiplo && (
            <option value="">{filtro.obrigatorio ? `Escolha ${filtro.rotulo.toLowerCase()}` : "Todos"}</option>
          )}
          {lista.map((o) => (
            <option key={o.valor} value={o.valor}>
              {rotuloCurto(o.rotulo)}
              {typeof o.total === "number" ? ` (${o.total})` : ""}
            </option>
          ))}
        </select>
        {filtro.ajuda && (
          <span className="text-muted-foreground text-[10.5px]">{filtro.ajuda}</span>
        )}
      </div>
    );
  }

  /* ------ domínio (carregado do backend) ----------------------- */
  if (filtro.tipo === "selecao" && filtro.dominio) {
    return (
      <ControleDominio
        id={id}
        rotulo={filtro.rotulo}
        dominio={filtro.dominio}
        valor={valor as string | undefined}
        obrigatorio={filtro.obrigatorio}
        onChange={onChange}
      />
    );
  }

  /* ------ número ------------------------------------------------ */
  if (filtro.tipo === "numero") {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-[11px] font-medium">{filtro.rotulo}</label>
        <input
          type="number"
          min={filtro.minimo}
          max={filtro.maximo}
          value={(valor as number) ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? undefined : Number(e.target.value);
            onChange(id, v);
          }}
          className="border-border bg-background h-8 rounded-md border px-2 text-[12px] focus:ring-1 focus:ring-primary focus:outline-none"
        />
        {filtro.ajuda && (
          <span className="text-muted-foreground text-[10.5px]">{filtro.ajuda}</span>
        )}
      </div>
    );
  }

  /* ------ data -------------------------------------------------- */
  if (filtro.tipo === "data") {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-[11px] font-medium">{filtro.rotulo}</label>
        <input
          type="date"
          value={(valor as string) ?? ""}
          onChange={(e) => onChange(id, e.target.value || undefined)}
          className="border-border bg-background h-8 rounded-md border px-2 text-[12px] focus:ring-1 focus:ring-primary focus:outline-none"
        />
        {filtro.ajuda && (
          <span className="text-muted-foreground text-[10.5px]">{filtro.ajuda}</span>
        )}
      </div>
    );
  }

  /* ------ booleano ---------------------------------------------- */
  if (filtro.tipo === "booleano") {
    const checked = valor === true;
    return (
      <div className="flex items-center gap-2">
        <input
          id={`filtro-${id}`}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(id, e.target.checked)}
          className="size-4 rounded border accent-primary"
        />
        <label htmlFor={`filtro-${id}`} className="text-[12.5px]">
          {filtro.somente ? `Somente ${filtro.rotulo.toLowerCase()}` : filtro.rotulo}
        </label>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Domínio (carrega opções do backend)                                 */
/* ------------------------------------------------------------------ */

function ControleDominio({
  id,
  rotulo,
  dominio,
  valor,
  obrigatorio,
  onChange,
}: {
  id: string;
  rotulo: string;
  dominio: string;
  valor: string | undefined;
  obrigatorio: boolean;
  onChange: (id: string, val: unknown) => void;
}) {
  const { data, isLoading } = useDominio(dominio);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-foreground text-[11px] font-medium">{rotulo}</label>
      {isLoading ? (
        <div className="bg-muted h-8 animate-pulse rounded-md" />
      ) : (
        <select
          value={valor || ""}
          onChange={(e) => onChange(id, e.target.value || undefined)}
          className="border-border bg-background h-8 rounded-md border px-2 text-[12px] focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="">{obrigatorio ? `Escolha ${rotulo.toLowerCase()}` : "Todos"}</option>
          {data?.map((d) => (
            <option key={d.codigo} value={d.codigo}>
              {rotuloCurto(d.nome)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barra de filtros completa                                           */
/* ------------------------------------------------------------------ */

interface BarraFiltrosProps {
  filtros: FiltroCatalogo[];
  valores: Record<string, unknown>;
  opcoes?: OpcoesResposta;
  onChange: (id: string, val: unknown) => void;
  onLimpar: () => void;
}

export function BarraFiltros({ filtros, valores, opcoes, onChange, onLimpar }: BarraFiltrosProps) {
  const visiveis = filtros.filter((f) => !/remuneracao/i.test(f.id));
  const temAtivo = visiveis.some((f) => valores[f.id] !== undefined && valores[f.id] !== "");
  const metade = Math.ceil(visiveis.length / 2);
  const linha1 = visiveis.slice(0, metade);
  const linha2 = visiveis.slice(metade);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        {linha1.map((f) => (
          <div key={f.id} className="min-w-[180px] flex-1">
            <ControleFiltro
              filtro={f}
              valor={valores[f.id]}
              opcoes={opcoes?.[f.id]}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {linha2.map((f) => (
          <div key={f.id} className="min-w-[180px] flex-1">
            <ControleFiltro
              filtro={f}
              valor={valores[f.id]}
              opcoes={opcoes?.[f.id]}
              onChange={onChange}
            />
          </div>
        ))}
        {temAtivo && (
          <Button variant="ghost" size="sm" onClick={onLimpar} className="h-8 text-[12px]">
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}

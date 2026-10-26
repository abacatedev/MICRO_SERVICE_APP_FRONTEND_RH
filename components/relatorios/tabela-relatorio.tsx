"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ColunaResposta, ItemRelatorio, TotalAgregado } from "@/lib/relatorios/types";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Formatação de célula                                                */
/* ------------------------------------------------------------------ */

function formatarValor(
  val: unknown,
  tipo: string,
): string {
  if (val === null || val === undefined || val === "") return "—";
  if (tipo === "data") {
    const d = typeof val === "string" ? val : String(val);
    const [ano, mes, dia] = d.split("-");
    if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
    return d;
  }
  if (tipo === "numero") {
    const n = typeof val === "number" ? val : Number(val);
    if (Number.isNaN(n)) return String(val);
    return n.toLocaleString("pt-BR");
  }
  if (tipo === "percentual") {
    const n = typeof val === "number" ? val : Number(val);
    if (Number.isNaN(n)) return String(val);
    return `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  }
  if (tipo === "sim_nao") {
    return val === true || val === "true" || val === "S" ? "Sim" : "Não";
  }
  return String(val);
}

function formatarCpfVal(v: unknown): string {
  const s = String(v).replace(/\D/g, "");
  if (s.length !== 11) return String(v);
  return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/* ------------------------------------------------------------------ */
/* Destaque de busca                                                   */
/* ------------------------------------------------------------------ */

function DestacarTexto({ texto, busca }: { texto: string; busca: string }) {
  if (!busca) return <>{texto}</>;
  const normal = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const q = normal(busca);
  const t = normal(texto);
  const parts: React.ReactNode[] = [];
  let start = 0;
  let idx = t.indexOf(q);
  while (idx !== -1) {
    parts.push(texto.slice(start, start + idx));
    parts.push(
      <mark key={start} className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">
        {texto.slice(start + idx, start + idx + q.length)}
      </mark>,
    );
    start += idx + q.length;
    idx = t.indexOf(q, start);
  }
  parts.push(texto.slice(start));
  return <>{parts}</>;
}

/* ------------------------------------------------------------------ */
/* Tabela                                                              */
/* ------------------------------------------------------------------ */

interface TabelaRelatorioProps {
  colunas: ColunaResposta[];
  itens: ItemRelatorio[];
  totais: TotalAgregado[] | null;
  ordenadoPor: string;
  direcao: "asc" | "desc";
  onOrdenar: (col: string) => void;
  busca: string;
  onLinhaClick?: (item: ItemRelatorio) => void;
  agrupado: boolean;
}

export function TabelaRelatorio({
  colunas,
  itens,
  totais,
  ordenadoPor,
  direcao,
  onOrdenar,
  busca,
  onLinhaClick,
  agrupado,
}: TabelaRelatorioProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12.5px]">
        <thead className="bg-muted/50">
          <tr>
            {colunas.map((c) => (
              <th
                key={c.id}
                className={cn(
                  "border-border cursor-pointer select-none border-b px-3 py-2 font-semibold whitespace-nowrap",
                  onOrdenar && "hover:bg-muted",
                )}
                onClick={() => onOrdenar(c.id)}
              >
                <span className="inline-flex items-center gap-1">
                  {c.rotulo}
                  {ordenadoPor === c.id &&
                    (direcao === "asc" ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((item, i) => (
            <tr
              key={i}
              onClick={() => onLinhaClick?.(item)}
              className={cn(
                "border-border border-b transition-colors",
                onLinhaClick && "hover:bg-muted/50 cursor-pointer",
              )}
            >
              {colunas.map((c) => {
                const val = item[c.id];
                const texto =
                  c.id === "cpf" && val !== undefined
                    ? formatarCpfVal(val)
                    : formatarValor(val, c.tipo);
                const ehLista = typeof val === "string" && String(val).includes(" | ");
                return (
                  <td key={c.id} className="px-3 py-2 align-top">
                    {ehLista ? (
                      <div className="flex flex-col gap-0.5">
                        {String(val)
                          .split(" | ")
                          .map((linha, li) => (
                            <span key={li} className="block">
                              {c.id.toLowerCase().includes("nome") || c.id.toLowerCase().includes("servidor")
                                ? busca
                                  ? <DestacarTexto texto={linha} busca={busca} />
                                  : linha
                                : linha}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <span className="block">
                        {c.id.toLowerCase().includes("nome") || c.id.toLowerCase().includes("servidor")
                          ? busca
                            ? <DestacarTexto texto={texto} busca={busca} />
                            : texto
                          : texto}
                        {agrupado && c.id === "vinculos" && typeof val === "number" && val > 1 && (
                          <span className="bg-muted text-muted-foreground ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px]">
                            {val} vínculos
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        {totais && totais.length > 0 && (
          <tfoot className="bg-muted/40 font-semibold">
            <tr>
              {colunas.map((c) => {
                const total = totais.find((t) => t.coluna === c.id);
                return (
                  <td key={c.id} className="border-border border-t px-3 py-2">
                    {total ? formatarValor(total.valor, c.tipo) : ""}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
      {itens.length === 0 && (
        <div className="text-muted-foreground py-8 text-center text-[13px]">
          Nenhum resultado com esses filtros
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paginação                                                           */
/* ------------------------------------------------------------------ */

interface PaginacaoProps {
  pagina: number;
  porPagina: number;
  total: number;
  onMudarPagina: (p: number) => void;
  onMudarPorPagina: (n: number) => void;
}

export function Paginacao({
  pagina,
  porPagina,
  total,
  onMudarPagina,
  onMudarPorPagina,
}: PaginacaoProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
      <div className="text-muted-foreground text-[11.5px]">
        {inicio}–{fim} de {total.toLocaleString("pt-BR")}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onMudarPagina(1)}
          disabled={pagina <= 1}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onMudarPagina(pagina - 1)}
          disabled={pagina <= 1}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-[12.5px]">
          {pagina} / {totalPaginas}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onMudarPagina(pagina + 1)}
          disabled={pagina >= totalPaginas}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onMudarPagina(totalPaginas)}
          disabled={pagina >= totalPaginas}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[11.5px]">Por página:</span>
        {[25, 50, 100, 200].map((n) => (
          <button
            key={n}
            onClick={() => onMudarPorPagina(n)}
            className={cn(
              "h-6 rounded px-1.5 text-[11.5px] transition-colors",
              porPagina === n
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

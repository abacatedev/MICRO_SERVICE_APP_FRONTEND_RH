"use client";

import * as React from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { PALETA } from "@/lib/paleta";
import { LIMITE_SERVIDORES, useServidores } from "@/lib/rh/api";
import { colunasDeServidores, totalDePaginas, valorDaColuna } from "@/lib/rh/adaptadores";
import { formatNumber } from "@/lib/utils";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Lista paginada de vínculos.
 *
 * As colunas não têm contrato fixo: vêm das chaves que o `/rh/servidores`
 * devolve. `colunasDeServidores` descobre os nomes conhecidos e descarta os
 * campos vazios, então a tabela nunca mostra uma coluna só com traços.
 */
export function TabelaServidores({ className }: { className?: string }) {
  const [pagina, setPagina] = React.useState(1);
  const { data, isLoading, isError, erro, refetch } = useServidores(pagina, LIMITE_SERVIDORES);

  const itens = React.useMemo(() => data?.itens ?? [], [data]);
  const total = data?.total ?? 0;
  const paginas = totalDePaginas(total, LIMITE_SERVIDORES);
  const colunas = React.useMemo(() => colunasDeServidores(itens), [itens]);

  // Se a página atual passou do fim (filtro mudou no backend), volta para a 1.
  React.useEffect(() => {
    if (!isLoading && data && pagina > paginas) setPagina(1);
  }, [isLoading, data, pagina, paginas]);

  const primeiro = total === 0 ? 0 : (pagina - 1) * LIMITE_SERVIDORES + 1;
  const ultimo = Math.min(pagina * LIMITE_SERVIDORES, total);

  return (
    <SectionCard
      title="Vínculos"
      description="Lista nominal paginada · colunas conforme o retorno do SIP"
      className={className}
      contentClassName="px-0 pt-2 pb-0"
      footer={
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-[11.5px]"
          style={{ color: PALETA.textoSec }}
        >
          <span>
            {total === 0
              ? "Nenhum vínculo"
              : `Mostrando ${formatNumber(primeiro)}–${formatNumber(ultimo)} de ${formatNumber(total)} vínculos`}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina <= 1 || isLoading}
              className="inline-flex size-7 items-center justify-center rounded-[6px] border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: PALETA.borda, color: PALETA.texto }}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="px-1 tabular">
              Página {pagina} de {paginas}
            </span>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
              disabled={pagina >= paginas || isLoading}
              className="inline-flex size-7 items-center justify-center rounded-[6px] border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: PALETA.borda, color: PALETA.texto }}
              aria-label="Próxima página"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      }
    >
      {isError ? (
        <div className="flex flex-col items-center gap-2 px-5 py-8">
          <AlertCircle className="size-5" style={{ color: PALETA.critico }} />
          <p className="text-[12.5px]" style={{ color: PALETA.texto }}>
            Não foi possível carregar a lista de vínculos.
          </p>
          {erro && (
            <p className="max-w-[520px] text-center text-[11px] break-words" style={{ color: PALETA.textoSec }}>
              {erro}
            </p>
          )}
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="size-3.5" />
            Tentar novamente
          </Button>
        </div>
      ) : isLoading && !itens.length ? (
        <div className="space-y-2 px-5 py-2">
          {Array.from({ length: 6 }).map((_, indice) => (
            <Skeleton key={indice} className="h-8 w-full" />
          ))}
        </div>
      ) : itens.length === 0 ? (
        <p className="px-5 py-8 text-center text-[12.5px]" style={{ color: PALETA.textoSec }}>
          O backend não devolveu vínculos para esta página.
        </p>
      ) : colunas.length === 0 ? (
        <p className="px-5 py-8 text-center text-[12.5px]" style={{ color: PALETA.textoSec }}>
          {formatNumber(itens.length)} vínculos em colunas que esta tela ainda não reconhece —
          ajuste `COLUNAS_PREFERIDAS` em `lib/rh/adaptadores.ts`.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {colunas.map((coluna, indice) => (
                <TableHead
                  key={coluna.chave}
                  className={indice === 0 ? "pl-5" : indice === colunas.length - 1 ? "pr-5" : ""}
                >
                  {coluna.rotulo}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item, linha) => (
              <TableRow key={`${linha}-${valorDaColuna(item, colunas[0]?.chave ?? "")}`}>
                {colunas.map((coluna, indice) => (
                  <TableCell
                    key={coluna.chave}
                    className={
                      indice === 0
                        ? "pl-5 font-medium tabular"
                        : indice === colunas.length - 1
                          ? "text-muted-foreground pr-5"
                          : coluna.rotulo === "Servidor"
                            ? "max-w-[240px] truncate"
                            : "text-muted-foreground"
                    }
                    title={coluna.rotulo === "Servidor" ? valorDaColuna(item, coluna.chave) : undefined}
                  >
                    {valorDaColuna(item, coluna.chave)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}

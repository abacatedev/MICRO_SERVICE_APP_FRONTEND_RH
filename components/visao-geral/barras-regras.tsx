"use client";

import Link from "next/link";
import { corNoTema } from "@/lib/paleta";
import { COR_TIPO, ROTULO_TIPO, fmtPct, pct } from "@/lib/rh/adaptadores";
import { useTemaEscuro } from "@/lib/tema";
import type { RegraBarra } from "@/lib/rh/types";
import { formatNumber } from "@/lib/utils";

/**
 * Ranking de regras por vínculos atingidos.
 *
 * `largura` já vem normalizada (100 = regra que mais atinge vínculos). A coluna
 * da direita é a fatia sobre o total de vínculos ativos, que é o número que
 * interessa na leitura rápida.
 */
export function BarrasRegras({
  regras,
  totalVinculos,
}: {
  regras: RegraBarra[];
  totalVinculos: number;
}) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  if (!regras.length) {
    return (
      <p className="bg-muted text-muted-foreground rounded-[6px] px-3 py-6 text-center text-[13px]">
        Nenhuma regra com apontamento.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {regras.map((regra) => (
        <li key={regra.codigo}>
          <Link
            href={`/relatorios?r=diagnostico-regra&regra=${encodeURIComponent(regra.codigo)}`}
            className="block transition-opacity hover:opacity-80"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span
                className="text-foreground flex min-w-0 items-center gap-1.5 text-[12.5px]"
                title={regra.titulo}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: t(COR_TIPO[regra.tipo]) }}
                />
                <span className="truncate">{regra.titulo}</span>
                <span className="text-muted-foreground shrink-0 text-[10.5px] font-medium tracking-[0.04em] uppercase">
                  {ROTULO_TIPO[regra.tipo]}
                </span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="text-foreground text-[12.5px] font-semibold tabular">
                  {formatNumber(regra.valor)}
                </span>
                <span className="text-muted-foreground w-11 text-right text-[11px] tabular">
                  {fmtPct(pct(regra.valor, totalVinculos))}
                </span>
              </span>
            </div>

            <div className="bg-muted mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(regra.largura, 1.5)}%`,
                  backgroundColor: t(COR_TIPO[regra.tipo]),
                }}
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

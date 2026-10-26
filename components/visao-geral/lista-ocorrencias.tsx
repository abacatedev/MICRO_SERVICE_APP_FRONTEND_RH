"use client";

import Link from "next/link";
import { corNoTema } from "@/lib/paleta";
import { COR_TIPO } from "@/lib/rh/adaptadores";
import { useTemaEscuro } from "@/lib/tema";
import type { RegraBarra } from "@/lib/rh/types";
import { formatNumber } from "@/lib/utils";

/**
 * Regras com mais ocorrências.
 *
 * "Ocorrências" ≠ "vínculos": uma regra de dependente conta uma vez por
 * dependente. Por isso este ranking pode divergir do de vínculos ao lado.
 */
export function ListaOcorrencias({ regras }: { regras: RegraBarra[] }) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  if (!regras.length) {
    return (
      <p className="bg-muted text-muted-foreground rounded-[6px] px-3 py-6 text-center text-[13px]">
        Nenhuma ocorrência registrada.
      </p>
    );
  }

  const total = regras.reduce((acc, regra) => acc + regra.valor, 0);

  return (
    <div>
      <ul className="space-y-3.5">
        {regras.map((regra) => (
          <li key={regra.codigo}>
            <Link
              href={`/relatorios?r=diagnostico-regra&regra=${encodeURIComponent(regra.codigo)}`}
              className="block transition-opacity hover:opacity-80"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-foreground truncate text-[12.5px] font-medium" title={regra.titulo}>
                  {regra.titulo}
                </p>
                <p className="text-foreground shrink-0 text-[12.5px] font-semibold tabular">
                  {formatNumber(regra.valor)}
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(regra.largura, 1.5)}%`,
                      backgroundColor: t(COR_TIPO[regra.tipo]),
                    }}
                  />
                </div>
                <span className="text-muted-foreground w-10 shrink-0 text-right text-[10.5px] tabular">
                  {Math.round(regra.largura)}%
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-border mt-4 flex items-center justify-between border-t pt-3 text-[11.5px]">
        <span className="text-muted-foreground">Ocorrências no top {regras.length}</span>
        <span className="text-foreground font-semibold tabular">{formatNumber(total)}</span>
      </div>
    </div>
  );
}

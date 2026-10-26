"use client";

import { PALETA, corNoTema } from "@/lib/paleta";
import { fmtPct, pct } from "@/lib/rh/adaptadores";
import { useTemaEscuro } from "@/lib/tema";
import type { EtapaFunil } from "@/lib/rh/types";
import { formatNumber } from "@/lib/utils";

/**
 * Funil do diagnóstico: do universo de vínculos até a regra mais grave.
 *
 * A primeira etapa é sempre 100%; as seguintes são percentuais sobre ela. O
 * rodapé fecha a leitura com o número que importa — quantos estão em
 * conformidade.
 *
 * A barra usa `--primary` em todas as etapas: o degrau do funil já é dado pela
 * opacidade, e o azul-marinho da primeira etapa sumiria no fundo escuro.
 */
export function FunilConformidade({
  etapas,
  vinculos,
  semPendencia,
}: {
  etapas: EtapaFunil[];
  vinculos: number;
  semPendencia: number;
}) {
  const escuro = useTemaEscuro();
  const corBarra = corNoTema(PALETA.azul, escuro);

  if (!etapas.length) {
    return (
      <p className="bg-muted text-muted-foreground rounded-[6px] px-3 py-6 text-center text-[13px]">
        Sem dados para montar o funil.
      </p>
    );
  }

  const topo = etapas[0]?.valor || 1;

  return (
    <div className="space-y-3">
      {etapas.map((etapa, indice) => {
        const largura = (etapa.valor / topo) * 100;

        return (
          <div key={etapa.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-foreground min-w-0 truncate text-[12.5px]">
                {etapa.label}
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="text-foreground text-[12.5px] font-semibold tabular">
                  {formatNumber(etapa.valor)}
                </span>
                <span className="text-muted-foreground w-11 text-right text-[11px] tabular">
                  {fmtPct(etapa.taxa)}
                </span>
              </span>
            </div>

            <div className="bg-muted h-7 w-full overflow-hidden rounded-md">
              <div
                className="h-full rounded-md"
                style={{
                  width: `${Math.max(largura, 2)}%`,
                  backgroundColor: corBarra,
                  opacity: 1 - indice * 0.14,
                }}
              />
            </div>

            {etapa.detalhe && (
              <p className="text-muted-foreground mt-1 truncate text-[11px]">{etapa.detalhe}</p>
            )}
          </div>
        );
      })}

      <p className="text-muted-foreground pt-1 text-[11px]">
        Em conformidade:{" "}
        <span className="text-foreground font-semibold">{formatNumber(semPendencia)}</span> de{" "}
        {formatNumber(vinculos)} vínculos ({fmtPct(pct(semPendencia, vinculos))}).
      </p>
    </div>
  );
}

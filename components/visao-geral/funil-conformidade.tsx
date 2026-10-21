import { PALETA } from "@/lib/paleta";
import { fmtPct, pct } from "@/lib/rh/adaptadores";
import type { EtapaFunil } from "@/lib/rh/types";
import { formatNumber } from "@/lib/utils";

/**
 * Funil do diagnóstico: do universo de vínculos até a regra mais grave.
 *
 * A primeira etapa é sempre 100%; as seguintes são percentuais sobre ela. O
 * rodapé fecha a leitura com o número que importa — quantos estão em
 * conformidade.
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
  if (!etapas.length) {
    return (
      <p
        className="rounded-[6px] px-3 py-6 text-center text-[13px]"
        style={{ backgroundColor: PALETA.fundo, color: PALETA.textoSec }}
      >
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
              <span className="min-w-0 truncate text-[12.5px]" style={{ color: PALETA.texto }}>
                {etapa.label}
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="text-[12.5px] font-semibold tabular" style={{ color: PALETA.texto }}>
                  {formatNumber(etapa.valor)}
                </span>
                <span className="w-11 text-right text-[11px] tabular" style={{ color: PALETA.textoSec }}>
                  {fmtPct(etapa.taxa)}
                </span>
              </span>
            </div>

            <div
              className="h-7 w-full overflow-hidden rounded-md"
              style={{ backgroundColor: PALETA.trilho }}
            >
              <div
                className="h-full rounded-md"
                style={{
                  width: `${Math.max(largura, 2)}%`,
                  backgroundColor: indice === 0 ? PALETA.azulEscuro : PALETA.azul,
                  opacity: 1 - indice * 0.14,
                }}
              />
            </div>

            {etapa.detalhe && (
              <p className="mt-1 truncate text-[11px]" style={{ color: PALETA.textoSec }}>
                {etapa.detalhe}
              </p>
            )}
          </div>
        );
      })}

      <p className="pt-1 text-[11px]" style={{ color: PALETA.textoSec }}>
        Em conformidade:{" "}
        <span className="font-semibold" style={{ color: PALETA.texto }}>
          {formatNumber(semPendencia)}
        </span>{" "}
        de {formatNumber(vinculos)} vínculos ({fmtPct(pct(semPendencia, vinculos))}).
      </p>
    </div>
  );
}

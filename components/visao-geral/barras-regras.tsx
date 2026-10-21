import { PALETA } from "@/lib/paleta";
import { COR_TIPO, ROTULO_TIPO, fmtPct, pct } from "@/lib/rh/adaptadores";
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
  if (!regras.length) {
    return (
      <p
        className="rounded-[6px] px-3 py-6 text-center text-[13px]"
        style={{ backgroundColor: PALETA.fundo, color: PALETA.textoSec }}
      >
        Nenhuma regra com apontamento.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {regras.map((regra) => (
        <li key={regra.codigo}>
          <div className="flex items-baseline justify-between gap-3">
            <span
              className="flex min-w-0 items-center gap-1.5 text-[12.5px]"
              style={{ color: PALETA.texto }}
              title={regra.titulo}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: COR_TIPO[regra.tipo] }}
              />
              <span className="truncate">{regra.titulo}</span>
              <span
                className="shrink-0 text-[10.5px] font-medium tracking-[0.04em] uppercase"
                style={{ color: PALETA.textoSec }}
              >
                {ROTULO_TIPO[regra.tipo]}
              </span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="text-[12.5px] font-semibold tabular" style={{ color: PALETA.texto }}>
                {formatNumber(regra.valor)}
              </span>
              <span className="w-11 text-right text-[11px] tabular" style={{ color: PALETA.textoSec }}>
                {fmtPct(pct(regra.valor, totalVinculos))}
              </span>
            </span>
          </div>

          <div
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: PALETA.trilho }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(regra.largura, 1.5)}%`,
                backgroundColor: COR_TIPO[regra.tipo],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

import { PALETA } from "@/lib/paleta";
import { COR_TIPO } from "@/lib/rh/adaptadores";
import type { RegraBarra } from "@/lib/rh/types";
import { formatNumber } from "@/lib/utils";

/**
 * Regras com mais ocorrências.
 *
 * "Ocorrências" ≠ "vínculos": uma regra de dependente conta uma vez por
 * dependente. Por isso este ranking pode divergir do de vínculos ao lado.
 */
export function ListaOcorrencias({ regras }: { regras: RegraBarra[] }) {
  if (!regras.length) {
    return (
      <p
        className="rounded-[6px] px-3 py-6 text-center text-[13px]"
        style={{ backgroundColor: PALETA.fundo, color: PALETA.textoSec }}
      >
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
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-[12.5px] font-medium" title={regra.titulo}>
                {regra.titulo}
              </p>
              <p className="shrink-0 text-[12.5px] font-semibold tabular">
                {formatNumber(regra.valor)}
              </p>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div
                className="h-1 w-full overflow-hidden rounded-full"
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
              <span
                className="w-10 shrink-0 text-right text-[10.5px] tabular"
                style={{ color: PALETA.textoSec }}
              >
                {Math.round(regra.largura)}%
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="mt-4 flex items-center justify-between border-t pt-3 text-[11.5px]"
        style={{ borderColor: PALETA.borda }}
      >
        <span style={{ color: PALETA.textoSec }}>Ocorrências no top {regras.length}</span>
        <span className="font-semibold tabular">{formatNumber(total)}</span>
      </div>
    </div>
  );
}

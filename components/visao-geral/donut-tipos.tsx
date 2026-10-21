"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PALETA } from "@/lib/paleta";
import { fmtPct, pct } from "@/lib/rh/adaptadores";
import type { FatiaTipo } from "@/lib/rh/types";
import { formatNumber } from "@/lib/utils";

function TooltipFatia({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: FatiaTipo }[];
}) {
  if (!active || !payload?.length) return null;
  const fatia = payload[0].payload;

  return (
    <div
      className="rounded-md border bg-white px-2.5 py-2 shadow-md"
      style={{ borderColor: PALETA.borda }}
    >
      <p className="text-[13px] font-semibold" style={{ color: PALETA.texto }}>
        {fatia.label}
      </p>
      <p className="mt-0.5 text-[11.5px]" style={{ color: PALETA.textoSec }}>
        {formatNumber(fatia.value)} apontamentos
      </p>
    </div>
  );
}

/**
 * Rosca dos apontamentos por tipo de regra.
 *
 * A soma NÃO é o número de vínculos: um vínculo aparece em todas as regras que
 * ele quebra. O centro da rosca diz "apontamentos" justamente por isso.
 */
export function DonutTipos({ fatias }: { fatias: FatiaTipo[] }) {
  if (!fatias.length) {
    return (
      <p
        className="rounded-[6px] px-3 py-6 text-center text-[13px]"
        style={{ backgroundColor: PALETA.fundo, color: PALETA.textoSec }}
      >
        Nenhuma regra com apontamento.
      </p>
    );
  }

  const total = fatias.reduce((acc, fatia) => acc + fatia.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto h-[172px] w-[172px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<TooltipFatia />} />
            <Pie
              data={fatias}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={82}
              paddingAngle={1.5}
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {fatias.map((fatia) => (
                <Cell key={fatia.tipo} fill={fatia.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-[10px]" style={{ color: PALETA.textoSec }}>
            Apontamentos
          </span>
          <span className="num-cond mt-0.5 text-[19px] leading-none" style={{ color: PALETA.azulEscuro }}>
            {formatNumber(total)}
          </span>
        </div>
      </div>

      <ul className="space-y-1.5">
        {fatias.map((fatia) => (
          <li key={fatia.tipo} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: fatia.color }}
            />
            <span className="min-w-0 flex-1 truncate" style={{ color: PALETA.textoSec }}>
              {fatia.label}
            </span>
            <span className="font-semibold tabular" style={{ color: PALETA.texto }}>
              {formatNumber(fatia.value)}
            </span>
            <span className="w-11 text-right tabular" style={{ color: PALETA.textoSec }}>
              {fmtPct(pct(fatia.value, total))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

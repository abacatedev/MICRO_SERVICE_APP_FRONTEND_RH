"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PALETA, corNoTema } from "@/lib/paleta";
import { fmtPct, pct } from "@/lib/rh/adaptadores";
import type { FatiaTipo } from "@/lib/rh/types";
import { useTemaEscuro } from "@/lib/tema";
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
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{fatia.label}</p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
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
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  if (!fatias.length) {
    return (
      <p className="bg-muted text-muted-foreground rounded-[6px] px-3 py-6 text-center text-[13px]">
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
              stroke={t(PALETA.cartao)}
              strokeWidth={2}
            >
              {fatias.map((fatia) => (
                <Cell key={fatia.tipo} fill={t(fatia.color)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-muted-foreground text-[10px]">Apontamentos</span>
          <span className="num-cond text-foreground mt-0.5 text-[19px] leading-none">
            {formatNumber(total)}
          </span>
        </div>
      </div>

      <ul className="space-y-1.5">
        {fatias.map((fatia) => (
          <li key={fatia.tipo} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: t(fatia.color) }}
            />
            <span className="text-muted-foreground min-w-0 flex-1 truncate">{fatia.label}</span>
            <span className="text-foreground font-semibold tabular">
              {formatNumber(fatia.value)}
            </span>
            <span className="text-muted-foreground w-11 text-right tabular">
              {fmtPct(pct(fatia.value, total))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

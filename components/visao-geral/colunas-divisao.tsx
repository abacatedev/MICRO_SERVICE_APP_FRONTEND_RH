"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PALETA } from "@/lib/paleta";
import { fmtPct, pct } from "@/lib/rh/adaptadores";
import type { SerieDivisao } from "@/lib/rh/types";
import { formatNumber } from "@/lib/utils";

function TooltipDivisao({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SerieDivisao }[];
}) {
  if (!active || !payload?.length) return null;
  const linha = payload[0].payload;
  const total = linha.com_erro + linha.com_alerta;

  return (
    <div
      className="rounded-md border bg-white px-2.5 py-2 shadow-md"
      style={{ borderColor: PALETA.borda }}
    >
      <p className="text-[13px] font-semibold" style={{ color: PALETA.texto }}>
        {linha.curto}
      </p>
      <p className="mt-0.5 text-[11.5px]" style={{ color: PALETA.textoSec }}>
        {formatNumber(linha.vinculos)} vínculos · {fmtPct(pct(total, linha.vinculos))} com pendência
      </p>
      <p className="mt-1 text-[11.5px]" style={{ color: PALETA.textoSec }}>
        {formatNumber(linha.com_erro)} com erro · {formatNumber(linha.com_alerta)} com alerta
      </p>
    </div>
  );
}

/**
 * Barras horizontais empilhadas por secretaria: erro (vermelho) + alerta
 * (laranja). A ordem já vem do adaptador, da pior para a melhor.
 */
export function ColunasDivisao({ serie }: { serie: SerieDivisao[] }) {
  if (!serie.length) {
    return (
      <p
        className="rounded-[6px] px-3 py-6 text-center text-[13px]"
        style={{ backgroundColor: PALETA.fundo, color: PALETA.textoSec }}
      >
        Nenhuma secretaria com pendência no diagnóstico atual.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[324px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={serie}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
            barCategoryGap="22%"
          >
            <CartesianGrid horizontal={false} stroke={PALETA.bordaSuave} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: PALETA.textoSec }}
              axisLine={{ stroke: PALETA.entrada }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="curto"
              width={116}
              tick={{ fontSize: 12, fill: PALETA.textoSec }}
              axisLine={{ stroke: PALETA.entrada }}
              tickLine={false}
            />
            <Tooltip content={<TooltipDivisao />} cursor={{ fill: PALETA.trilho }} />
            <Bar dataKey="com_erro" name="Com erro" stackId="p" fill={PALETA.critico} barSize={14} />
            <Bar
              dataKey="com_alerta"
              name="Com alerta"
              stackId="p"
              fill={PALETA.laranja}
              barSize={14}
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
        <li className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: PALETA.critico }} />
          <span style={{ color: PALETA.textoSec }}>Com erro</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: PALETA.laranja }} />
          <span style={{ color: PALETA.textoSec }}>Com alerta</span>
        </li>
        <li className="ml-auto" style={{ color: PALETA.textoSec }}>
          Vínculos distintos — um vínculo pode ter erro e alerta.
        </li>
      </ul>
    </div>
  );
}

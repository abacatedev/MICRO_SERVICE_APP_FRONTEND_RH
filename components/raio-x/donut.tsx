"use client";

/**
 * Donut compartilhado das abas Quadro e Qualidade.
 *
 * Só desenha: recebe as fatias já derivadas (`lib/raio-x/calculos.ts`) e não
 * conhece regra de negócio. A legenda fica de fora de propósito — a do Quadro é
 * clicável e navega para a secretaria, a da Qualidade agrupa por categoria.
 */

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { fmtNum } from "@/lib/raio-x/calculos";
import { RX, corNoTema } from "@/lib/raio-x/cores";
import { useTemaEscuro } from "@/lib/raio-x/tema";
import type { Fatia } from "@/lib/raio-x/types";

function TooltipFatia({
  active,
  payload,
  unidade = "vínculos",
}: {
  active?: boolean;
  payload?: { payload: Fatia }[];
  unidade?: string;
}) {
  if (!active || !payload?.length) return null;
  const fatia = payload[0].payload;

  return (
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{fatia.label}</p>
      {fatia.detalhe && (
        <p className="text-muted-foreground mt-0.5 text-[11px]">{fatia.detalhe}</p>
      )}
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
        {fmtNum(fatia.value)} {unidade}
      </p>
    </div>
  );
}

export function Donut({
  fatias,
  tamanho,
  furo,
  centroRotulo,
  centroValor,
  unidade,
  destaqueCod,
  onSelect,
}: {
  fatias: Fatia[];
  tamanho: number;
  furo: number;
  centroRotulo: string;
  centroValor: string;
  /** Unidade do tooltip: "vínculos", "apontamentos"… */
  unidade?: string;
  destaqueCod?: string;
  onSelect?: (fatia: Fatia) => void;
}) {
  const escuro = useTemaEscuro();
  // O vão entre fatias é a cor do card: branco no claro, o azul do card no escuro.
  const contorno = corNoTema(RX.cartao, escuro);

  const raioInterno = (tamanho * furo) / 2;
  const raioExterno = tamanho / 2 - 2;

  return (
    <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<TooltipFatia unidade={unidade} />} />
          <Pie
            data={fatias}
            dataKey="value"
            nameKey="label"
            innerRadius={raioInterno}
            outerRadius={raioExterno}
            paddingAngle={1.5}
            stroke={contorno}
            strokeWidth={2}
            onClick={(_: unknown, index: number) => onSelect?.(fatias[index])}
          >
            {fatias.map((fatia) => (
              <Cell
                key={fatia.label}
                fill={corNoTema(fatia.color, escuro)}
                stroke={
                  fatia.cod && fatia.cod === destaqueCod
                    ? corNoTema(RX.azulEscuro, escuro)
                    : contorno
                }
                strokeWidth={fatia.cod && fatia.cod === destaqueCod ? 2.5 : 2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span className="text-muted-foreground text-[10px]">{centroRotulo}</span>
        <span className="num-cond text-foreground mt-0.5 text-[18px] leading-none">
          {centroValor}
        </span>
      </div>
    </div>
  );
}

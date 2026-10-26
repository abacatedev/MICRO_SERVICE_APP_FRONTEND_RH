"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PALETA, corNoTema } from "@/lib/paleta";
import { fmtPct, pct } from "@/lib/rh/adaptadores";
import type { SerieDivisao } from "@/lib/rh/types";
import { useTemaEscuro } from "@/lib/tema";
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
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{linha.curto}</p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
        {formatNumber(linha.vinculos)} vínculos · {fmtPct(pct(total, linha.vinculos))} com pendência
      </p>
      <p className="text-muted-foreground mt-1 text-[11.5px]">
        {formatNumber(linha.com_erro)} com erro · {formatNumber(linha.com_alerta)} com alerta
      </p>
    </div>
  );
}

/**
 * Largura do eixo Y, medida a partir do maior nome da série.
 *
 * O piso de 116px é o valor original (cabem "Assistência Social", "Turismo e
 * Cultura"); o teto de 320px impede que um nome enorme engula a área das
 * barras. Antes a largura era fixa em 116 e nome comprido passava da borda
 * esquerda do SVG — o rótulo é ancorado à direita, então o que some é o começo
 * do nome, justamente a parte que identifica a secretaria.
 *
 * Os 7,1px por caractere foram medidos na própria tela: 22 caracteres em 12px
 * ocupavam 148px de eixo.
 */
const LARGURA_MINIMA = 116;
const LARGURA_MAXIMA = 220;
const LARGURA_CARACTERE = 7.1;

function larguraDoEixo(serie: SerieDivisao[]): number {
  const maior = serie.reduce((acc, linha) => Math.max(acc, linha.curto.length), 0);
  const necessaria = Math.ceil(maior * LARGURA_CARACTERE) + 16;
  return Math.min(LARGURA_MAXIMA, Math.max(LARGURA_MINIMA, necessaria));
}

/**
 * Densidade do eixo: 27px por secretaria, a mesma do desenho original com 12
 * linhas em 324px. Com mais divisões o gráfico cresce em vez de espremer.
 */
const ALTURA_MINIMA = 324;
const ALTURA_POR_SECRETARIA = 27;

/**
 * Barras horizontais empilhadas por secretaria: erro (vermelho) + alerta
 * (laranja). A ordem já vem do adaptador, da pior para a melhor.
 */
export function ColunasDivisao({ serie }: { serie: SerieDivisao[] }) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  if (!serie.length) {
    return (
      <p className="bg-muted text-muted-foreground rounded-[6px] px-3 py-6 text-center text-[13px]">
        Nenhuma secretaria com pendência no diagnóstico atual.
      </p>
    );
  }

  const altura = Math.max(ALTURA_MINIMA, serie.length * ALTURA_POR_SECRETARIA);

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full" style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={serie}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
            barCategoryGap="22%"
          >
            <CartesianGrid horizontal={false} stroke={t(PALETA.bordaSuave)} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: t(PALETA.textoSec) }}
              axisLine={{ stroke: t(PALETA.entrada) }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="curto"
              width={larguraDoEixo(serie)}
              tick={{ fontSize: 12, fill: t(PALETA.textoSec) }}
              axisLine={{ stroke: t(PALETA.entrada) }}
              tickLine={false}
            />
            <Tooltip content={<TooltipDivisao />} cursor={{ fill: t(PALETA.trilho) }} />
            <Bar
              dataKey="com_erro"
              name="Com erro"
              stackId="p"
              fill={t(PALETA.critico)}
              barSize={14}
            />
            <Bar
              dataKey="com_alerta"
              name="Com alerta"
              stackId="p"
              fill={t(PALETA.laranja)}
              barSize={14}
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
        <li className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: t(PALETA.critico) }}
          />
          <span className="text-muted-foreground">Com erro</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: t(PALETA.laranja) }}
          />
          <span className="text-muted-foreground">Com alerta</span>
        </li>
        <li className="text-muted-foreground ml-auto">
          Vínculos distintos — um vínculo pode ter erro e alerta.
        </li>
      </ul>
    </div>
  );
}

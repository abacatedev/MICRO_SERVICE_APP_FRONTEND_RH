"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { RX } from "@/lib/raio-x/cores";
import {
  corDaRegra,
  fmtNum,
  fmtPct,
  rankingCasos,
  rotuloRegra,
  seriePorSecretaria,
  volumePorSecretaria,
} from "@/lib/raio-x/calculos";
import type {
  PontoSecretaria,
  RegraDef,
  RegraId,
  Secretaria,
  VolumePonto,
} from "@/lib/raio-x/types";
import { RxCard } from "@/components/raio-x/rx-card";

interface Props {
  lista: Secretaria[];
  regra: RegraId;
  cartoes: RegraDef[];
  media: number;
  sec: string;
  onToggleSec: (cod: string) => void;
}

interface RotuloProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
}

function TooltipColuna({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PontoSecretaria }[];
}) {
  if (!active || !payload?.length) return null;
  const ponto = payload[0].payload;

  return (
    <div
      className="rounded-md border bg-white px-2.5 py-2 shadow-md"
      style={{ borderColor: RX.borda }}
    >
      <p className="text-[13px] font-semibold" style={{ color: RX.texto }}>
        {ponto.curto}
      </p>
      <p className="mt-0.5 text-[11.5px]" style={{ color: RX.textoSec }}>
        {ponto.rotulo} dos vínculos · {fmtNum(ponto.vinc)} vínculos
      </p>
    </div>
  );
}

function TooltipVolume({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: VolumePonto }[];
}) {
  if (!active || !payload?.length) return null;
  const ponto = payload[0].payload;

  return (
    <div
      className="rounded-md border bg-white px-2.5 py-2 shadow-md"
      style={{ borderColor: RX.borda }}
    >
      <p className="text-[13px] font-semibold" style={{ color: RX.texto }}>
        {ponto.curto}
      </p>
      <p className="mt-0.5 text-[11.5px]" style={{ color: RX.textoSec }}>
        Regra em foco: {fmtNum(ponto.foco)} de {fmtNum(ponto.total)} apontamentos
      </p>
    </div>
  );
}

/** A) % dos vínculos por secretaria, com média da Prefeitura tracejada. */
export function ColunasPorSecretaria({ lista, regra, cartoes, media, sec, onToggleSec }: Props) {
  const serie = seriePorSecretaria(lista, regra, media, sec);
  const cor = corDaRegra(regra, cartoes);

  const rotulos = (props: RotuloProps) => {
    const { x = 0, y = 0, width = 0, index = 0 } = props;
    const ponto = serie[Number(index)];
    if (!ponto) return <g />;

    return (
      <text
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 5}
        textAnchor="middle"
        fontSize={11}
        fontWeight={ponto.selecionada ? 700 : 600}
        fill={RX.texto}
      >
        {ponto.rotulo}
      </text>
    );
  };

  return (
    <div className="min-h-[200px] w-full flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={serie}
          margin={{ top: 20, right: 44, left: -16, bottom: 42 }}
          barCategoryGap="24%"
        >
          <CartesianGrid vertical={false} stroke={RX.bordaSuave} strokeDasharray="3 4" />
          <XAxis
            dataKey="curto"
            interval={0}
            angle={-32}
            textAnchor="end"
            height={58}
            tick={{ fontSize: 12, fill: RX.textoSec }}
            tickLine={false}
            axisLine={{ stroke: RX.entrada }}
          />
          <YAxis
            tickFormatter={(valor: number) => `${valor}%`}
            tick={{ fontSize: 12, fill: RX.textoSec }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip cursor={{ fill: RX.trilho }} content={<TooltipColuna />} />
          <ReferenceLine
            y={media}
            stroke={RX.texto}
            strokeDasharray="6 4"
            strokeWidth={2}
            label={{
              value: fmtPct(media),
              position: "right",
              fontSize: 11,
              fill: RX.texto,
            }}
          />
          <Bar
            dataKey="valor"
            radius={[4, 4, 0, 0]}
            onClick={(entrada: { cod?: string; payload?: { cod?: string } }) => {
              const cod = entrada?.cod ?? entrada?.payload?.cod;
              if (cod) onToggleSec(cod);
            }}
          >
            {serie.map((ponto) => (
              <Cell
                key={ponto.cod}
                fill={ponto.acima ? RX.laranja : cor}
                stroke={ponto.selecionada ? RX.azulEscuro : "transparent"}
                strokeWidth={3}
              />
            ))}
            <LabelList dataKey="rotulo" content={rotulos} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** B) Peso da regra em foco no volume de apontamentos de cada secretaria. */
export function VolumeRegra({ lista, regra, cartoes, sec, onToggleSec }: Props) {
  const serie = volumePorSecretaria(lista, regra, sec);
  const cor = corDaRegra(regra, cartoes);

  const rotulos = (props: RotuloProps) => {
    const { x = 0, y = 0, width = 0, index = 0 } = props;
    const ponto = serie[Number(index)];
    if (!ponto) return <g />;

    return (
      <text
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 5}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={RX.texto}
      >
        {fmtNum(ponto.foco)}
      </text>
    );
  };

  return (
    <div className="min-h-[190px] w-full flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={serie}
          margin={{ top: 20, right: 8, left: -18, bottom: 42 }}
          barCategoryGap="24%"
        >
          <CartesianGrid vertical={false} stroke={RX.bordaSuave} strokeDasharray="3 4" />
          <XAxis
            dataKey="curto"
            interval={0}
            angle={-32}
            textAnchor="end"
            height={58}
            tick={{ fontSize: 12, fill: RX.textoSec }}
            tickLine={false}
            axisLine={{ stroke: RX.entrada }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: RX.textoSec }}
            tickLine={false}
            axisLine={false}
            width={38}
          />
          <Tooltip cursor={{ fill: RX.trilho }} content={<TooltipVolume />} />
          <Bar dataKey="foco" stackId="volume" fill={cor} />
          <Bar
            dataKey="demais"
            stackId="volume"
            fill={RX.cinzaOutras}
            radius={[4, 4, 0, 0]}
            onClick={(entrada: { cod?: string; payload?: { cod?: string } }) => {
              const cod = entrada?.cod ?? entrada?.payload?.cod;
              if (cod) onToggleSec(cod);
            }}
          >
            <LabelList dataKey="total" content={rotulos} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** C) Ranking absoluto da regra em foco. */
export function RankingCasos({ lista, regra, cartoes, sec, onToggleSec }: Props) {
  const itens = rankingCasos(lista, regra, sec);
  const cor = corDaRegra(regra, cartoes);

  return (
    <ul className="mt-1 space-y-0.5">
      {itens.map((item) => (
        <li key={item.cod}>
          <button
            type="button"
            onClick={() => onToggleSec(item.cod)}
            aria-pressed={item.selecionada}
            className="flex w-full items-center gap-2 rounded-md px-1.5 py-[5px] text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: item.selecionada ? RX.azulClaro : "transparent",
              outlineColor: RX.azul,
            }}
          >
            <span
              className="w-[104px] shrink-0 truncate text-[12px]"
              style={{
                color: item.selecionada ? RX.texto : RX.textoSec,
                fontWeight: item.selecionada ? 700 : 400,
              }}
              title={item.curto}
            >
              {item.curto}
            </span>
            <span
              className="h-2.5 flex-1 overflow-hidden rounded-full"
              style={{ backgroundColor: RX.trilho }}
            >
              <span
                className="block h-full rounded-full"
                style={{ width: `${Math.max(item.largura, 2)}%`, backgroundColor: cor }}
              />
            </span>
            <span
              className="w-9 shrink-0 text-right text-[12px] font-semibold tabular-nums"
              style={{ color: RX.texto }}
            >
              {fmtNum(item.valor)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function AbaRegraFoco({
  lista,
  regra,
  cartoes,
  media,
  sec,
  onToggleSec,
}: Props) {
  const cor = corDaRegra(regra, cartoes);
  const rotulo = rotuloRegra(regra, cartoes);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <RxCard
        className="flex-1"
        bodyClassName="min-h-0"
        titulo={`${rotulo}: % dos vínculos por secretaria`}
        subtitulo={`Tracejado: média da Prefeitura (${fmtPct(media)}). Laranja: acima da média.`}
        acao={
          <button
            type="button"
            aria-disabled="true"
            title="Tela de lista nominal (em construção)"
            className={cn(
              "h-7 cursor-not-allowed rounded-md border px-2 text-[13px] font-medium opacity-70",
            )}
            style={{ borderColor: RX.borda, color: RX.textoSec }}
          >
            Ver lista nominal
          </button>
        }
      >
        <ColunasPorSecretaria
          lista={lista}
          regra={regra}
          cartoes={cartoes}
          media={media}
          sec={sec}
          onToggleSec={onToggleSec}
        />
      </RxCard>

      <div className="grid flex-1 gap-3 lg:grid-cols-5">
        <div className="flex min-h-0 lg:col-span-3">
          <RxCard
            className="h-full"
            bodyClassName="min-h-0"
            titulo="Peso da regra no volume de cada secretaria"
            subtitulo="Empilhado: regra em foco (embaixo) e demais regras (acima)."
          >
            <VolumeRegra
              lista={lista}
              regra={regra}
              cartoes={cartoes}
              media={media}
              sec={sec}
              onToggleSec={onToggleSec}
            />
          </RxCard>
        </div>

        <div className="flex min-h-0 lg:col-span-2">
          <RxCard
            className="h-full"
            bodyClassName="justify-between"
            titulo="Onde estão os casos"
            subtitulo={`Sete secretarias com mais vínculos em ${rotulo.toLowerCase()}.`}
          >
            <RankingCasos
              lista={lista}
              regra={regra}
              cartoes={cartoes}
              media={media}
              sec={sec}
              onToggleSec={onToggleSec}
            />
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-4 rounded-sm"
                style={{ backgroundColor: cor }}
              />
              <span className="text-[12px]" style={{ color: RX.textoSec }}>
                Quantidade absoluta na regra em foco
              </span>
            </div>
          </RxCard>
        </div>
      </div>
    </div>
  );
}

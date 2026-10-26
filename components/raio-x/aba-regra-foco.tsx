"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { GX, RX, corNoTema } from "@/lib/raio-x/cores";
import {
  fmtNum,
  fmtPct,
  rankingCasos,
  rotuloRegra,
  seriePorSecretaria,
  volumePorSecretaria,
} from "@/lib/raio-x/calculos";
import { useTemaEscuro } from "@/lib/raio-x/tema";
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
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{ponto.curto}</p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
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
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{ponto.curto}</p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
        Pendência em foco: {fmtNum(ponto.foco)} de {fmtNum(ponto.total)} apontamentos
      </p>
    </div>
  );
}

/**
 * A) % dos vínculos por secretaria.
 *
 * Duas cores, ambas da paleta: azul escuro para quem está **acima da
 * referência da Prefeitura** (o maior percentual) e azul principal para o
 * resto. Nada de vermelho/laranja — o que a barra mede é volume, não erro.
 *
 * A referência vem de `mediaDoTotal` (linha `ALL` da API): é o percentual da
 * Prefeitura inteira, não a média aritmética das barras, e não muda com o
 * filtro de secretaria.
 *
 * A legenda abaixo do gráfico é obrigatória: a versão anterior pintava de
 * laranja quem estava acima da média e não explicava a cor em lugar nenhum.
 */
export function ColunasPorSecretaria({ lista, regra, media, sec, onToggleSec }: Props) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const serie = seriePorSecretaria(lista, regra, media, sec);
  const corBase = t(GX.principal);
  const corAcima = t(GX.escuro);
  // A selecionada usa o terceiro azul da rampa: distingue-se dos dois grupos
  // sem precisar de vermelho nem de contorno extra.
  const corSelecionada = t(GX.claro);
  const referencia = fmtPct(media);

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
        fill={t(RX.texto)}
      >
        {ponto.rotulo}
      </text>
    );
  };

  const legenda = [
    { cor: corAcima, texto: `Acima de ${referencia} (Prefeitura)` },
    { cor: corBase, texto: `${referencia} ou menos` },
    { cor: corSelecionada, texto: "Secretaria selecionada" },
  ];

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="min-h-[200px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={serie}
            margin={{ top: 20, right: 12, left: -16, bottom: 42 }}
            barCategoryGap="24%"
          >
            <CartesianGrid vertical={false} stroke={t(GX.cinzaClaro)} strokeDasharray="3 4" />
            <XAxis
              dataKey="curto"
              interval={0}
              angle={-32}
              textAnchor="end"
              height={58}
              tick={{ fontSize: 12, fill: t(RX.textoSec) }}
              tickLine={false}
              axisLine={{ stroke: t(GX.cinzaClaro) }}
            />
            <YAxis
              tickFormatter={(valor: number) => `${valor}%`}
              tick={{ fontSize: 12, fill: t(RX.textoSec) }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip cursor={{ fill: t(RX.trilho) }} content={<TooltipColuna />} />
            <Bar
              dataKey="valor"
              fill={corBase}
              radius={[4, 4, 0, 0]}
              onClick={(entrada: { cod?: string; payload?: { cod?: string } }) => {
                const cod = entrada?.cod ?? entrada?.payload?.cod;
                if (cod) onToggleSec(cod);
              }}
            >
              {serie.map((ponto) => (
                <Cell
                  key={ponto.cod}
                  fill={
                    ponto.selecionada ? corSelecionada : ponto.acima ? corAcima : corBase
                  }
                />
              ))}
              <LabelList dataKey="rotulo" content={rotulos} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
        {legenda.map((item) => (
          <li key={item.texto} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-3 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.cor }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground text-[11px] leading-snug">{item.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * B) Peso da regra em foco no volume de apontamentos de cada secretaria.
 *
 * Azul = vínculos atingidos pela regra em foco; cinza = demais regras.
 */
export function VolumeRegra({ lista, regra, sec, onToggleSec }: Props) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const serie = volumePorSecretaria(lista, regra, sec);
  const cor = t(GX.principal);

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
        fill={t(RX.texto)}
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
          <CartesianGrid vertical={false} stroke={t(GX.cinzaClaro)} strokeDasharray="3 4" />
          <XAxis
            dataKey="curto"
            interval={0}
            angle={-32}
            textAnchor="end"
            height={58}
            tick={{ fontSize: 12, fill: t(RX.textoSec) }}
            tickLine={false}
            axisLine={{ stroke: t(GX.cinzaClaro) }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: t(RX.textoSec) }}
            tickLine={false}
            axisLine={false}
            width={38}
          />
          <Tooltip cursor={{ fill: t(RX.trilho) }} content={<TooltipVolume />} />
          <Bar dataKey="foco" stackId="volume" fill={cor} />
          <Bar
            dataKey="demais"
            stackId="volume"
            fill={t(GX.cinza)}
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

/**
 * C) Ranking absoluto da regra em foco.
 *
 * Barra horizontal em azul, uma linha por secretaria, já ordenada da maior
 * para a menor — a leitura é o comprimento, não a cor. A selecionada usa o
 * azul escuro da paleta para se destacar do resto da lista.
 */
export function RankingCasos({ lista, regra, sec, onToggleSec }: Props) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const itens = rankingCasos(lista, regra, sec);
  const cor = t(GX.principal);
  // Destaque inverte no escuro: no claro ele é mais escuro, no escuro é mais claro.
  const corSelecionada = escuro ? GX.claro : GX.escuro;

  return (
    <ul className="mt-1 space-y-0.5">
      {itens.map((item) => (
        <li key={item.cod}>
          <button
            type="button"
            onClick={() => onToggleSec(item.cod)}
            aria-pressed={item.selecionada}
            className={cn(
              "focus-visible:outline-ring flex w-full flex-col gap-1 rounded-md px-1.5 py-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              item.selecionada ? "bg-accent" : "hover:bg-muted/60",
            )}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span
                className={cn(
                  "min-w-0 truncate text-[12px]",
                  item.selecionada
                    ? "text-foreground font-bold"
                    : "text-muted-foreground font-normal",
                )}
                title={item.curto}
              >
                {item.curto}
              </span>
              <span className="text-foreground shrink-0 text-[12px] font-semibold tabular-nums">
                {fmtNum(item.valor)}
              </span>
            </span>
            <span
              className="block h-1.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: t(GX.cinzaClaro) }}
            >
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max(item.largura, 2)}%`,
                  backgroundColor: item.selecionada ? corSelecionada : cor,
                }}
              />
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
  const escuro = useTemaEscuro();
  const cor = corNoTema(GX.principal, escuro);
  const rotulo = rotuloRegra(regra, cartoes);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <RxCard
        className="flex-1"
        bodyClassName="min-h-0"
        titulo={`${rotulo}: % dos vínculos por secretaria`}
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

      {/* 80/20 a partir de xl; em telas menores 20% espremeria o ranking */}
      <div className="grid flex-1 gap-3 lg:grid-cols-5">
        <div className="flex min-h-0 lg:col-span-3 xl:col-span-4">
          <RxCard
            className="h-full w-full"
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

        <div className="flex min-h-0 lg:col-span-2 xl:col-span-1">
          <RxCard
            className="h-full w-full"
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
            <div className="mt-2 flex items-start gap-1.5">
              <span
                className="mt-1 inline-block h-2 w-3.5 shrink-0 rounded-sm"
                style={{ backgroundColor: cor }}
              />
              <span className="text-muted-foreground text-[11px] leading-snug">
                Vínculos na regra em foco
              </span>
            </div>
          </RxCard>
        </div>
      </div>
    </div>
  );
}

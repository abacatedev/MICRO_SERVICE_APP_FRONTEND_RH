"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { RX } from "@/lib/raio-x/cores";
import {
  cargosDaSelecao,
  contarLocais,
  fatiasLocais,
  fatiasSecretarias,
  fatiasTipoVinculo,
  fmtNum,
  fmtPct,
  pct,
} from "@/lib/raio-x/calculos";
import type { Fatia, Secretaria } from "@/lib/raio-x/types";
import { RxCard } from "@/components/raio-x/rx-card";

function TooltipFatia({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Fatia; value?: number }[];
}) {
  if (!active || !payload?.length) return null;
  const fatia = payload[0].payload;

  return (
    <div
      className="rounded-md border bg-white px-2.5 py-2 shadow-md"
      style={{ borderColor: RX.borda }}
    >
      <p className="text-[13px] font-semibold" style={{ color: RX.texto }}>
        {fatia.label}
      </p>
      <p className="mt-0.5 text-[11.5px]" style={{ color: RX.textoSec }}>
        {fmtNum(fatia.value)} vínculos
      </p>
    </div>
  );
}

function Donut({
  fatias,
  tamanho,
  furo,
  centroRotulo,
  centroValor,
  destaqueCod,
  onSelect,
}: {
  fatias: Fatia[];
  tamanho: number;
  furo: number;
  centroRotulo: string;
  centroValor: string;
  destaqueCod?: string;
  onSelect?: (fatia: Fatia) => void;
}) {
  const raioInterno = (tamanho * furo) / 2;
  const raioExterno = tamanho / 2 - 2;

  return (
    <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<TooltipFatia />} />
          <Pie
            data={fatias}
            dataKey="value"
            nameKey="label"
            innerRadius={raioInterno}
            outerRadius={raioExterno}
            paddingAngle={1.5}
            stroke="#FFFFFF"
            strokeWidth={2}
            onClick={(_: unknown, index: number) => onSelect?.(fatias[index])}
          >
            {fatias.map((fatia) => (
              <Cell
                key={fatia.label}
                fill={fatia.color}
                stroke={fatia.cod && fatia.cod === destaqueCod ? RX.azulEscuro : "#FFFFFF"}
                strokeWidth={fatia.cod && fatia.cod === destaqueCod ? 2.5 : 2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span className="text-[10px]" style={{ color: RX.textoSec }}>
          {centroRotulo}
        </span>
        <span
          className="num-cond mt-0.5 text-[18px] leading-none"
          style={{ color: RX.azulEscuro }}
        >
          {centroValor}
        </span>
      </div>
    </div>
  );
}

function LegendaFatias({
  fatias,
  destaqueCod,
  onSelect,
}: {
  fatias: Fatia[];
  destaqueCod?: string;
  onSelect?: (fatia: Fatia) => void;
}) {
  const total = fatias.reduce((acc, f) => acc + f.value, 0);

  return (
    <ul className="min-w-0 flex-1 space-y-0.5">
      {fatias.map((fatia) => {
        const ativa = Boolean(fatia.cod && fatia.cod === destaqueCod);
        return (
          <li key={fatia.label}>
            <button
              type="button"
              disabled={!fatia.cod}
              onClick={() => onSelect?.(fatia)}
              className="flex w-full items-center gap-1.5 rounded px-1 py-[3px] text-left transition-colors disabled:cursor-default"
              style={{ backgroundColor: ativa ? RX.azulClaro : "transparent" }}
              title={fatia.label}
            >
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: fatia.color }}
              />
              <span
                className="min-w-0 flex-1 truncate text-[12px]"
                style={{ color: ativa ? RX.texto : RX.textoSec, fontWeight: ativa ? 700 : 400 }}
              >
                {fatia.label}
              </span>
              <span
                className="shrink-0 text-[12px] font-semibold tabular-nums"
                style={{ color: RX.texto }}
              >
                {fmtNum(fatia.value)}
              </span>
              <span
                className="w-9 shrink-0 text-right text-[12px] tabular-nums"
                style={{ color: RX.textoSec }}
              >
                {fmtPct(pct(fatia.value, total))}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function AbaQuadro({
  secretarias,
  alvo,
  sec,
  totalPrefeitura,
  locais,
  cargos,
  tipoVinculo,
  onToggleSec,
}: {
  secretarias: Secretaria[];
  alvo: Secretaria[];
  sec: string;
  totalPrefeitura: number;
  locais: Record<string, [string, number][]>;
  cargos: Record<string, [string, number][]>;
  tipoVinculo: [string, number][];
  onToggleSec: (cod: string) => void;
}) {
  const fatiasSec = fatiasSecretarias(secretarias);
  const fatiasLoc = fatiasLocais(alvo, locais);
  const listaCargos = cargosDaSelecao(alvo, cargos);
  const fatiasTipo = fatiasTipoVinculo(tipoVinculo);
  const selecionada = secretarias.find((s) => s.cod === sec);
  const qtdLocais = contarLocais(alvo, locais);
  const maiorCargo = listaCargos.length ? listaCargos[0].value : 1;

  const centroSecRotulo = selecionada ? "do quadro" : "Vínculos";
  const centroSecValor = selecionada
    ? fmtPct(pct(selecionada.vinc, totalPrefeitura))
    : fmtNum(totalPrefeitura);

  return (
    <div className="grid flex-1 gap-3 lg:grid-cols-2">
      <RxCard
        className="h-full"
        bodyClassName="justify-center"
        titulo="Vínculos por secretaria"
        subtitulo="Seis maiores + demais. Clique na legenda para abrir a secretaria."
      >
        <div className="flex items-center gap-3">
          <Donut
            fatias={fatiasSec}
            tamanho={160}
            furo={0.46}
            centroRotulo={centroSecRotulo}
            centroValor={centroSecValor}
            destaqueCod={selecionada?.cod}
            onSelect={(fatia) => fatia.cod && onToggleSec(fatia.cod)}
          />
          <LegendaFatias
            fatias={fatiasSec}
            destaqueCod={selecionada?.cod}
            onSelect={(fatia) => fatia.cod && onToggleSec(fatia.cod)}
          />
        </div>
      </RxCard>

      <RxCard
        className="h-full"
        bodyClassName="justify-center"
        titulo="Onde estão os servidores"
        subtitulo="Locais com 3 ou mais vínculos na seleção."
      >
        <div className="flex items-center gap-3">
          <Donut
            fatias={fatiasLoc}
            tamanho={160}
            furo={0.46}
            centroRotulo={qtdLocais === 1 ? "Local" : "Locais"}
            centroValor={fmtNum(qtdLocais)}
          />
          <LegendaFatias fatias={fatiasLoc} />
        </div>
      </RxCard>

      <RxCard
        className="h-full"
        bodyClassName="justify-center"
        titulo="Principais cargos"
        subtitulo="Até oito cargos com 5 ou mais vínculos na seleção."
      >
        {listaCargos.length === 0 ? (
          <p
            className="rounded-[6px] px-3 py-4 text-center text-[13px]"
            style={{ backgroundColor: RX.fundo, color: RX.textoSec }}
          >
            Nenhum cargo com 5 ou mais vínculos nesta secretaria.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {listaCargos.map((cargo) => (
              <li key={cargo.label} className="flex items-center gap-2">
                <span
                  className="w-[132px] shrink-0 truncate text-[12px]"
                  style={{ color: RX.textoSec }}
                  title={cargo.label}
                >
                  {cargo.label}
                </span>
                <span
                  className="h-2.5 flex-1 overflow-hidden rounded-full"
                  style={{ backgroundColor: RX.trilho }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max((cargo.value / maiorCargo) * 100, 2)}%`,
                      backgroundColor: RX.roxo,
                    }}
                  />
                </span>
                <span
                  className="w-9 shrink-0 text-right text-[12px] font-semibold tabular-nums"
                  style={{ color: RX.texto }}
                >
                  {fmtNum(cargo.value)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </RxCard>

      <RxCard
        className="h-full"
        bodyClassName="justify-center"
        titulo="Tipo de vínculo"
        subtitulo="Da seleção atual: Toda a Prefeitura soma as divisões pelo nome."
      >
        <div className="flex items-center gap-3">
          <Donut
            fatias={fatiasTipo}
            tamanho={140}
            furo={0.46}
            centroRotulo="Vínculos"
            centroValor={fmtNum(fatiasTipo.reduce((acc, fatia) => acc + fatia.value, 0))}
          />
          <LegendaFatias fatias={fatiasTipo} />
        </div>
      </RxCard>
    </div>
  );
}

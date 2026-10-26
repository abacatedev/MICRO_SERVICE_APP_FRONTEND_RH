"use client";

import { cn } from "@/lib/utils";
import { RX, corNoTema } from "@/lib/raio-x/cores";
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
import { useTemaEscuro } from "@/lib/raio-x/tema";
import type { Fatia, Secretaria } from "@/lib/raio-x/types";
import { Donut } from "@/components/raio-x/donut";
import { RxCard } from "@/components/raio-x/rx-card";

function LegendaFatias({
  fatias,
  destaqueCod,
  onSelect,
}: {
  fatias: Fatia[];
  destaqueCod?: string;
  onSelect?: (fatia: Fatia) => void;
}) {
  const escuro = useTemaEscuro();
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
              className={cn(
                "flex w-full items-center gap-1.5 rounded px-1 py-[3px] text-left transition-colors disabled:cursor-default",
                ativa ? "bg-accent" : fatia.cod && "hover:bg-muted/60",
              )}
              title={fatia.label}
            >
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: corNoTema(fatia.color, escuro) }}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[12px]",
                  ativa ? "text-foreground font-bold" : "text-muted-foreground font-normal",
                )}
              >
                {fatia.label}
              </span>
              <span className="text-foreground shrink-0 text-[12px] font-semibold tabular-nums">
                {fmtNum(fatia.value)}
              </span>
              <span className="text-muted-foreground w-9 shrink-0 text-right text-[12px] tabular-nums">
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
  const escuro = useTemaEscuro();

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
          <p className="bg-muted text-muted-foreground rounded-[6px] px-3 py-4 text-center text-[13px]">
            Nenhum cargo com 5 ou mais vínculos nesta secretaria.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {listaCargos.map((cargo) => (
              <li key={cargo.label} className="flex items-center gap-2">
                <span
                  className="text-muted-foreground w-[132px] shrink-0 truncate text-[12px]"
                  title={cargo.label}
                >
                  {cargo.label}
                </span>
                <span className="bg-muted h-2.5 flex-1 overflow-hidden rounded-full">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max((cargo.value / maiorCargo) * 100, 2)}%`,
                      backgroundColor: corNoTema(RX.roxo, escuro),
                    }}
                  />
                </span>
                <span className="text-foreground w-9 shrink-0 text-right text-[12px] font-semibold tabular-nums">
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

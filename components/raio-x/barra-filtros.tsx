"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/raio-x/calculos";
import type { MinVinc, Secretaria } from "@/lib/raio-x/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPCOES_MIN: { valor: MinVinc; rotulo: string }[] = [
  { valor: 1, rotulo: "Todas" },
  { valor: 30, rotulo: "30 ou mais vínculos" },
  { valor: 100, rotulo: "100 ou mais vínculos" },
];

/**
 * Filtros do Raio-X, numa barra horizontal no topo — acima das abas, visível em
 * todas elas.
 *
 * Antes eram uma coluna de 290px à esquerda, e essa largura era descontada de
 * todas as abas. Os cards de pendência saíram daqui: eles não filtram nada, são
 * o seletor da aba Pendência, e agora vivem lá dentro (`painel-pendencias.tsx`).
 */
export function BarraFiltros({
  secretarias,
  sec,
  minVinc,
  totalPrefeitura,
  temFiltro,
  onSec,
  onMin,
  onLimpar,
}: {
  secretarias: Secretaria[];
  sec: string;
  minVinc: MinVinc;
  totalPrefeitura: number;
  /** Filtro diferente do padrão: mostra o atalho de limpar. */
  temFiltro: boolean;
  onSec: (valor: string) => void;
  onMin: (valor: MinVinc) => void;
  onLimpar: () => void;
}) {
  return (
    <div className="border-border bg-card flex flex-wrap items-start gap-x-6 gap-y-3 rounded-[10px] border px-3.5 py-3">
      <div className="min-w-[200px] flex-1 sm:max-w-[320px]">
        <label htmlFor="rx-secretaria" className="text-muted-foreground text-[12px] font-semibold">
          Secretaria
        </label>
        {/* O trigger do Select já usa `bg-card`/`text-foreground`; aqui só
            fixamos altura e raio do guia visual. */}
        <Select value={sec} onValueChange={onSec}>
          <SelectTrigger
            id="rx-secretaria"
            className="mt-1.5 h-11 w-full rounded-[6px] text-[14px] font-semibold"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toda a Prefeitura ({fmtNum(totalPrefeitura)})</SelectItem>
            {secretarias.map((s) => (
              <SelectItem key={s.cod} value={s.cod}>
                {s.curto} ({fmtNum(s.vinc)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[240px] flex-1">
        <p className="text-muted-foreground text-[12px] font-semibold">Mostrar secretarias com</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Mínimo de vínculos">
          {OPCOES_MIN.map((opcao) => {
            const ativa = minVinc === opcao.valor;
            return (
              <button
                key={opcao.valor}
                type="button"
                aria-pressed={ativa}
                onClick={() => onMin(opcao.valor)}
                className={cn(
                  "h-8 rounded-full border px-2.5 text-[12px] font-medium transition-colors",
                  "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                  ativa
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-foreground hover:bg-muted",
                )}
              >
                {opcao.rotulo}
              </button>
            );
          })}
        </div>

        {/* Logo abaixo dos chips que ele limpa, não no rodapé da página. */}
        {temFiltro && (
          <button
            type="button"
            onClick={onLimpar}
            className="text-primary focus-visible:outline-ring mt-2 inline-flex items-center gap-1 text-[12px] font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="size-3" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

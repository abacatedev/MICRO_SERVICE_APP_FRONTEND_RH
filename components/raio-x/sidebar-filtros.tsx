"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { RX } from "@/lib/raio-x/cores";
import { fmtNum, podeLimpar } from "@/lib/raio-x/calculos";
import type { MinVinc, RegraDef, RegraId, Secretaria, Totais } from "@/lib/raio-x/types";
import { RegraCard } from "@/components/raio-x/regra-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPCOES_MIN: { valor: MinVinc; rotulo: string }[] = [
  { valor: 1, rotulo: "Todas" },
  { valor: 30, rotulo: "30+ vínculos" },
  { valor: 100, rotulo: "100+ vínculos" },
];

export function SidebarFiltros({
  secretarias,
  cartoes,
  sec,
  regra,
  minVinc,
  valores,
  totalPrefeitura,
  onSec,
  onRegra,
  onMin,
  onLimpar,
}: {
  secretarias: Secretaria[];
  cartoes: RegraDef[];
  sec: string;
  regra: RegraId;
  minVinc: MinVinc;
  valores: Totais;
  totalPrefeitura: number;
  onSec: (valor: string) => void;
  onRegra: (valor: RegraId) => void;
  onMin: (valor: MinVinc) => void;
  onLimpar: () => void;
}) {
  const regraPadrao = cartoes.find((item) => item.critica)?.id ?? cartoes[0]?.id ?? "cert";
  const filtroSujo = podeLimpar({ sec, regra, minVinc, aba: "regra" }, regraPadrao);

  return (
    <aside className="flex flex-col gap-3">
      <div
        className="flex flex-1 flex-col rounded-[10px] border bg-white p-3.5"
        style={{ borderColor: RX.borda }}
      >
        <label
          htmlFor="rx-secretaria"
          className="text-[12px] font-semibold"
          style={{ color: RX.textoSec }}
        >
          Secretaria
        </label>
        <Select value={sec} onValueChange={onSec}>
          <SelectTrigger
            id="rx-secretaria"
            className="mt-1.5 w-full text-[14px] font-semibold"
            style={{ borderColor: RX.entrada, height: 44, borderRadius: 6 }}
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

        <p className="mt-3.5 text-[12px] font-semibold" style={{ color: RX.textoSec }}>
          Comparar secretarias com
        </p>
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
                  "focus-visible:outline-2 focus-visible:outline-offset-2",
                )}
                style={{
                  borderColor: ativa ? RX.azul : RX.entrada,
                  backgroundColor: ativa ? RX.azul : "#FFFFFF",
                  color: ativa ? "#FFFFFF" : RX.texto,
                  outlineColor: RX.azul,
                }}
              >
                {opcao.rotulo}
              </button>
            );
          })}
        </div>

        <p className="mt-3.5 text-[12px] font-semibold" style={{ color: RX.textoSec }}>
          Regra em foco
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {cartoes.map((item) => (
            <RegraCard
              key={item.id}
              regra={item}
              valor={valores[item.id]}
              selecionada={regra === item.id}
              onSelect={() => onRegra(item.id)}
            />
          ))}
        </div>

        {filtroSujo && (
          <button
            type="button"
            onClick={onLimpar}
            className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: RX.azul, outlineColor: RX.azul }}
          >
            <X className="size-3" />
            Limpar filtros
          </button>
        )}
      </div>
    </aside>
  );
}

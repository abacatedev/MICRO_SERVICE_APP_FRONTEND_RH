"use client";

import { cn } from "@/lib/utils";
import { RX } from "@/lib/raio-x/cores";
import { fmtNum } from "@/lib/raio-x/calculos";
import type { RegraDef } from "@/lib/raio-x/types";

/** Card de regra da sidebar — único seletor de regra da tela. */
export function RegraCard({
  regra,
  valor,
  selecionada,
  onSelect,
}: {
  regra: RegraDef;
  valor: number;
  selecionada: boolean;
  onSelect: () => void;
}) {
  const cor = regra.critica ? RX.critico : RX.azul;

  return (
    <button
      type="button"
      aria-pressed={selecionada}
      aria-label={`${regra.label}: ${fmtNum(valor)} vínculos${regra.critica ? ", regra crítica" : ""}`}
      onClick={onSelect}
      className={cn(
        "flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-[10px] border px-2 py-2 text-center transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        regra.critica && "col-span-2",
      )}
      style={{
        borderColor: selecionada ? cor : regra.critica ? RX.criticoBorda : RX.borda,
        backgroundColor: selecionada ? (regra.critica ? RX.criticoBg : RX.azulSuave) : "#FFFFFF",
        boxShadow: selecionada ? `inset 0 0 0 1px ${cor}` : undefined,
        outlineColor: RX.azul,
      }}
    >
      <span
        className="text-[11px] leading-[1.25] font-semibold"
        style={{ color: regra.critica ? RX.critico : RX.rotulo }}
      >
        {regra.label}
      </span>

      {regra.critica && (
        <span
          className="rounded-full px-1.5 py-[1px] text-[11px] font-bold tracking-[0.04em] uppercase"
          style={{ backgroundColor: RX.critico, color: "#FFFFFF" }}
        >
          Crítica
        </span>
      )}

      <span
        className="num-cond text-[22px] leading-none"
        style={{ color: regra.critica ? RX.critico : RX.azulEscuro }}
      >
        {fmtNum(valor)}
      </span>
    </button>
  );
}

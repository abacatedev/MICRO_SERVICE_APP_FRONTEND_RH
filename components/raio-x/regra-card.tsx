"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/raio-x/calculos";
import type { RegraDef } from "@/lib/raio-x/types";

/**
 * Card de regra da coluna de pendências — único seletor de regra da tela.
 *
 * A coluna existe só na aba Pendência (`painel-pendencias.tsx`): nas outras
 * três abas o conteúdo usa a largura inteira.
 *
 * O card da regra crítica tem o **mesmo tratamento** dos demais: mesma borda,
 * mesmo fundo, mesmo rótulo e mesmo número. Antes ele era vermelho de ponta a
 * ponta e virava o elemento mais chamativo da tela, competindo com a leitura
 * dos números. O que distingue a regra crítica agora é a largura (ocupa duas
 * colunas) e um selo neutro no canto — a hierarquia vem do desenho, não da cor.
 *
 * Estados com token: `bg-accent`/`border-primary` quando selecionada, e o anel
 * interno é `border-2` (não `boxShadow` inline, que ignorava o tema).
 */
export function RegraCard({
  regra,
  rotulo,
  valor,
  selecionada,
  onSelect,
}: {
  regra: RegraDef;
  /** Rótulo curto que cabe no card (`ROTULO_CARD`); `regra.label` é o nome longo da API. */
  rotulo: string;
  valor: number;
  selecionada: boolean;
  onSelect: () => void;
}) {
  const critica = Boolean(regra.critica);

  return (
    <button
      type="button"
      aria-pressed={selecionada}
      aria-label={`${rotulo}: ${fmtNum(valor)} vínculos${critica ? ", regra crítica" : ""}`}
      onClick={onSelect}
      className={cn(
        // `relative` existe para o selo de crítica: ele fica ancorado no canto e
        // **fora do fluxo**, senão ocupava uma linha própria e esse card ficava
        // ~7px mais alto que os outros seis.
        "relative flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-center transition-colors",
        "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
        critica && "col-span-2",
        selecionada
          ? "border-primary bg-accent border-2"
          : "border-border bg-card hover:bg-muted border",
      )}
    >
      {critica && (
        <span className="border-border text-muted-foreground absolute top-1.5 right-1.5 rounded-full border px-1.5 py-[1px] text-[9px] leading-none font-semibold tracking-[0.04em] uppercase">
          Crítica
        </span>
      )}

      <span className="text-muted-foreground text-[11px] leading-[1.25] font-semibold">
        {rotulo}
      </span>

      <span className="num-cond text-foreground text-[22px] leading-none">{fmtNum(valor)}</span>

      <Link
        href={`/relatorios?r=diagnostico-regra&regra=${encodeURIComponent(regra.id)}`}
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-foreground absolute bottom-1 right-1.5 text-[9px] underline"
      >
        Relatório
      </Link>
    </button>
  );
}

"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, totaisDe } from "@/lib/raio-x/calculos";
import { corNoTema } from "@/lib/raio-x/cores";
import { COR_CARD, ORDEM_CARDS, ROTULO_CARD } from "@/lib/raio-x/regras";
import { useTemaEscuro } from "@/lib/raio-x/tema";
import type { RegraId, Secretaria, Totais } from "@/lib/raio-x/types";

/** Colunas que não são uma pendência: não têm cor nem atalho para a aba 4. */
type ChaveFixa = "curto" | "vinc" | "deps" | "confP5";
type SortKey = ChaveFixa | RegraId;

/**
 * Colunas do Comparativo, na **ordem dos cards** (`ORDEM_CARDS`) e com o
 * **nome curto** do card (`ROTULO_CARD`) — é o mesmo vocabulário dos gráficos
 * acima, para a tabela não chamar de "Certidão" o que o gráfico chama de "Sem
 * certidão".
 *
 * `regra` marca as colunas que são uma pendência: o título delas abre a aba
 * Pendência com aquela regra em foco, e o cabeçalho ganha a cor da pendência.
 * As demais (nome, vínculos, dependentes, % conforme) não têm pendência por
 * trás.
 */
const COLUNAS: { key: SortKey; label: string; largura?: string; regra?: RegraId }[] = [
  { key: "curto", label: "Secretaria", largura: "w-[190px]" },
  { key: "vinc", label: "Vínculos", largura: "w-[72px]" },
  { key: "deps", label: "Dependentes", largura: "w-[88px]" },
  ...ORDEM_CARDS.map((id) => ({
    key: id,
    label: ROTULO_CARD[id],
    largura: "w-[88px]",
    regra: id,
  })),
  { key: "confP5", label: "% conforme", largura: "w-[84px]" },
];

/**
 * Dica do "% conforme".
 *
 * O número vem pronto da API (`LinhaDivisao.conformidade`, "% sem pendência");
 * o front não recalcula. Dizer isso evita a leitura errada de que é a média
 * das sete colunas ao lado.
 */
const DICA_CONFORME =
  "% dos vínculos da secretaria sem nenhuma pendência do diagnóstico. " +
  "Vem do campo `conformidade` da API (vínculos sem pendência ÷ vínculos), " +
  "não é a média das colunas ao lado.";

/**
 * Tabela da aba Comparativo.
 *
 * As linhas divisórias eram `boxShadow` inline com hex fixo — no escuro isso
 * virava uma grade branca. Agora é `inset` com `var(--border)`, que acompanha
 * o tema sem precisar de JS.
 */
export function TabelaSecretarias({
  lista,
  sec,
  onToggleSec,
  onAbrirPendencia,
}: {
  lista: Secretaria[];
  sec: string;
  onToggleSec: (cod: string) => void;
  /** Clique no título de uma coluna de pendência: abre a aba Pendência nela. */
  onAbrirPendencia: (regra: RegraId) => void;
}) {
  const escuro = useTemaEscuro();
  const [ordem, setOrdem] = React.useState<{ chave: SortKey; dir: "asc" | "desc" }>({
    chave: "vinc",
    dir: "desc",
  });

  const ordenada = React.useMemo(() => {
    const copia = [...lista];
    copia.sort((a, b) => {
      const va = a[ordem.chave];
      const vb = b[ordem.chave];
      const comparacao =
        typeof va === "string" && typeof vb === "string"
          ? va.localeCompare(vb, "pt-BR")
          : Number(va) - Number(vb);
      return ordem.dir === "asc" ? comparacao : -comparacao;
    });
    return copia;
  }, [lista, ordem]);

  const totais = React.useMemo(() => totaisDe(lista), [lista]);

  /**
   * Total do rodapé por coluna. `curto` e `confP5` não têm soma: nome não soma,
   * e a conformidade da Prefeitura não é a soma das conformidades (seria
   * preciso ponderar por vínculos, e a API já tem essa linha pronta).
   */
  const valorDoTotal = (chave: SortKey): string => {
    if (chave === "curto" || chave === "confP5") return "";
    const chaveDeTotais: keyof Totais = chave;
    return fmtNum(totais[chaveDeTotais]);
  };

  const alternarOrdem = (chave: SortKey) => {
    setOrdem((atual) =>
      atual.chave === chave
        ? { chave, dir: atual.dir === "asc" ? "desc" : "asc" }
        : { chave, dir: chave === "curto" ? "asc" : "desc" },
    );
  };

  return (
    <div className="border-border bg-card rounded-[10px] border">
      <div className="max-h-[calc(100vh-260px)] overflow-auto">
        <table
          className="w-full min-w-[1080px] text-[13px]"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead className="sticky top-0 z-10">
            <tr>
              {COLUNAS.map((coluna, indice) => {
                const ativa = ordem.chave === coluna.key;
                const Icone = ativa ? (ordem.dir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
                // Const local para o `onClick` manter o tipo estreito.
                const regraDaColuna = coluna.regra;
                return (
                  <th
                    key={coluna.key}
                    scope="col"
                    aria-sort={
                      ativa ? (ordem.dir === "asc" ? "ascending" : "descending") : "none"
                    }
                    className={cn(
                      "bg-card text-muted-foreground px-2 py-[7px] text-left align-bottom text-[11px] font-semibold tracking-[0.04em] uppercase",
                      // Nome de pendência é longo: quebra em duas ou três linhas
                      // em vez de esticar a tabela ou cortar o texto.
                      regraDaColuna ? "whitespace-normal" : "whitespace-nowrap",
                      "shadow-[inset_0_-2px_0_var(--border)]",
                      indice > 0 && "text-right",
                      coluna.largura,
                    )}
                  >
                    {/*
                      Dois alvos: o título abre a pendência (só nas colunas que
                      são uma regra) e a seta ordena. Antes o `<th>` inteiro
                      ordenava; manter isso e acrescentar o atalho no título
                      tornaria o clique ambíguo.
                    */}
                    <div
                      className={cn(
                        "flex items-start gap-1",
                        indice > 0 && "justify-end",
                      )}
                    >
                      {regraDaColuna && (
                        <span
                          className="mt-[3px] inline-block size-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: corNoTema(COR_CARD[regraDaColuna], escuro) }}
                          aria-hidden="true"
                        />
                      )}
                      {regraDaColuna ? (
                        <button
                          type="button"
                          onClick={() => onAbrirPendencia(regraDaColuna)}
                          title={`Abrir a pendência "${coluna.label}"`}
                          className="focus-visible:outline-ring min-w-0 leading-[1.2] text-inherit underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          {coluna.label}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            "min-w-0 leading-[1.2]",
                            coluna.key === "confP5" &&
                              "cursor-help underline decoration-dotted underline-offset-2",
                          )}
                          title={coluna.key === "confP5" ? DICA_CONFORME : undefined}
                        >
                          {coluna.label}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => alternarOrdem(coluna.key)}
                        aria-label={`Ordenar por ${coluna.label}`}
                        title={`Ordenar por ${coluna.label}`}
                        className="focus-visible:outline-ring -m-1 shrink-0 rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        <Icone className="size-3 opacity-60" />
                      </button>
                    </div>
                  </th>
                );
              })}
              <th
                scope="col"
                className="bg-card shadow-[inset_0_-2px_0_var(--border)] w-[64px] px-2 py-[7px]"
              >
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {ordenada.map((s) => {
              const selecionada = s.cod === sec;
              return (
                <tr
                  key={s.cod}
                  onClick={() => onToggleSec(s.cod)}
                  className={cn(
                    "cursor-pointer transition-colors shadow-[inset_0_-1px_0_var(--border)]",
                    selecionada ? "bg-accent" : "hover:bg-muted/50",
                  )}
                >
                  <td className="px-2 py-[7px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-foreground",
                          selecionada ? "font-bold" : "font-medium",
                        )}
                      >
                        {s.curto}
                      </span>
                      {s.lotSetor > 0 && (
                        <span
                          className="text-warning text-[11px] font-semibold whitespace-nowrap"
                          title={`${fmtNum(s.lotSetor)} vínculos com subdivisão errada`}
                        >
                          subdivisão errada
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-foreground px-2 py-[7px] text-right tabular-nums">
                    {fmtNum(s.vinc)}
                  </td>
                  <td className="text-muted-foreground px-2 py-[7px] text-right tabular-nums">
                    {fmtNum(s.deps)}
                  </td>
                  {ORDEM_CARDS.map((regra) => (
                    <td
                      key={regra}
                      className="text-foreground px-2 py-[7px] text-right tabular-nums"
                    >
                      {fmtNum(s[regra])}
                    </td>
                  ))}
                  <td
                    className="text-foreground px-2 py-[7px] text-right tabular-nums"
                    title={
                      s.confP5 === 0 && s.lotSetor > 0
                        ? "Não calculado: subdivisão errada impede o cruzamento"
                        : undefined
                    }
                  >
                    {s.confP5 === 0 && s.lotSetor > 0 ? "—" : fmtPct(s.confP5)}
                  </td>
                  <td className="px-2 py-[7px] text-right">
                    <span className="border-primary text-primary inline-flex h-[30px] items-center rounded-full border px-2.5 text-[12px] font-semibold">
                      {selecionada ? "Fechar" : "Abrir"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="bg-muted">
              <td className="text-muted-foreground px-2 py-2 text-[11px] font-semibold tracking-[0.05em] uppercase">
                Total ({ordenada.length} secretarias)
              </td>
              {COLUNAS.slice(1).map((coluna) => (
                <td
                  key={coluna.key}
                  className="text-foreground px-2 py-2 text-right font-semibold tabular-nums"
                >
                  {valorDoTotal(coluna.key)}
                </td>
              ))}
              <td className="px-2 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

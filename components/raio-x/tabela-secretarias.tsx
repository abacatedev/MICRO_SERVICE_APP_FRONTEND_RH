"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { RX } from "@/lib/raio-x/cores";
import { fmtNum, fmtPct, totaisDe } from "@/lib/raio-x/calculos";
import type { Secretaria } from "@/lib/raio-x/types";

type SortKey =
  | "curto"
  | "vinc"
  | "deps"
  | "irrf"
  | "salfam"
  | "depCpf"
  | "cert"
  | "semEmail"
  | "confP5";

const COLUNAS: { key: SortKey; label: string; critica?: boolean; largura?: string }[] = [
  { key: "curto", label: "Secretaria", largura: "w-[220px]" },
  { key: "vinc", label: "Vínculos" },
  { key: "deps", label: "Dependentes" },
  { key: "irrf", label: "IRRF idade" },
  { key: "salfam", label: "Sal.-família" },
  { key: "depCpf", label: "Dep. sem CPF" },
  { key: "cert", label: "Certidão", critica: true },
  { key: "semEmail", label: "Sem e-mail" },
  { key: "confP5", label: "Conformidade P5" },
];

export function TabelaSecretarias({
  lista,
  sec,
  onToggleSec,
}: {
  lista: Secretaria[];
  sec: string;
  onToggleSec: (cod: string) => void;
}) {
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

  const alternarOrdem = (chave: SortKey) => {
    setOrdem((atual) =>
      atual.chave === chave
        ? { chave, dir: atual.dir === "asc" ? "desc" : "asc" }
        : { chave, dir: chave === "curto" ? "asc" : "desc" },
    );
  };

  return (
    <div className="rounded-[10px] border bg-white" style={{ borderColor: RX.borda }}>
      <div className="max-h-[calc(100vh-200px)] overflow-auto">
        <table
          className="w-full min-w-[880px] text-[13px]"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead className="sticky top-0 z-10">
            <tr>
              {COLUNAS.map((coluna, indice) => {
                const ativa = ordem.chave === coluna.key;
                const Icone = ativa ? (ordem.dir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
                return (
                  <th
                    key={coluna.key}
                    scope="col"
                    aria-sort={
                      ativa ? (ordem.dir === "asc" ? "ascending" : "descending") : "none"
                    }
                    className={`bg-white px-2 py-[7px] text-left text-[11px] font-semibold tracking-[0.04em] uppercase whitespace-nowrap ${
                      indice > 0 ? "text-right" : ""
                    } ${coluna.largura ?? ""}`}
                    style={{
                      color: coluna.critica ? RX.critico : RX.textoSec,
                      boxShadow: `inset 0 -2px 0 ${RX.borda}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => alternarOrdem(coluna.key)}
                      className={`inline-flex items-center gap-1 ${
                        indice > 0 ? "w-full justify-end" : ""
                      }`}
                      style={{ color: "inherit" }}
                    >
                      {coluna.label}
                      <Icone className="size-3 opacity-60" />
                    </button>
                  </th>
                );
              })}
              <th
                scope="col"
                className="bg-white px-2 py-[7px]"
                style={{ boxShadow: `inset 0 -2px 0 ${RX.borda}` }}
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
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selecionada ? RX.azulClaro : "transparent",
                    boxShadow: `inset 0 -1px 0 ${RX.bordaSuave}`,
                  }}
                >
                  <td className="px-2 py-[7px]">
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: RX.texto, fontWeight: selecionada ? 700 : 500 }}>
                        {s.curto}
                      </span>
                      {s.lotSetor > 0 && (
                        <span
                          className="text-[11px] font-semibold whitespace-nowrap"
                          style={{ color: RX.ambar }}
                          title={`${fmtNum(s.lotSetor)} vínculos com subdivisão errada`}
                        >
                          subdivisão errada
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-[7px] text-right tabular-nums" style={{ color: RX.texto }}>
                    {fmtNum(s.vinc)}
                  </td>
                  <td
                    className="px-2 py-[7px] text-right tabular-nums"
                    style={{ color: RX.textoSec }}
                  >
                    {fmtNum(s.deps)}
                  </td>
                  <td className="px-2 py-[7px] text-right tabular-nums" style={{ color: RX.texto }}>
                    {fmtNum(s.irrf)}
                  </td>
                  <td className="px-2 py-[7px] text-right tabular-nums" style={{ color: RX.texto }}>
                    {fmtNum(s.salfam)}
                  </td>
                  <td className="px-2 py-[7px] text-right tabular-nums" style={{ color: RX.texto }}>
                    {fmtNum(s.depCpf)}
                  </td>
                  <td
                    className="px-2 py-[7px] text-right font-semibold tabular-nums"
                    style={{ color: RX.critico }}
                  >
                    {fmtNum(s.cert)}
                  </td>
                  <td className="px-2 py-[7px] text-right tabular-nums" style={{ color: RX.texto }}>
                    {fmtNum(s.semEmail)}
                  </td>
                  <td
                    className="px-2 py-[7px] text-right tabular-nums"
                    style={{ color: RX.texto }}
                    title={
                      s.confP5 === 0 && s.lotSetor > 0
                        ? "Não calculado: subdivisão errada impede o cruzamento"
                        : undefined
                    }
                  >
                    {s.confP5 === 0 && s.lotSetor > 0 ? "—" : fmtPct(s.confP5)}
                  </td>
                  <td className="px-2 py-[7px] text-right">
                    <span
                      className="inline-flex h-[30px] items-center rounded-full border px-2.5 text-[12px] font-semibold"
                      style={{ borderColor: RX.azul, color: RX.azul }}
                    >
                      {selecionada ? "Fechar" : "Abrir"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr style={{ backgroundColor: RX.fundo }}>
              <td
                className="px-2 py-2 text-[11px] font-semibold tracking-[0.05em] uppercase"
                style={{ color: RX.textoSec }}
              >
                Total ({ordenada.length} secretarias)
              </td>
              <td
                className="px-2 py-2 text-right font-semibold tabular-nums"
                style={{ color: RX.texto }}
              >
                {fmtNum(totais.vinc)}
              </td>
              <td
                className="px-2 py-2 text-right font-semibold tabular-nums"
                style={{ color: RX.texto }}
              >
                {fmtNum(totais.deps)}
              </td>
              <td
                className="px-2 py-2 text-right font-semibold tabular-nums"
                style={{ color: RX.texto }}
              >
                {fmtNum(totais.irrf)}
              </td>
              <td
                className="px-2 py-2 text-right font-semibold tabular-nums"
                style={{ color: RX.texto }}
              >
                {fmtNum(totais.salfam)}
              </td>
              <td
                className="px-2 py-2 text-right font-semibold tabular-nums"
                style={{ color: RX.texto }}
              >
                {fmtNum(totais.depCpf)}
              </td>
              <td
                className="px-2 py-2 text-right font-semibold tabular-nums"
                style={{ color: RX.critico }}
              >
                {fmtNum(totais.cert)}
              </td>
              <td
                className="px-2 py-2 text-right font-semibold tabular-nums"
                style={{ color: RX.texto }}
              >
                {fmtNum(totais.semEmail)}
              </td>
              <td className="px-2 py-2" />
              <td className="px-2 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

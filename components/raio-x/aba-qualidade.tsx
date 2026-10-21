"use client";

import { RX } from "@/lib/raio-x/cores";
import { categoriasQualidade, fmtNum } from "@/lib/raio-x/calculos";
import type { Alerta, Secretaria } from "@/lib/raio-x/types";
import { RxCard } from "@/components/raio-x/rx-card";

const FAIXAS = ["0-13", "14-17", "18-20", "21-23", "24-29", "30-39", "40+", "Sem data"];

/** Alturas apenas visuais: os dados da consulta 03 ainda não existem. */
const PLACEHOLDER = [22, 30, 26, 34, 40, 32, 24, 16];
const LARANJA = new Set(["21-23", "24-29", "30-39", "40+"]);

export function AbaQualidade({
  alvo,
  pisFicticio,
  alertas,
}: {
  alvo: Secretaria[];
  pisFicticio: Record<string, number>;
  alertas: Alerta[];
}) {
  const categorias = categoriasQualidade(alvo, pisFicticio);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <RxCard
        titulo="Inconsistências por categoria"
        subtitulo="Cada vínculo é contado uma vez por regra; um vínculo pode aparecer em mais de uma categoria."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {categorias.map((categoria) => (
            <div
              key={categoria.label}
              className="rounded-[8px] border px-2.5 py-2"
              style={{ borderColor: RX.borda }}
            >
              <span
                className="block h-[3px] w-8 rounded-full"
                style={{ backgroundColor: categoria.color }}
              />
              <p
                className="num-cond mt-2 text-[22px] leading-none"
                style={{ color: categoria.color }}
              >
                {fmtNum(categoria.value)}
              </p>
              <p className="mt-1.5 text-[13px] font-semibold" style={{ color: RX.texto }}>
                {categoria.label}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug" style={{ color: RX.textoSec }}>
                {categoria.detalhe}
              </p>
            </div>
          ))}
        </div>
      </RxCard>

      <RxCard
        titulo="Faixa etária dos dependentes em desconformidade"
        subtitulo="Faixas de 21-23 anos em diante aparecem em laranja por exigirem comprovação."
      >
        <div className="relative">
          <div className="grid grid-cols-4 items-end gap-2 sm:grid-cols-8" style={{ height: 112 }}>
            {FAIXAS.map((faixa, indice) => (
              <div key={faixa} className="flex h-full flex-col justify-end">
                <div
                  className="w-full rounded-t-[4px]"
                  style={{
                    height: `${PLACEHOLDER[indice]}%`,
                    backgroundColor: RX.bordaSuave,
                  }}
                />
                <span
                  className="mt-1 text-center text-[12px]"
                  style={{
                    color: LARANJA.has(faixa) ? RX.laranja : RX.textoSec,
                    fontWeight: LARANJA.has(faixa) ? 600 : 400,
                  }}
                >
                  {faixa}
                </span>
              </div>
            ))}
          </div>

          <p
            className="mt-2 rounded-[8px] border border-dashed px-3 py-2 text-center text-[12px]"
            style={{ borderColor: RX.tracejado, color: RX.textoSec, backgroundColor: "#FFFFFF" }}
          >
            Aguardando a consulta <strong>03_faixa_dependentes.sql</strong> — sem dados, as
            colunas acima são apenas a estrutura do gráfico.
          </p>
        </div>
      </RxCard>

      <RxCard
        titulo="Outras regras do diagnóstico"
        subtitulo="Regras que não entram nos sete cartões, contadas na seleção atual."
      >
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {alertas.map((alerta) => (
            <div
              key={alerta.t}
              className="rounded-[8px] border px-2.5 py-2.5"
              style={{ borderColor: RX.borda }}
            >
              <p className="num-cond text-[20px] leading-none" style={{ color: RX.ambar }}>
                {alerta.n}
              </p>
              <p className="mt-1.5 text-[12px] leading-snug font-medium" style={{ color: RX.texto }}>
                {alerta.t}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug" style={{ color: RX.textoSec }}>
                {alerta.d}
              </p>
            </div>
          ))}
        </div>
      </RxCard>
    </div>
  );
}

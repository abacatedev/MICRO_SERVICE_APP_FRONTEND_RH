"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RX, corNoTema } from "@/lib/raio-x/cores";
import { useTemaEscuro } from "@/lib/raio-x/tema";
import { fmtNum, fmtPct, dataBR } from "@/lib/afastamentos/formato";
import type { Gerencial } from "@/lib/afastamentos/tipos";

function TooltipBar({ active, payload }: { active?: boolean; payload?: { payload: { label: string; value: number } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{p.label}</p>
      <p className="text-muted-foreground text-[11.5px]">{fmtNum(p.value)}</p>
    </div>
  );
}

/** Sparkline: linha pequena sem eixos, só a linha e o último ponto. */
function Sparkline({ data, mesIncompleto }: { data: { label: string; value: number }[]; mesIncompleto: boolean }) {
  const escuro = useTemaEscuro();
  const t = (c: string) => corNoTema(c, escuro);

  return (
    <div className="h-[60px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={t(RX.azul)}
            strokeWidth={2}
            dot={{ r: 2, fill: t(RX.azul) }}
            activeDot={{ r: 4 }}
          />
          {mesIncompleto && (
            <Tooltip
              content={() => (
                <div className="border-border bg-popover rounded-md border px-2 py-1 shadow-md">
                  <p className="text-[11px]">Último mês incompleto</p>
                </div>
              )}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Nome curto de tipo: trunca em 36 caracteres. */
function nomeCurtoTipo(nome: string): string {
  if (nome.length <= 38) return nome;
  return nome.slice(0, 35) + "…";
}

export function CardAfastamentosResumo({ dados }: { dados: Gerencial | null }) {
  const escuro = useTemaEscuro();
  const t = (c: string) => corNoTema(c, escuro);

  if (!dados) {
    return (
      <div className="border-border bg-card flex flex-col gap-4 rounded-[10px] border p-5">
        <p className="text-muted-foreground text-[13px]">Carregando…</p>
      </div>
    );
  }

  const afastados = dados.afastados_na_data?.vinculos ?? 0;
  const retornos = dados.retornos_em_7_dias?.total ?? 0;
  const emendas = dados.retornos_em_7_dias?.emendam_outro_afastamento ?? 0;
  const absenteismoPct = dados.absenteismo_mes?.total?.percentual_dias_afastados ?? 0;
  const absenteismoDias = dados.absenteismo_mes?.total?.dias_afastados ?? 0;

  const porTipo = (dados.afastados_na_data?.por_tipo ?? [])
    .slice(0, 5)
    .map((item) => ({ label: nomeCurtoTipo(item.nome), value: item.vinculos }));

  const serie = (dados.linha_do_tempo ?? []).map((item, i) => ({
    label: String(i),
    value: item.vinculos_afastados_no_fim_do_mes,
  }));
  const ultimoIncompleto = dados.linha_do_tempo?.[dados.linha_do_tempo.length - 1]?.mes_incompleto ?? false;

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-[10px] border p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] leading-tight font-semibold tracking-tight">Afastamentos na data</h3>
          <p className="text-muted-foreground mt-1 text-[12px]">
            Dados do SIP de {dataBR(dados.data_referencia)}
          </p>
        </div>
        <Link
          href="/afastamentos"
          className="text-primary inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
        >
          Abrir Afastamentos
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Três números */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/40 rounded-[8px] p-3">
          <p className="text-muted-foreground text-[10.5px] font-medium uppercase tracking-wide">Afastados na data</p>
          <p className="num-cond mt-1.5 text-[20px] leading-none">{fmtNum(afastados)}</p>
        </div>
        <div className="bg-muted/40 rounded-[8px] p-3">
          <p className="text-muted-foreground text-[10.5px] font-medium uppercase tracking-wide">Retornos em 7 dias</p>
          <p className="num-cond mt-1.5 text-[20px] leading-none">{fmtNum(retornos)}</p>
          {emendas > 0 && (
            <p className="text-muted-foreground mt-1 text-[10.5px]">{fmtNum(emendas)} emendam em outro afastamento</p>
          )}
        </div>
        <div className="bg-muted/40 rounded-[8px] p-3">
          <p className="text-muted-foreground text-[10.5px] font-medium uppercase tracking-wide">Dias afastados no mês</p>
          <p className="num-cond mt-1.5 text-[20px] leading-none">{fmtPct(absenteismoPct)}</p>
          <p className="text-muted-foreground mt-1 text-[10.5px]">{fmtNum(absenteismoDias)} dias</p>
        </div>
      </div>

      {/* Barras por tipo */}
      {porTipo.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-[11px] font-medium">Por tipo</p>
          <div style={{ height: Math.max(120, porTipo.length * 24 + 20) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porTipo} layout="vertical" margin={{ top: 2, right: 36, left: 2, bottom: 2 }} barSize={12}>
                <CartesianGrid horizontal={false} stroke={t(RX.cinzaClaro)} strokeDasharray="3 4" />
                <XAxis type="number" tick={{ fontSize: 9, fill: t(RX.textoSec) }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={180}
                  tick={{ fontSize: 9, fill: t(RX.textoSec) }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<TooltipBar />} />
                <Bar dataKey="value" fill={t(RX.azul)} radius={[0, 3, 3, 0]}>
                  <LabelList dataKey="value" position="right" formatter={(v: number) => fmtNum(v)} style={{ fontSize: 9, fill: t(RX.textoSec), fontWeight: 500 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sparkline */}
      {serie.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-1 text-[11px] font-medium">Linha do tempo</p>
          <Sparkline data={serie} mesIncompleto={ultimoIncompleto} />
          {ultimoIncompleto && (
            <p className="text-muted-foreground mt-1 text-[10px]">* Último mês incompleto</p>
          )}
        </div>
      )}
    </div>
  );
}

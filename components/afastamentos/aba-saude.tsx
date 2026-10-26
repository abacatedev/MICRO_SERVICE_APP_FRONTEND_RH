"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { RX, corNoTema } from "@/lib/raio-x/cores";
import { useTemaEscuro } from "@/lib/raio-x/tema";
import { RxCard } from "@/components/raio-x/rx-card";
import { SAUDE_FIXTURE } from "@/lib/afastamentos/futuro";
import { fmtNum } from "@/lib/afastamentos/formato";
import { Cartao } from "./ui";

export function AbaSaude() {
  const escuro = useTemaEscuro();
  const t = (c: string) => corNoTema(c, escuro);
  const [modo, setModo] = React.useState<"dias" | "episodios">("dias");
  const f = SAUDE_FIXTURE;

  const dadosBarras = f.dias_por_capitulo.map((c) => ({
    label: c.capitulo,
    valor: modo === "dias" ? c.dias : c.episodios,
  }));

  const secretarias = Object.keys(f.heatmap[0] ?? {}).filter((k) => k !== "capitulo");
  const maxHeat = Math.max(...f.heatmap.flatMap((r) => secretarias.map((s) => (r as Record<string, number>)[s] ?? 0)));

  return (
    <div className="flex flex-col gap-4">
      <div className="border-destructive bg-critical-soft rounded-[10px] border px-4 py-3">
        <p className="text-destructive text-[12px] font-semibold">
          LGPD: somente admin e RH. Só números agregados. Grupos com menos de 5 casos aparecem como "&lt; 5". Acesso registrado na auditoria.
        </p>
      </div>

      <div className="border-border bg-card rounded-[10px] border border-dashed px-4 py-3">
        <p className="text-warning text-[12px] font-semibold">Visão futura: valores ilustrativos</p>
      </div>

      <Cartao titulo="Cobertura do CID" valor={`${f.cobertura_cid}%`} cor="cinza" />

      <RxCard
        titulo="Dias / episódios por capítulo do CID"
        acao={
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setModo("dias")}
              className={cn(
                "h-7 rounded-md border px-2 text-[11px] font-medium transition-colors",
                modo === "dias" ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-muted",
              )}
            >
              Dias
            </button>
            <button
              type="button"
              onClick={() => setModo("episodios")}
              className={cn(
                "h-7 rounded-md border px-2 text-[11px] font-medium transition-colors",
                modo === "episodios" ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-muted",
              )}
            >
              Episódios
            </button>
          </div>
        }
      >
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosBarras} margin={{ top: 4, right: 10, left: 0, bottom: 80 }} barSize={16}>
              <CartesianGrid vertical={false} stroke={t(RX.cinzaClaro)} strokeDasharray="3 4" />
              <XAxis dataKey="label" interval={0} tick={{ fontSize: 9, fill: t(RX.textoSec) }} angle={-45} textAnchor="end" height={80} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: t(RX.textoSec) }} tickLine={false} axisLine={false} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
                    <p className="text-[13px] font-semibold">{p.label}</p>
                    <p className="text-muted-foreground text-[11.5px]">{fmtNum(p.valor)} {modo}</p>
                  </div>
                );
              }} />
              <Bar dataKey="valor" fill={t(RX.azul)} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </RxCard>

      <RxCard titulo="Mapa de calor: capítulo × secretaria" subtitulo="Valores com supressão abaixo de 5">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2 text-left">Capítulo</th>
                {secretarias.map((s) => (
                  <th key={s} className="px-2 py-2 text-right capitalize">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.heatmap.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="px-2 py-2 whitespace-nowrap">{row.capitulo}</td>
                  {secretarias.map((s) => {
                    const v = (row as Record<string, number>)[s] ?? 0;
                    const intensidade = maxHeat > 0 ? v / maxHeat : 0;
                    const bg = `rgba(19,81,180,${Math.max(0.08, intensidade * 0.9)})`;
                    return (
                      <td key={s} className="px-2 py-2 text-right tabular" style={{ backgroundColor: bg }}>
                        {v < 5 ? "< 5" : fmtNum(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RxCard>
    </div>
  );
}

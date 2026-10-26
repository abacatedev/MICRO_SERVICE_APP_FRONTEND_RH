"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { RX, corNoTema } from "@/lib/raio-x/cores";
import { useTemaEscuro } from "@/lib/raio-x/tema";
import { RxCard } from "@/components/raio-x/rx-card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dataBR, fmtNum, fmtPct, mesCurto, rotuloTipo } from "@/lib/afastamentos/formato";
import { EtiquetaEsocial } from "./ui";
import { topN } from "@/lib/afastamentos/calculos";
import {
  useRetornos,
  useEsocialResumo,
  useVigentesResumo,
  useSerieMensal,
  useVigentes,
} from "@/lib/afastamentos/api";
import type { FiltrosAfastamentos, VigentesResumo, Absenteismo, ResumoItem } from "@/lib/afastamentos/tipos";
import { Cartao, SkeletonCards, SkeletonGrafico, SkeletonTabela, MensagemErro, TabelaVazia } from "./ui";
import { baixarCSV } from "@/lib/afastamentos/exportar";
import { FileBarChart } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Formatação de rótulos                                               */
/* ------------------------------------------------------------------ */

/** Converte "LICENCA PARA TRATAMENTO DE SAUDE" em "Licença Para Tratamento De Saúde"
 *  e trunca em 40 caracteres para caber numa linha do gráfico. */
function tituloTipo(nome: string): string {
  const curto = nome
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (l) => l.toUpperCase());
  if (curto.length <= 42) return curto;
  return curto.slice(0, 39) + "…";
}

/* ------------------------------------------------------------------ */
/* Tooltip genérico para barras horizontais                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Barras horizontais reutilizáveis                                    */
/* ------------------------------------------------------------------ */

function BarrasH({
  data,
  altura,
  cor = RX.azul,
  destaque,
  onClick,
  mostrarValor = false,
}: {
  data: { label: string; value: number }[];
  altura: number;
  cor?: string;
  destaque?: (v: number) => boolean;
  onClick?: (label: string) => void;
  mostrarValor?: boolean;
}) {
  const escuro = useTemaEscuro();
  const t = (c: string) => corNoTema(c, escuro);

  return (
    <div style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: mostrarValor ? 40 : 16, left: 8, bottom: 4 }} barSize={14}>
          <CartesianGrid horizontal={false} stroke={t(RX.cinzaClaro)} strokeDasharray="3 4" />
          <XAxis type="number" tick={{ fontSize: 10, fill: t(RX.textoSec) }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={mostrarValor ? 200 : 180}
            tick={{ fontSize: 10, fill: t(RX.textoSec) }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<TooltipBar />} />
          <Bar dataKey="value" fill={t(cor)} radius={[0, 3, 3, 0]} onClick={(_, idx) => onClick?.(data[idx].label)}>
            {mostrarValor && <LabelList dataKey="value" position="right" formatter={(v: number) => fmtNum(v)} style={{ fontSize: 10, fill: t(RX.textoSec), fontWeight: 500 }} />}
            {data.map((d, i) => (
              <Cell key={i} fill={destaque?.(d.value) ? t(RX.laranja) : t(cor)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panorama                                                            */
/* ------------------------------------------------------------------ */

export function AbaPanorama({
  filtros,
  tipoResumo,
  absenteismo,
}: {
  filtros: FiltrosAfastamentos;
  tipoResumo: { data: VigentesResumo | null; isLoading: boolean; isError: boolean; erro: string | null; status: number | null; refetch: () => void };
  absenteismo: { data: Absenteismo | null; isLoading: boolean; isError: boolean; erro: string | null; status: number | null; refetch: () => void };
}) {
  const escuro = useTemaEscuro();
  const t = (c: string) => corNoTema(c, escuro);

  const [tipoReduzido, setTipoReduzido] = React.useState<string | null>(null);

  const retornos = useRetornos(7, filtros);
  const esocial = useEsocialResumo();
  const cargoResumo = useVigentesResumo("cargo", filtros);
  const serie = useSerieMensal(filtros);
  const vigentesDoTipo = useVigentes(
    { sec: filtros.sec, ano: filtros.ano, tipo: tipoReduzido ?? "" },
    !!tipoReduzido,
  );

  /* --- card 1: Afastados na data --- */
  const cardAfastados = tipoResumo.data?.total_vinculos ?? 0;

  /* --- card 2: Retornos em 7 dias --- */
  const cardRetornos = retornos.data?.total ?? 0;
  const emendas = retornos.data?.itens.filter((i) => i.emenda_outro_afastamento).length ?? 0;

  /* --- card 3: Dias afastados no mês --- */
  const cardAbsenteismo = absenteismo.data?.total.percentual_dias_afastados ?? 0;

  /* --- card 4: Sem envio ao eSocial --- */
  const cardSemEnvio = esocial.data?.totais.sem_status ?? 0;

  /* --- bloco 3: por tipo --- */
  const dadosTipo = (tipoResumo.data?.itens ?? []).map((i) => ({
    label: tituloTipo(i.nome),
    value: i.afastamentos,
    codigo: i.codigo,
  }));

  /* --- bloco 4: % por secretaria --- */
  const mediaPrefeitura = absenteismo.data?.total.percentual_dias_afastados ?? 0;
  const dadosSec = (absenteismo.data?.itens ?? [])
    .map((i) => ({ label: `${i.divisao} · ${fmtNum(i.vinculos)}`, value: i.percentual_dias_afastados, vinculos: i.vinculos }))
    .sort((a, b) => b.value - a.value);

  /* --- bloco 5: cargos --- */
  const dadosCargo = topN(cargoResumo.data?.itens ?? [], 8).map((i) => ({ label: i.nome, value: i.afastamentos }));

  /* --- bloco 6: série mensal --- */
  const dadosSerie = (serie.data?.itens ?? []).map((i) => ({ label: mesCurto(i.mes), value: i.vinculos_afastados_no_fim_do_mes, incompleto: i.mes_incompleto }));

  const handleExportarTipo = async () => {
    if (!tipoReduzido) return;
    await baixarCSV("vigentes", { ...filtros, tipo: tipoReduzido });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link href="/relatorios?r=afastamentos-vigentes">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <FileBarChart className="size-3.5" />
            Ver no Relatórios
          </Button>
        </Link>
      </div>

      {/* 1. Cards */}
      {tipoResumo.isLoading || retornos.isLoading || absenteismo.isLoading || esocial.isLoading ? (
        <SkeletonCards />
      ) : tipoResumo.isError || retornos.isError || absenteismo.isError || esocial.isError ? (
        <MensagemErro erro={tipoResumo.erro ?? retornos.erro ?? absenteismo.erro ?? esocial.erro} status={tipoResumo.status ?? retornos.status ?? absenteismo.status ?? esocial.status} onRetry={() => { tipoResumo.refetch(); retornos.refetch(); absenteismo.refetch(); esocial.refetch(); }} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Cartao titulo="Afastados na data" valor={cardAfastados} />
          <Cartao titulo="Retornos em 7 dias" valor={cardRetornos} subtitulo={emendas > 0 ? `dos quais ${fmtNum(emendas)} emendam em outro afastamento` : undefined} />
          <Cartao titulo="Dias afastados no mês" valor={fmtPct(cardAbsenteismo)} cor="cinza" />
          <Cartao titulo="Sem envio ao eSocial" valor={cardSemEnvio} cor="vermelho" />
        </div>
      )}

      {/* 2. Afastados por tipo + lista nominal */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RxCard titulo="Afastados por tipo" subtitulo="Clique numa barra para ver a lista nominal">
          {tipoResumo.isLoading ? <SkeletonGrafico /> : tipoResumo.isError ? (
            <MensagemErro erro={tipoResumo.erro} status={tipoResumo.status} onRetry={tipoResumo.refetch} />
          ) : dadosTipo.length === 0 ? (
            <TabelaVazia mensagem="Nenhum afastamento na data de referência." />
          ) : (
            <BarrasH data={dadosTipo} altura={Math.max(200, dadosTipo.length * 28 + 40)} onClick={(label) => {
              const cod = dadosTipo.find((d) => d.label === label)?.codigo ?? null;
              setTipoReduzido(cod);
            }} mostrarValor />
          )}
        </RxCard>

        <RxCard titulo="% de dias afastados por secretaria" subtitulo="Média da Prefeitura em tracejado">
          {absenteismo.isLoading ? <SkeletonGrafico /> : absenteismo.isError ? (
            <MensagemErro erro={absenteismo.erro} status={absenteismo.status} onRetry={absenteismo.refetch} />
          ) : dadosSec.length === 0 ? (
            <TabelaVazia mensagem="Nenhuma secretaria com os filtros atuais." />
          ) : (
            <div style={{ height: Math.max(200, dadosSec.length * 28 + 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosSec} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }} barSize={14}>
                  <CartesianGrid horizontal={false} stroke={t(RX.cinzaClaro)} strokeDasharray="3 4" />
                  <XAxis type="number" domain={[0, "auto"]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: t(RX.textoSec) }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 10, fill: t(RX.textoSec) }} tickLine={false} axisLine={false} />
                  <Tooltip content={<TooltipBar />} />
                  <ReferenceLine x={mediaPrefeitura} stroke={t(RX.laranja)} strokeDasharray="4 4" />
                  <Bar dataKey="value" fill={t(RX.azul)} radius={[0, 3, 3, 0]}>
                    <LabelList dataKey="value" position="right" formatter={(v: number) => `${fmtNum(v)}%`} style={{ fontSize: 10, fill: t(RX.textoSec), fontWeight: 500 }} />
                    {dadosSec.map((d, i) => (
                      <Cell key={i} fill={d.value > mediaPrefeitura ? t(RX.laranja) : t(RX.azul)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </RxCard>
      </div>

      {/* Lista nominal do tipo clicado */}
      {tipoReduzido && (
        <RxCard
          titulo={`Vigentes: ${dadosTipo.find((d) => d.codigo === tipoReduzido)?.label ?? tipoReduzido}`}
          acao={
            <Button size="sm" variant="outline" onClick={handleExportarTipo}>
              <FileSpreadsheet className="size-3.5" />
              Exportar CSV
            </Button>
          }
        >
          {vigentesDoTipo.isLoading ? <SkeletonTabela /> : vigentesDoTipo.isError ? (
            <MensagemErro erro={vigentesDoTipo.erro} status={vigentesDoTipo.status} onRetry={vigentesDoTipo.refetch} />
          ) : vigentesDoTipo.data?.itens.length === 0 ? (
            <TabelaVazia mensagem="Nenhum vínculo com este tipo na data de referência." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>REGISTRO</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Secretaria</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Retorno previsto</TableHead>
                    <TableHead>eSocial</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vigentesDoTipo.data?.itens.map((item) => (
                    <TableRow key={item.registro + item.item}>
                      <TableCell className="font-mono text-[11.5px]">{item.registro}</TableCell>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.divisao ?? "—"}</TableCell>
                      <TableCell>{item.cargo ?? "—"}</TableCell>
                      <TableCell>{dataBR(item.dtini)}</TableCell>
                      <TableCell>{dataBR(item.retorno_previsto)}</TableCell>
                      <TableCell><EtiquetaEsocial status={item.status_esocial} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </RxCard>
      )}

      {/* 5. Cargos com mais afastados */}
      <RxCard titulo="Cargos com mais afastados" subtitulo="Top 8">
        {cargoResumo.isLoading ? <SkeletonGrafico /> : cargoResumo.isError ? (
          <MensagemErro erro={cargoResumo.erro} status={cargoResumo.status} onRetry={cargoResumo.refetch} />
        ) : dadosCargo.length === 0 ? (
          <TabelaVazia mensagem="Nenhum cargo com afastamentos na data." />
        ) : (
          <BarrasH data={dadosCargo} altura={Math.max(200, dadosCargo.length * 28 + 40)} />
        )}
      </RxCard>

      {/* 6. Linha do tempo */}
      <RxCard titulo="Linha do tempo" subtitulo="Vínculos afastados no fim de cada mês">
        {serie.isLoading ? <SkeletonGrafico /> : serie.isError ? (
          <MensagemErro erro={serie.erro} status={serie.status} onRetry={serie.refetch} />
        ) : dadosSerie.length === 0 ? (
          <TabelaVazia mensagem="Nenhum dado para a série mensal." />
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosSerie} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={t(RX.cinzaClaro)} strokeDasharray="3 4" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: t(RX.textoSec) }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: t(RX.textoSec) }} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipBar />} />
                <Line type="monotone" dataKey="value" stroke={t(RX.azul)} strokeWidth={2} dot={{ r: 3, fill: t(RX.azul) }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </RxCard>
    </div>
  );
}

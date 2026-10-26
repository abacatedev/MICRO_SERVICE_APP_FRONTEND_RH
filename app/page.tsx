"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisaoGeral } from "@/lib/rh/api";
import { useGerencial } from "@/lib/afastamentos/api";
import {
  fmtPct,
  funilConformidade,
  kpisDoPainel,
  pct,
  pendenciasPorTipo,
  regrasPorServidores,
  situacaoPorDivisao,
} from "@/lib/rh/adaptadores";
import { KpiRHCard } from "@/components/visao-geral/kpi-rh";
import { ColunasDivisao } from "@/components/visao-geral/colunas-divisao";
import { DonutTipos } from "@/components/visao-geral/donut-tipos";
import { BarrasRegras } from "@/components/visao-geral/barras-regras";
import { FunilConformidade } from "@/components/visao-geral/funil-conformidade";
import { CardAfastamentosResumo } from "@/components/visao-geral/card-afastamentos-resumo";
import { ListaPendenciasAfastamentos } from "@/components/visao-geral/lista-pendencias-afastamentos";

const REGRAS_VISIVEIS = 10;

/**
 * O gráfico "Pendências por secretaria" mostra **todas** as divisões: o corte
 * existe só como guarda-corpo, não como "top N". Antes eram 12 e as secretarias
 * menores ficavam de fora sem aviso (22/10/2026).
 */
const MAX_SECRETARIAS = 24;

export default function OverviewPage() {
  const { painel, divisoes, isLoading, isError, erro, status, atualizando, refetch, atualizar } =
    useVisaoGeral();
  const gerencial = useGerencial();

  const kpis = React.useMemo(() => (painel ? kpisDoPainel(painel) : []), [painel]);
  const fatias = React.useMemo(() => pendenciasPorTipo(painel?.regras), [painel]);
  const serie = React.useMemo(
    () => situacaoPorDivisao(divisoes, MAX_SECRETARIAS),
    [divisoes],
  );
  const funil = React.useMemo(() => (painel ? funilConformidade(painel) : []), [painel]);
  const topVinculos = React.useMemo(
    () => regrasPorServidores(painel?.regras, REGRAS_VISIVEIS),
    [painel],
  );

  const resumo = painel?.resumo;
  const universo = painel?.universo;

  const descricao = painel
    ? `Diagnóstico do Pré-Censo · empresa ${universo?.empresa ?? "—"} · ${fmtPct(
        pct(resumo?.com_erro ?? 0, resumo?.vinculos ?? 0),
      )} dos vínculos com erro`
    : "Diagnóstico do Pré-Censo";

  return (
    <>
      <PageHeader
        title="Visão geral"
        description={descricao}
        actions={
          <Button variant="outline" size="sm" onClick={atualizar} disabled={atualizando || isLoading}>
            <RefreshCw className={atualizando ? "size-3.5 animate-spin" : "size-3.5"} />
            {atualizando ? "Atualizando…" : "Atualizar"}
          </Button>
        }
      />

      {isError ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-[10px] border px-4 py-12">
          <AlertCircle className="text-destructive size-6" />
          <p className="text-foreground text-[13px]">
            {status === 403
              ? "Seu perfil não tem acesso ao painel do diagnóstico."
              : "Não foi possível carregar o diagnóstico."}
          </p>
          {erro && status !== 403 && (
            <p className="bg-muted text-muted-foreground max-w-[620px] rounded-md px-3 py-2 text-center font-mono text-[11.5px] leading-relaxed break-words">
              {erro}
            </p>
          )}
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="size-3.5" />
            Tentar novamente
          </Button>
        </div>
      ) : isLoading || !painel ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, indice) => (
              <Skeleton key={indice} className="h-[124px] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Skeleton className="h-[404px] rounded-xl xl:col-span-2" />
            <Skeleton className="h-[404px] rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiRHCard key={kpi.id} kpi={kpi} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <SectionCard
              title="Pendências por secretaria"
              description="Vínculos com erro ou alerta"
              className="xl:col-span-2"
            >
              <ColunasDivisao serie={serie} />
            </SectionCard>

            <SectionCard
              title="Apontamentos por tipo"
              description="Soma dos apontamentos de cada tipo de regra"
            >
              <DonutTipos fatias={fatias} />
            </SectionCard>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <SectionCard
              title="Regras que mais atingem vínculos"
              description={`Top ${REGRAS_VISIVEIS} · percentual sobre os vínculos ativos`}
              className="xl:col-span-2"
            >
              <BarrasRegras regras={topVinculos} totalVinculos={resumo?.vinculos ?? 0} />
            </SectionCard>

            <SectionCard
              title="Funil do diagnóstico"
              description="Do universo de vínculos até a regra mais grave"
            >
              <FunilConformidade
                etapas={funil}
                vinculos={resumo?.vinculos ?? 0}
                semPendencia={resumo?.sem_pendencia ?? 0}
              />
            </SectionCard>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <CardAfastamentosResumo dados={gerencial.data} />
            </div>
            <ListaPendenciasAfastamentos dados={gerencial.data} />
          </div>
        </>
      )}
    </>
  );
}

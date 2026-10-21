"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PALETA } from "@/lib/paleta";
import { useVisaoGeral } from "@/lib/rh/api";
import {
  fmtPct,
  formatarGeradoEm,
  funilConformidade,
  kpisDoPainel,
  pct,
  pendenciasPorTipo,
  regrasPorOcorrencias,
  regrasPorServidores,
  situacaoPorDivisao,
} from "@/lib/rh/adaptadores";
import { KpiRHCard } from "@/components/visao-geral/kpi-rh";
import { ColunasDivisao } from "@/components/visao-geral/colunas-divisao";
import { DonutTipos } from "@/components/visao-geral/donut-tipos";
import { BarrasRegras } from "@/components/visao-geral/barras-regras";
import { FunilConformidade } from "@/components/visao-geral/funil-conformidade";
import { TabelaServidores } from "@/components/visao-geral/tabela-servidores";
import { ListaOcorrencias } from "@/components/visao-geral/lista-ocorrencias";

const REGRAS_VISIVEIS = 10;

export default function OverviewPage() {
  const { painel, divisoes, isLoading, isError, erro, status, atualizando, refetch, atualizar } =
    useVisaoGeral();

  const kpis = React.useMemo(() => (painel ? kpisDoPainel(painel) : []), [painel]);
  const fatias = React.useMemo(() => pendenciasPorTipo(painel?.regras), [painel]);
  const serie = React.useMemo(() => situacaoPorDivisao(divisoes, 12), [divisoes]);
  const funil = React.useMemo(() => (painel ? funilConformidade(painel) : []), [painel]);
  const topVinculos = React.useMemo(
    () => regrasPorServidores(painel?.regras, REGRAS_VISIVEIS),
    [painel],
  );
  const topOcorrencias = React.useMemo(() => regrasPorOcorrencias(painel?.regras, 6), [painel]);

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
        <div
          className="flex flex-col items-center gap-3 rounded-[10px] border bg-white px-4 py-12"
          style={{ borderColor: PALETA.borda }}
        >
          <AlertCircle className="size-6" style={{ color: PALETA.critico }} />
          <p className="text-[13px]" style={{ color: PALETA.texto }}>
            {status === 403
              ? "Seu perfil não tem acesso ao painel do diagnóstico."
              : "Não foi possível carregar o diagnóstico."}
          </p>
          {erro && status !== 403 && (
            <p
              className="max-w-[620px] rounded-md px-3 py-2 text-center font-mono text-[11.5px] leading-relaxed break-words"
              style={{ color: PALETA.textoSec, backgroundColor: PALETA.fundo }}
            >
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
              description="Vínculos com erro ou alerta · das piores para as melhores"
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
            <TabelaServidores className="xl:col-span-2" />

            <SectionCard
              title="Regras com mais ocorrências"
              description="Uma regra de dependente conta por dependente"
            >
              <ListaOcorrencias regras={topOcorrencias} />
            </SectionCard>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed" style={{ color: PALETA.textoSec }}>
            Fonte: painel de diagnóstico do RH
            {universo
              ? ` (empresa ${universo.empresa}${
                  universo.situacoes?.length
                    ? `, situações ${universo.situacoes.join(" e ")}`
                    : ""
                }).`
              : "."}{" "}
            Cada regra conta o vínculo uma vez; um vínculo pode aparecer em mais de uma regra, por
            isso a soma por tipo não fecha com o total de vínculos.
            {painel.gerado_em ? ` Atualizado em ${formatarGeradoEm(painel.gerado_em)}.` : ""}
          </p>
        </>
      )}
    </>
  );
}

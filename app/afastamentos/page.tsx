"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSessaoRH } from "@/lib/rh/api";
import {
  useReferencia,
  useVigentesResumo,
  useAbsenteismo,
} from "@/lib/afastamentos/api";
import { anosDisponiveis, unirSecretarias } from "@/lib/afastamentos/calculos";
import { dataBR } from "@/lib/afastamentos/formato";
import type { FiltrosAfastamentos } from "@/lib/afastamentos/tipos";
import { BarraFiltros } from "@/components/afastamentos/barra-filtros";
import { AbaPanorama } from "@/components/afastamentos/aba-panorama";
import { AbaServidores } from "@/components/afastamentos/aba-servidores";
import { AbaConferencia } from "@/components/afastamentos/aba-conferencia";
import { AbaRelatorios } from "@/components/afastamentos/aba-relatorios";
import { SkeletonBarra } from "@/components/afastamentos/ui";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ABAS_BASE = [
  { id: "panorama", label: "Panorama", titulo: "Panorama dos afastamentos" },
  { id: "servidores", label: "Servidores", titulo: "Servidores recorrentes" },
  { id: "conferencia", label: "Conferência", titulo: "Conferência eSocial e lançamentos" },
  { id: "relatorios", label: "Relatórios", titulo: "Relatórios e exportações" },
] as const;

const ABAS_FUTURO = [
  { id: "pericias", label: "Perícias", titulo: "Perícias médicas" },
  { id: "saude", label: "Saúde (CID)", titulo: "Saúde — grupos CID" },
] as const;

const MOSTRAR_FUTURO = process.env.NEXT_PUBLIC_AFASTAMENTOS_FUTURO === "true";

const ABAS = MOSTRAR_FUTURO ? [...ABAS_BASE, ...ABAS_FUTURO] : ABAS_BASE;

type AbaId = (typeof ABAS)[number]["id"];

const PADRAO: FiltrosAfastamentos & { aba: AbaId } = {
  sec: "ALL",
  ano: "",
  tipo: "",
  aba: "panorama",
};

export default function AfastamentosPage() {
  const searchParams = useSearchParams();

  const [filtros, setFiltros] = React.useState<FiltrosAfastamentos & { aba: AbaId }>(() => {
    const sec = searchParams.get("sec") ?? PADRAO.sec;
    const ano = searchParams.get("ano") ?? PADRAO.ano;
    const tipo = searchParams.get("tipo") ?? PADRAO.tipo;
    const abaParam = searchParams.get("aba");
    const aba = ABAS.some((a) => a.id === abaParam) ? (abaParam as AbaId) : PADRAO.aba;
    return { sec, ano, tipo, aba };
  });

  // Sincroniza URL
  React.useEffect(() => {
    const p = new URLSearchParams();
    if (filtros.sec !== PADRAO.sec) p.set("sec", filtros.sec);
    if (filtros.ano !== PADRAO.ano) p.set("ano", filtros.ano);
    if (filtros.tipo !== PADRAO.tipo) p.set("tipo", filtros.tipo);
    if (filtros.aba !== PADRAO.aba) p.set("aba", filtros.aba);
    const query = p.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [filtros]);

  // Sessão cedo (401 leva pro login)
  useSessaoRH();

  const referencia = useReferencia();
  const divisaoResumo = useVigentesResumo("divisao", filtros);
  const absenteismo = useAbsenteismo(filtros);
  const tipoResumo = useVigentesResumo("tipo", filtros);

  const anos = React.useMemo(() => anosDisponiveis(referencia.data ?? undefined), [referencia.data]);
  const { lista: secretariasFiltro, totalPrefeitura } = React.useMemo(
    () => unirSecretarias(divisaoResumo.data, absenteismo.data),
    [divisaoResumo.data, absenteismo.data],
  );

  const tiposFiltro = React.useMemo(
    () => (tipoResumo.data?.itens ?? []).map((i) => ({ codigo: i.codigo, nome: i.nome })),
    [tipoResumo.data],
  );

  const temFiltro = filtros.sec !== "ALL" || filtros.ano !== "" || filtros.tipo !== "";

  const onFiltros = (patch: Partial<FiltrosAfastamentos>) =>
    setFiltros((atual) => ({ ...atual, ...patch }));
  const onLimpar = () => setFiltros((atual) => ({ ...PADRAO, aba: atual.aba }));

  const abaAtiva = ABAS.find((a) => a.id === filtros.aba) ?? ABAS[0];

  const seloData = referencia.data?.data_copia ? dataBR(referencia.data.data_copia) : null;

  return (
    <div className="flex flex-1 flex-col gap-3">
      <h1 className="sr-only">Afastamentos</h1>

      {/* Header com selo de data */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-[22px] leading-tight font-semibold tracking-tight">
            Afastamentos
          </h2>
          <p className="text-muted-foreground text-[13px]">
            Lançamentos de afastamento do SIP/Fiorilli, somente leitura. Empresa 001 · vínculos ativos.
          </p>
        </div>
        {seloData && (
          <Badge variant="secondary" className="self-start sm:self-auto">
            Dados do SIP de {seloData}
          </Badge>
        )}
      </div>

      {/* Barra de filtros */}
      {divisaoResumo.isError ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-[10px] border px-4 py-10">
          <AlertCircle className="text-destructive size-6" />
          <p className="text-foreground text-[13px]">Não foi possível carregar os filtros.</p>
          <Button size="sm" variant="outline" onClick={() => divisaoResumo.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : !divisaoResumo.data ? (
        <SkeletonBarra />
      ) : (
        <BarraFiltros
          secretarias={secretariasFiltro}
          tipos={tiposFiltro}
          anos={anos}
          filtros={filtros}
          totalPrefeitura={totalPrefeitura}
          temFiltro={temFiltro}
          onFiltros={onFiltros}
          onLimpar={onLimpar}
        />
      )}

      {/* Faixa de abas */}
      <div
        role="tablist"
        aria-label="Visões de Afastamentos"
        className="border-border bg-card flex w-full gap-1 overflow-x-auto rounded-[10px] border p-1"
      >
        {ABAS.map((aba) => {
          const ativa = filtros.aba === aba.id;
          return (
            <button
              key={aba.id}
              id={`aba-af-${aba.id}`}
              role="tab"
              aria-selected={ativa}
              aria-controls={ativa ? `painel-af-${aba.id}` : undefined}
              onClick={() => setFiltros((atual) => ({ ...atual, aba: aba.id }))}
              className={cn(
                "h-10 flex-1 min-w-[110px] truncate rounded-[7px] px-1 text-[13px] font-semibold transition-colors xl:text-[14px]",
                "hover:bg-muted focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                ativa ? "bg-primary text-primary-foreground" : "text-foreground",
              )}
            >
              {aba.label}
            </button>
          );
        })}
      </div>

      {/* Painel ativo */}
      <div
        role="tabpanel"
        id={`painel-af-${filtros.aba}`}
        aria-labelledby={`aba-af-${filtros.aba}`}
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        <h2 className="text-foreground px-1 text-[17px] font-semibold tracking-tight">
          {abaAtiva.titulo}
        </h2>

        {filtros.aba === "panorama" && (
          <AbaPanorama filtros={filtros} tipoResumo={tipoResumo} absenteismo={absenteismo} />
        )}
        {filtros.aba === "servidores" && <AbaServidores filtros={filtros} />}
        {filtros.aba === "conferencia" && <AbaConferencia />}
        {filtros.aba === "relatorios" && <AbaRelatorios filtros={filtros} />}
        {MOSTRAR_FUTURO && filtros.aba === "pericias" && <AbaPericias />}
        {MOSTRAR_FUTURO && filtros.aba === "saude" && <AbaSaude />}
      </div>
    </div>
  );
}

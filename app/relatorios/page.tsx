"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RelatorioCatalogo } from "@/lib/relatorios/types";
import {
  useCatalogoRelatorios,
  useRelatorio,
  useExportarRelatorio,
  LIMITE_PADRAO,
} from "@/lib/relatorios/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ListaRelatorios } from "@/components/relatorios/lista-relatorios";
import { BarraFiltros, ChipsFiltros } from "@/components/relatorios/filtros";
import { BarraAcoes } from "@/components/relatorios/barra-acoes";
import { TabelaRelatorio, Paginacao } from "@/components/relatorios/tabela-relatorio";
import { FichaLateral, type FichaAberta } from "@/components/relatorios/ficha-lateral";

/* ------------------------------------------------------------------ */
/* Helpers de URL                                                      */
/* ------------------------------------------------------------------ */

function lerEstado(sp: URLSearchParams) {
  return {
    r: sp.get("r") || null,
    q: sp.get("q") || "",
    colunas: sp.get("colunas")?.split(",").filter(Boolean) || undefined,
    agrupar: sp.get("agrupar") === "true",
    ordenar: sp.get("ordenar") || undefined,
    direcao: (sp.get("direcao") as "asc" | "desc") || "asc",
    pagina: Number(sp.get("pagina")) || 1,
    por_pagina: Number(sp.get("por_pagina")) || LIMITE_PADRAO,
  };
}

function montarQuery(
  base: Record<string, string | undefined>,
  filtros: Record<string, unknown>,
) {
  const sp = new URLSearchParams();
  Object.entries(base).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
  });
  Object.entries(filtros).forEach(([k, v]) => {
    if (v === undefined || v === "" || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((item) => sp.append(k, String(item)));
    } else {
      sp.set(k, String(v));
    }
  });
  return sp.toString();
}

/* ------------------------------------------------------------------ */
/* Debounce                                                            */
/* ------------------------------------------------------------------ */

function useDebounce<T>(value: T, delay = 400) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function RelatoriosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: catalogo, isLoading: carregandoCatalogo } = useCatalogoRelatorios();

  const estadoInicial = React.useMemo(() => lerEstado(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [relatorioId, setRelatorioId] = React.useState<string | null>(estadoInicial.r);
  const [qInput, setQInput] = React.useState(estadoInicial.q);
  const qDebounce = useDebounce(qInput, 400);
  const [colunasVisiveis, setColunasVisiveis] = React.useState<string[] | undefined>(estadoInicial.colunas);
  const [agrupar, setAgrupar] = React.useState(estadoInicial.agrupar);
  const [ordenar, setOrdenar] = React.useState<string | undefined>(estadoInicial.ordenar);
  const [direcao, setDirecao] = React.useState<"asc" | "desc">(estadoInicial.direcao);
  const [pagina, setPagina] = React.useState(estadoInicial.pagina);
  const [porPagina, setPorPagina] = React.useState(estadoInicial.por_pagina);
  const [filtros, setFiltros] = React.useState<Record<string, unknown>>({});
  const [ficha, setFicha] = React.useState<FichaAberta | null>(null);

  const relatorioAtual = React.useMemo(
    () => catalogo?.relatorios.find((r) => r.id === relatorioId) || null,
    [catalogo, relatorioId],
  );

  /* inicializa filtros padrão ao trocar de relatório */
  React.useEffect(() => {
    if (!relatorioAtual) {
      setFiltros({});
      return;
    }
    const novo: Record<string, unknown> = {};
    relatorioAtual.filtros.forEach((f) => {
      if (f.padrao !== undefined && f.padrao !== null) {
        novo[f.id] = f.padrao;
      }
    });
    setFiltros(novo);
    setColunasVisiveis(undefined);
    setAgrupar(false);
    setOrdenar(undefined);
    setDirecao(relatorioAtual.ordem_padrao.decrescente ? "desc" : "asc");
    setPagina(1);
    setQInput("");
  }, [relatorioAtual?.id]);

  /* sincroniza estado inicial da URL (só na primeira montagem) */
  React.useEffect(() => {
    if (!relatorioAtual) return;
    const sp = new URLSearchParams(searchParams.toString());
    const inicial: Record<string, unknown> = {};
    relatorioAtual.filtros.forEach((f) => {
      const v = sp.getAll(f.id);
      if (v.length) {
        if (f.tipo === "multipla") inicial[f.id] = v;
        else if (f.tipo === "booleano") inicial[f.id] = v[0] === "true";
        else if (f.tipo === "numero") inicial[f.id] = Number(v[0]);
        else inicial[f.id] = v[0];
      } else if (f.padrao !== undefined && f.padrao !== null) {
        inicial[f.id] = f.padrao;
      }
    });
    setFiltros(inicial);
  }, [relatorioAtual?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* sincroniza URL sempre que estado muda */
  React.useEffect(() => {
    if (!relatorioAtual) return;
    const base = {
      r: relatorioId || undefined,
      q: qDebounce || undefined,
      colunas: colunasVisiveis?.join(",") || undefined,
      agrupar: agrupar ? "true" : undefined,
      ordenar: ordenar || undefined,
      direcao: ordenar ? direcao : undefined,
      pagina: pagina > 1 ? String(pagina) : undefined,
      por_pagina: porPagina !== LIMITE_PADRAO ? String(porPagina) : undefined,
    };
    const filtrosLimpos = Object.fromEntries(
      Object.entries(filtros).filter(([k]) => !/remuneracao/i.test(k)),
    );
    const qs = montarQuery(base, filtrosLimpos);
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [relatorioId, qDebounce, colunasVisiveis, agrupar, ordenar, direcao, pagina, porPagina, filtros, relatorioAtual, pathname, router]);

  /* consulta */
  const paramsConsulta = React.useMemo(() => {
    const filtrosLimpos = Object.fromEntries(
      Object.entries(filtros).filter(([k]) => !/remuneracao/i.test(k)),
    );
    return {
      q: qDebounce || undefined,
      colunas: colunasVisiveis,
      agrupar,
      ordenar,
      direcao,
      pagina,
      por_pagina: porPagina,
      ...filtrosLimpos,
    };
  }, [qDebounce, colunasVisiveis, agrupar, ordenar, direcao, pagina, porPagina, filtros]);

  const {
    data: resposta,
    isLoading: carregandoRelatorio,
    isError,
    erro,
    status,
  } = useRelatorio(relatorioId, paramsConsulta);

  /* colunas efetivas */
  const colunasEfetivas = React.useMemo(() => {
    if (!relatorioAtual) return [];
    const ids = colunasVisiveis ?? relatorioAtual.colunas.filter((c) => c.padrao).map((c) => c.id);
    return ids
      .map((id) => relatorioAtual.colunas.find((c) => c.id === id))
      .filter(Boolean) as RelatorioCatalogo["colunas"];
  }, [relatorioAtual, colunasVisiveis]);

  /* ordenar */
  const handleOrdenar = React.useCallback(
    (col: string) => {
      if (ordenar === col) {
        setDirecao((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setOrdenar(col);
        setDirecao("asc");
      }
      setPagina(1);
    },
    [ordenar],
  );

  /* toggle coluna */
  const toggleColuna = React.useCallback((id: string) => {
    setColunasVisiveis((prev) => {
      const base = prev ?? [];
      if (base.includes(id)) return base.filter((c) => c !== id);
      return [...base, id];
    });
  }, []);

  /* mover coluna */
  const moverColuna = React.useCallback((id: string, dir: -1 | 1) => {
    setColunasVisiveis((prev) => {
      const base = prev ?? [];
      const idx = base.indexOf(id);
      if (idx < 0) return base;
      const novo = [...base];
      const dest = idx + dir;
      if (dest < 0 || dest >= novo.length) return base;
      [novo[idx], novo[dest]] = [novo[dest], novo[idx]];
      return novo;
    });
  }, []);

  /* exportação */
  const { gerando: exportando, erro: erroExport, exportar } = useExportarRelatorio();

  const handleExportar = React.useCallback(
    (formato: "csv" | "xlsx" | "pdf") => {
      if (!relatorioId) return;
      exportar(relatorioId, formato, paramsConsulta);
    },
    [relatorioId, paramsConsulta, exportar],
  );

  /* fichas */
  const handleLinhaClick = React.useCallback(
    (item: Record<string, unknown>) => {
      const reg = String(item.REGISTRO || item.registro || "");
      if (!reg || !relatorioAtual) return;
      const nome = String(item.NOME || item.nome || "");
      // menu simples: se tiver ambas fichas, abre pendências por padrão
      const tipo = relatorioAtual.fichas.includes("pendencias")
        ? "pendencias"
        : relatorioAtual.fichas.includes("afastamentos")
          ? "afastamentos"
          : null;
      if (!tipo) return;
      setFicha({ tipo, registro: reg, nome });
    },
    [relatorioAtual],
  );

  /* reset ao trocar de relatório via lista */
  const handleSelecionarRelatorio = React.useCallback((id: string) => {
    setRelatorioId(id);
    setPagina(1);
    setQInput("");
    setColunasVisiveis(undefined);
    setAgrupar(false);
    setOrdenar(undefined);
    setDirecao("asc");
    setFiltros({});
  }, []);

  /* filtros */
  const handleFiltroChange = React.useCallback((id: string, val: unknown) => {
    setFiltros((prev) => {
      const novo = { ...prev };
      if (val === undefined || val === "" || val === null) {
        delete novo[id];
      } else {
        novo[id] = val;
      }
      return novo;
    });
    setPagina(1);
  }, []);

  const handleLimparFiltros = React.useCallback(() => {
    if (!relatorioAtual) return;
    const novo: Record<string, unknown> = {};
    relatorioAtual.filtros.forEach((f) => {
      if (f.padrao !== undefined && f.padrao !== null) novo[f.id] = f.padrao;
    });
    setFiltros(novo);
    setPagina(1);
  }, [relatorioAtual]);

  /* chips */
  const chipsAtivos = React.useMemo(() => {
    if (!relatorioAtual) return [];
    return relatorioAtual.filtros
      .filter((f) =>
        filtros[f.id] !== undefined &&
        filtros[f.id] !== "" &&
        filtros[f.id] !== null &&
        !/remuneracao/i.test(f.id),
      )
      .map((f) => ({ id: f.id, rotulo: f.rotulo, valor: filtros[f.id] }));
  }, [relatorioAtual, filtros]);

  /* data do cabeçalho */
  const dataCabecalho = resposta?.data_referencia
    ? (() => {
        const [a, m, d] = resposta.data_referencia.split("-");
        return `Dados do SIP de ${d}/${m}/${a}`;
      })()
    : resposta?.gerado_em
      ? `Gerado em ${new Date(resposta.gerado_em).toLocaleDateString("pt-BR")}`
      : null;

  /* esmaecer enquanto carrega nova página/filtro */
  const esmaecer = carregandoRelatorio && !!resposta;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col gap-4 lg:flex-row">
      {/* Coluna esquerda */}
      <aside className="border-border flex flex-col gap-3 border-b pb-4 lg:w-[280px] lg:shrink-0 lg:border-b-0 lg:border-r lg:pr-4 lg:pb-0">
        <h2 className="text-[13px] font-semibold">Relatórios</h2>
        {carregandoCatalogo ? (
          <div className="space-y-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : catalogo ? (
          <ListaRelatorios
            relatorios={catalogo.relatorios}
            selecionado={relatorioId}
            onSelecionar={handleSelecionarRelatorio}
          />
        ) : null}
      </aside>

      {/* Área principal */}
      <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
        {!relatorioAtual ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-[13px]">
            Escolha um relatório ao lado
          </div>
        ) : (
          <>
            {/* Cabeçalho */}
            <div>
              <h1 className="text-[18px] font-semibold">{relatorioAtual.titulo}</h1>
              <p className="text-muted-foreground text-[12.5px]">{relatorioAtual.descricao}</p>
              {dataCabecalho && (
                <p className="text-muted-foreground mt-1 text-[11.5px]">{dataCabecalho}</p>
              )}
              {resposta?.contexto?.regra && (
                <div className="bg-muted mt-3 rounded-md border p-3">
                  <p className="text-[13px] font-semibold">{resposta.contexto.regra.titulo}</p>
                  <p className="text-muted-foreground text-[12px]">{resposta.contexto.regra.descricao}</p>
                  <p className="text-[12px]">{resposta.contexto.regra.orientacao}</p>
                </div>
              )}
            </div>

            {/* Busca */}
            {relatorioAtual.busca && (
              <div className="space-y-1">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar por nome, matrícula, CPF, cargo ou secretaria"
                    value={qInput}
                    onChange={(e) => {
                      setQInput(e.target.value);
                      setPagina(1);
                    }}
                    className="h-9 pl-9 text-[12.5px]"
                  />
                </div>
                <p className="text-muted-foreground text-[10.5px]">
                  {catalogo?.pode_ver_dados_sensiveis
                    ? "Sem acento. CPF com ou sem pontuação."
                    : "Sem acento. Busca por nome, matrícula, cargo ou secretaria."}
                </p>
              </div>
            )}

            {/* Filtros */}
            {relatorioAtual.filtros.length > 0 && (
              <BarraFiltros
                filtros={relatorioAtual.filtros}
                valores={filtros}
                opcoes={resposta?.opcoes}
                onChange={handleFiltroChange}
                onLimpar={handleLimparFiltros}
              />
            )}

            {/* Ações */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BarraAcoes
                colunas={relatorioAtual.colunas}
                visiveis={colunasVisiveis ?? relatorioAtual.colunas.filter((c) => c.padrao).map((c) => c.id)}
                onToggleColuna={toggleColuna}
                onMoverColuna={moverColuna}
                podeAgrupar={relatorioAtual.agrupar_por_pessoa}
                agrupado={agrupar}
                onToggleAgrupar={() => {
                  setAgrupar((a) => !a);
                  setPagina(1);
                }}
                total={resposta?.total ?? 0}
                exportando={exportando}
                onExportar={handleExportar}
              />
            </div>

            {/* Resumo */}
            <div className="flex flex-col gap-2">
              <p className="text-[12.5px]">
                <strong>{(resposta?.total ?? 0).toLocaleString("pt-BR")}</strong> resultado
                {(resposta?.total ?? 0) !== 1 ? "s" : ""}
                {resposta && resposta.total !== resposta.total_carregado && (
                  <span className="text-muted-foreground"> de {resposta.total_carregado.toLocaleString("pt-BR")}</span>
                )}
                {agrupar && <span className="text-muted-foreground"> · {resposta?.total_carregado ?? 0} pessoas</span>}
              </p>
              <ChipsFiltros
                ativos={chipsAtivos}
                onRemover={(id) => handleFiltroChange(id, undefined)}
              />
            </div>

            {/* Erros */}
            {isError && status === 403 && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
                <AlertTriangle className="size-4" />
                Você não tem permissão para este relatório.
              </div>
            )}
            {isError && status === 422 && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
                <AlertTriangle className="size-4" />
                {erro || "Erro de validação"}
              </div>
            )}
            {erroExport && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
                <AlertTriangle className="size-4" />
                {erroExport}
              </div>
            )}

            {/* Tabela */}
            <div className={cn("flex-1", esmaecer && "opacity-50 transition-opacity")}>
              {!resposta && carregandoRelatorio ? (
                <div className="space-y-2">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              ) : resposta ? (
                <>
                  <TabelaRelatorio
                    colunas={colunasEfetivas.map((c) => ({
                      id: c.id,
                      rotulo: c.rotulo,
                      tipo: c.tipo,
                    }))}
                    itens={resposta.itens}
                    totais={resposta.totais}
                    ordenadoPor={resposta.ordenado_por}
                    direcao={resposta.direcao}
                    onOrdenar={handleOrdenar}
                    busca={qDebounce}
                    onLinhaClick={relatorioAtual.natureza === "nominal" ? handleLinhaClick : undefined}
                    agrupado={agrupar}
                  />
                  <Paginacao
                    pagina={resposta.pagina}
                    porPagina={resposta.por_pagina}
                    total={resposta.total}
                    onMudarPagina={setPagina}
                    onMudarPorPagina={(n) => {
                      setPorPagina(n);
                      setPagina(1);
                    }}
                  />
                </>
              ) : null}
            </div>
          </>
        )}
      </main>

      {/* Overlay da ficha */}
      {ficha && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setFicha(null)}
        />
      )}
      <FichaLateral aberta={ficha} onFechar={() => setFicha(null)} />
    </div>
  );
}

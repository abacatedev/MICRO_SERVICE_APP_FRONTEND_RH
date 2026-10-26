"use client";

/**
 * Hooks da página Relatórios.
 *
 * Endpoints:
 * - GET /rh/relatorios            → catálogo
 * - GET /rh/relatorios/{id}       → execução
 * - GET /rh/relatorios/{id}/exportar → download (fetch manual)
 */

import * as React from "react";

import { BASE_RH as BASE, useRecurso } from "@/lib/http/recurso";
import type { CatalogoRelatorios, RespostaRelatorio } from "./types";

export const LIMITE_PADRAO = 50;

/* ------------------------------------------------------------------ */
/* Catálogo                                                            */
/* ------------------------------------------------------------------ */

export function useCatalogoRelatorios() {
  return useRecurso<CatalogoRelatorios>(`${BASE}/relatorios`);
}

/* ------------------------------------------------------------------ */
/* Execução                                                            */
/* ------------------------------------------------------------------ */

function montarQuery(
  id: string,
  params: Record<string, string | number | boolean | string[] | undefined>,
) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val === undefined || val === "" || val === null) return;
    if (Array.isArray(val)) {
      val.forEach((v) => sp.append(key, String(v)));
    } else {
      sp.set(key, String(val));
    }
  });
  const qs = sp.toString();
  return `${BASE}/relatorios/${id}${qs ? `?${qs}` : ""}`;
}

export function useRelatorio(
  id: string | null,
  params: {
    q?: string;
    colunas?: string[];
    agrupar?: boolean;
    ordenar?: string;
    direcao?: "asc" | "desc";
    pagina?: number;
    por_pagina?: number;
    [filtroId: string]: unknown;
  },
) {
  const flat = React.useMemo(() => {
    const p: Record<string, string | number | boolean | string[] | undefined> = {
      q: params.q || undefined,
      colunas: params.colunas?.join(","),
      agrupar: params.agrupar ? "true" : undefined,
      ordenar: params.ordenar || undefined,
      direcao: params.direcao || undefined,
      pagina: params.pagina ?? undefined,
      por_pagina: params.por_pagina ?? undefined,
    };
    Object.entries(params).forEach(([key, val]) => {
      if (
        key === "q" ||
        key === "colunas" ||
        key === "agrupar" ||
        key === "ordenar" ||
        key === "direcao" ||
        key === "pagina" ||
        key === "por_pagina"
      )
        return;
      if (val === undefined || val === "" || val === null) return;
      if (Array.isArray(val)) {
        p[key] = val.map(String);
      } else if (typeof val === "boolean") {
        p[key] = val ? "true" : "false";
      } else {
        p[key] = String(val);
      }
    });
    return p;
  }, [params]);

  const caminho = React.useMemo(
    () => (id ? montarQuery(id, flat) : ""),
    [id, flat],
  );

  return useRecurso<RespostaRelatorio>(caminho, !!id);
}

/* ------------------------------------------------------------------ */
/* Exportação                                                          */
/* ------------------------------------------------------------------ */

export interface EstadoExportacao {
  gerando: boolean;
  erro: string | null;
}

export function useExportarRelatorio() {
  const [estado, setEstado] = React.useState<EstadoExportacao>({
    gerando: false,
    erro: null,
  });

  const exportar = React.useCallback(
    async (
      id: string,
      formato: "csv" | "xlsx" | "pdf",
      params: {
        q?: string;
        colunas?: string[];
        agrupar?: boolean;
        ordenar?: string;
        direcao?: "asc" | "desc";
        [filtroId: string]: unknown;
      },
    ) => {
      setEstado({ gerando: true, erro: null });
      try {
        const p: Record<string, string | number | boolean | string[] | undefined> = {
          formato,
          q: params.q || undefined,
          colunas: params.colunas?.join(","),
          agrupar: params.agrupar ? "true" : undefined,
          ordenar: params.ordenar || undefined,
          direcao: params.direcao || undefined,
        };
        Object.entries(params).forEach(([key, val]) => {
          if (
            key === "q" ||
            key === "colunas" ||
            key === "agrupar" ||
            key === "ordenar" ||
            key === "direcao"
          )
            return;
          if (val === undefined || val === "" || val === null) return;
          if (Array.isArray(val)) {
            p[key] = val.map(String);
          } else if (typeof val === "boolean") {
            p[key] = val ? "true" : "false";
          } else {
            p[key] = String(val);
          }
        });

        const url = montarQuery(`${id}/exportar`, p);
        const res = await fetch(url, {
          credentials: "include",
          headers: { Accept: "*/*" },
        });

        if (res.status === 422) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.detail || "filtre mais ou exporte em Excel",
          );
        }
        if (res.status === 501) {
          throw new Error(
            "Formato indisponível no servidor; use CSV",
          );
        }
        if (!res.ok) {
          throw new Error(`Erro ${res.status} ao gerar arquivo`);
        }

        const blob = await res.blob();
        const cd = res.headers.get("content-disposition") || "";
        const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
        const nome = match?.[1]?.replace(/['"]/g, "") || `${id}.${formato}`;

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = nome;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);

        setEstado({ gerando: false, erro: null });
      } catch (err) {
        setEstado({
          gerando: false,
          erro: err instanceof Error ? err.message : "Erro ao exportar",
        });
      }
    },
    [],
  );

  return { ...estado, exportar };
}

/* ------------------------------------------------------------------ */
/* Domínios auxiliares                                                 */
/* ------------------------------------------------------------------ */

export function useDominio(dominio: string | null) {
  return useRecurso<{ codigo: string; nome: string }[]>(
    dominio ? `${BASE}/dominios/${dominio}` : "",
    !!dominio,
  );
}

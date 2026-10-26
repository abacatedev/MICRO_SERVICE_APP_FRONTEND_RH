"use client";

/**
 * Hooks da tela Afastamentos.
 *
 * Toda a rede passa por `useRecurso` (`lib/http/recurso.ts`): mesma origem
 * `/api/rh`, cookie httpOnly repassado pelo proxy, timeout e tratamento de
 * 401/403. Aqui ficam só os caminhos e a composição dos dados.
 */

import { BASE_RH as BASE, useRecurso } from "@/lib/http/recurso";
import { montarUrl } from "./url";
import type {
  Absenteismo,
  Acumulado,
  FiltrosAfastamentos,
  HistoricoServidor,
  InconsistenciasResumo,
  ListaInconsistencia,
  Longos,
  Recorrentes,
  Referencia,
  Retornos,
  SerieMensal,
  Vigentes,
  VigentesResumo,
  EsocialResumo,
  TiposComProblema,
  PendenciasEsocial,
  Gerencial,
  Agrupamento,
} from "./tipos";

/* ------------------------------------------------------------------ */
/* Hooks por endpoint                                                  */
/* ------------------------------------------------------------------ */

export function useReferencia() {
  return useRecurso<Referencia>(`${BASE}/afastamentos/referencia`);
}

/** Usado para o card 1 (total) e para a lista de secretarias do filtro. */
export function useVigentesResumo(por: Agrupamento, filtros: FiltrosAfastamentos) {
  return useRecurso<VigentesResumo>(
    montarUrl(`${BASE}/afastamentos/vigentes/resumo`, {
      por,
      reduzido: filtros.tipo || undefined,
      divisao: filtros.sec !== "ALL" ? filtros.sec : undefined,
    }),
  );
}

export function useVigentes(filtros: FiltrosAfastamentos, enabled = true) {
  return useRecurso<Vigentes>(
    montarUrl(`${BASE}/afastamentos/vigentes`, {
      reduzido: filtros.tipo || undefined,
      divisao: filtros.sec !== "ALL" ? filtros.sec : undefined,
    }),
    enabled,
  );
}

export function useRetornos(dias = 7, filtros: FiltrosAfastamentos) {
  return useRecurso<Retornos>(
    montarUrl(`${BASE}/afastamentos/retornos`, {
      dias: String(dias),
      reduzido: filtros.tipo || undefined,
    }),
  );
}

export function useAbsenteismo(filtros: FiltrosAfastamentos) {
  return useRecurso<Absenteismo>(
    montarUrl(`${BASE}/afastamentos/absenteismo`, {
      ano: filtros.ano || undefined,
    }),
  );
}

export function useSerieMensal(filtros: FiltrosAfastamentos) {
  return useRecurso<SerieMensal>(
    montarUrl(`${BASE}/afastamentos/serie-mensal`, {
      meses: "12",
      reduzido: filtros.tipo || undefined,
      divisao: filtros.sec !== "ALL" ? filtros.sec : undefined,
    }),
  );
}

export function useAcumulado(ano?: string, minDias?: number) {
  return useRecurso<Acumulado>(
    montarUrl(`${BASE}/afastamentos/acumulado`, {
      ano: ano || undefined,
      min_dias: minDias || undefined,
    }),
  );
}

export function useLongos(minDias = 60, semRemuneracao?: boolean) {
  return useRecurso<Longos>(
    montarUrl(`${BASE}/afastamentos/longos`, {
      min_dias: String(minDias),
      somente_sem_remuneracao:
        semRemuneracao !== undefined ? String(semRemuneracao) : undefined,
    }),
  );
}

export function useRecorrentes(ano?: string, perfil?: string) {
  return useRecurso<Recorrentes>(
    montarUrl(`${BASE}/afastamentos/recorrentes`, {
      ano: ano || undefined,
      min_episodios: "4",
      ordenar: "bradford",
      perfil: perfil || undefined,
    }),
  );
}

export function useHistoricoServidor(registro: string | null) {
  return useRecurso<HistoricoServidor>(
    registro ? `${BASE}/servidores/${registro}/afastamentos` : "",
    !!registro,
  );
}

/* eSocial */

export function useEsocialResumo(desde = "2025-01-01") {
  return useRecurso<EsocialResumo>(
    montarUrl(`${BASE}/esocial/afastamentos/resumo`, { desde }),
  );
}

export function useTiposComProblema() {
  return useRecurso<TiposComProblema>(
    `${BASE}/esocial/afastamentos/tipos-com-problema`,
  );
}

export function usePendenciasEsocial(params: {
  reduzido?: string;
  status?: string[];
}) {
  return useRecurso<PendenciasEsocial>(
    montarUrl(`${BASE}/esocial/afastamentos/pendencias`, {
      reduzido: params.reduzido || undefined,
      status: params.status?.length ? params.status : undefined,
    }),
  );
}

/* Inconsistências */

export function useInconsistenciasResumo() {
  return useRecurso<InconsistenciasResumo>(
    `${BASE}/afastamentos/inconsistencias/resumo`,
  );
}

export function useInconsistenciasLista(regra: string | null) {
  return useRecurso<ListaInconsistencia>(
    regra ? `${BASE}/afastamentos/inconsistencias/${regra}` : "",
    !!regra,
  );
}

/* Maternidade sem dependente */
export function useMaternidadeSemDependente() {
  return useRecurso<{
    itens: { registro: string; nome: string; divisao: string | null }[];
  }>(`${BASE}/afastamentos/maternidade-sem-dependente`);
}

/* Gerencial */
export function useGerencial() {
  return useRecurso<Gerencial>(`${BASE}/afastamentos/gerencial`);
}

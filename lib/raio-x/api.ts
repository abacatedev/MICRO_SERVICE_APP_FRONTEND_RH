"use client";

/**
 * Hooks da tela Raio-X.
 *
 * Toda a rede passa por `useRecurso` (`lib/http/recurso.ts`): mesma origem
 * `/api/rh`, cookie httpOnly repassado pelo proxy, timeout e tratamento de
 * 401/403. Aqui ficam só os caminhos e a composição dos dados.
 *
 * `NEXT_PUBLIC_RAIO_X_MOCK=true` volta ao mock tipado, sem rede.
 */

import * as React from "react";

import { BASE_RH as BASE, useRecurso } from "@/lib/http/recurso";
import {
  adaptarCartoes,
  adaptarOutrasRegras,
  adaptarPerfil,
  adaptarSecretarias,
  adaptarTotal,
  formatarGeradoEm,
  tiposDaSelecao,
} from "./adaptadores";
import { RAIO_X_MOCK } from "./mock";
import type {
  DiagnosticoPainel,
  RaioXData,
  RaioXPerfil,
  RaioXRegras,
  Secretaria,
  SessaoRH,
} from "./types";

const USAR_MOCK = process.env.NEXT_PUBLIC_RAIO_X_MOCK === "true";

/* ------------------------------------------------------------------ */
/* Hooks por endpoint                                                  */
/* ------------------------------------------------------------------ */

/** `/rh/me` — quem está logado e quais permissões tem. */
export function useSessao() {
  return useRecurso<SessaoRH>(`${BASE}/me`, !USAR_MOCK);
}

/**
 * `/rh/diagnostico/por-divisao/regras` — base da tela.
 * Incremente `atualizar` para forçar o recálculo no backend (`atualizar=true`).
 */
export function useRaioXRegras({ atualizar = 0 }: { atualizar?: number } = {}) {
  const sufixo = atualizar > 0 ? "?atualizar=true" : "?atualizar=false";
  return useRecurso<RaioXRegras>(`${BASE}/diagnostico/por-divisao/regras${sufixo}`, !USAR_MOCK);
}

/** `/rh/diagnostico/por-divisao/perfil` — locais, cargos e tipos de vínculo. */
export function useRaioXPerfil() {
  return useRecurso<RaioXPerfil>(`${BASE}/diagnostico/por-divisao/perfil`, !USAR_MOCK);
}

/** `/rh/diagnostico` — todas as regras, usadas na aba Qualidade. */
export function useDiagnosticoPainel() {
  return useRecurso<DiagnosticoPainel>(`${BASE}/diagnostico`, !USAR_MOCK);
}

/* ------------------------------------------------------------------ */
/* Composição                                                          */
/* ------------------------------------------------------------------ */

export interface UseRaioXResult {
  data: RaioXData | null;
  isLoading: boolean;
  isError: boolean;
  erro: string | null;
  status: number | null;
  /** true enquanto o recálculo forçado (`atualizar=true`) está em curso. */
  atualizando: boolean;
  refetch: () => void;
  /** Força o backend a recalcular o diagnóstico. */
  atualizar: () => void;
}

export function useRaioX({ sec = "ALL" }: { sec?: string } = {}): UseRaioXResult {
  const [versao, setVersao] = React.useState(0);

  const regras = useRaioXRegras({ atualizar: versao });
  const perfil = useRaioXPerfil();
  const painel = useDiagnosticoPainel();

  // Só para validar a sessão cedo: um 401 aqui já leva para o login.
  useSessao();

  // Forçar recálculo no backend também invalida perfil e diagnóstico.
  const atualizar = React.useCallback(() => {
    setVersao((n) => n + 1);
    perfil.refetch();
    painel.refetch();
  }, [perfil.refetch, painel.refetch]);

  const data = React.useMemo<RaioXData | null>(() => {
    if (USAR_MOCK) return RAIO_X_MOCK;
    if (!regras.data) return null;

    const cartoes = adaptarCartoes(regras.data.cartoes);
    const total = adaptarTotal(regras.data, cartoes);
    const secretarias: Secretaria[] = adaptarSecretarias(regras.data, cartoes);
    const adaptado = adaptarPerfil(perfil.data);
    const divisao = (regras.data.divisoes ?? []).find((d) => d.codigo === sec);

    return {
      secretarias,
      total,
      cartoes,
      locais: adaptado.locais,
      cargos: adaptado.cargos,
      tipoVinculo: tiposDaSelecao(adaptado.tipos, sec),
      // A API ainda não expõe estes dois blocos; a tela mostra o empty state.
      pisFicticio: {},
      faixaDependentes: {},
      alertas: adaptarOutrasRegras(painel.data, regras.data.cartoes, divisao),
      atualizadoEm: formatarGeradoEm(regras.data.gerado_em),
    };
  }, [regras.data, perfil.data, painel.data, sec]);

  // Só a base da tela bloqueia; se o perfil falhar, a tela abre com Quadro vazio.
  const erro = regras.erro ?? perfil.erro ?? painel.erro;
  const isError = regras.isError;
  const status = regras.status ?? perfil.status ?? painel.status;
  const isLoading = !USAR_MOCK && (regras.isLoading || perfil.isLoading || painel.isLoading);

  const refetch = React.useCallback(() => {
    regras.refetch();
    perfil.refetch();
    painel.refetch();
  }, [regras.refetch, perfil.refetch, painel.refetch]);

  return {
    data,
    isLoading,
    isError,
    erro,
    status,
    atualizando: regras.isLoading && versao > 0,
    refetch,
    atualizar,
  };
}

"use client";

/**
 * Hooks da Visão geral (RH).
 *
 * Toda a rede passa por `useRecurso` (`lib/http/recurso.ts`): mesma origem
 * `/api/rh`, cookie httpOnly repassado pelo proxy, timeout e tratamento de
 * 401/403. Aqui ficam só os caminhos e a composição dos dados.
 *
 * Endpoints usados:
 * - `GET /rh/diagnostico`             → painel completo (universo, resumo, regras)
 * - `GET /rh/diagnostico/por-divisao` → uma linha por secretaria
 * - `GET /rh/servidores`              → lista paginada de vínculos
 * - `GET /rh/me`                      → sessão (só para o 401 chegar cedo)
 */

import * as React from "react";

import { BASE_RH as BASE, useRecurso } from "@/lib/http/recurso";
import { normalizarDivisoes } from "./adaptadores";
import type { ListaServidores, Painel, ResumoDivisao, UsuarioRH } from "./types";

/** Linhas por página da tabela de vínculos. */
export const LIMITE_SERVIDORES = 8;

/* ------------------------------------------------------------------ */
/* Hooks por endpoint                                                  */
/* ------------------------------------------------------------------ */

/**
 * `/rh/diagnostico` — base da tela.
 * `atualizar > 0` força o backend a recalcular (`atualizar=true`), que é o que
 * o botão "Atualizar" faz.
 */
export function usePainel(atualizar = 0) {
  const sufixo = atualizar > 0 ? "?atualizar=true" : "?atualizar=false";
  return useRecurso<Painel>(`${BASE}/diagnostico${sufixo}`);
}

/** `/rh/diagnostico/por-divisao` — aceita lista crua ou `{ divisoes: [...] }`. */
export function usePorDivisao() {
  const estado = useRecurso<ResumoDivisao[] | { divisoes?: ResumoDivisao[] }>(
    `${BASE}/diagnostico/por-divisao`,
  );

  const divisoes = React.useMemo(() => normalizarDivisoes(estado.data), [estado.data]);

  return { ...estado, divisoes };
}

/** `/rh/servidores?pagina=&limite=` — colunas cruas do SIP, sem contrato fixo. */
export function useServidores(pagina = 1, limite = LIMITE_SERVIDORES) {
  return useRecurso<ListaServidores>(`${BASE}/servidores?pagina=${pagina}&limite=${limite}`);
}

/** `/rh/me` — quem está logado e quais permissões tem. */
export function useSessaoRH() {
  return useRecurso<UsuarioRH>(`${BASE}/me`);
}

/* ------------------------------------------------------------------ */
/* Composição                                                          */
/* ------------------------------------------------------------------ */

export interface UseVisaoGeralResult {
  painel: Painel | null;
  divisoes: ResumoDivisao[];
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

export function useVisaoGeral(): UseVisaoGeralResult {
  const [versao, setVersao] = React.useState(0);

  const painel = usePainel(versao);
  const divisoes = usePorDivisao();

  // Só para validar a sessão cedo: um 401 aqui já leva para o login.
  useSessaoRH();

  const { refetch: recarregarDivisoes } = divisoes;

  const atualizar = React.useCallback(() => {
    setVersao((n) => n + 1);
    recarregarDivisoes();
  }, [recarregarDivisoes]);

  const refetch = React.useCallback(() => {
    painel.refetch();
    recarregarDivisoes();
  }, [painel.refetch, recarregarDivisoes]);

  // A base da tela é o painel; se as divisões falharem, os cards de secretaria
  // ficam vazios em vez de derrubar a página inteira.
  return {
    painel: painel.data,
    divisoes: divisoes.divisoes,
    isLoading: painel.isLoading,
    isError: painel.isError,
    erro: painel.erro ?? divisoes.erro,
    status: painel.status ?? divisoes.status,
    atualizando: painel.isLoading && versao > 0,
    refetch,
    atualizar,
  };
}

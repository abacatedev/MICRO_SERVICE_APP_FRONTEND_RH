/**
 * Derivações puras da tela Afastamentos.
 *
 * Nenhum acesso a React, rede ou estado. Todas as funções recebem dados
 * crus e devolvem o que a tela precisa desenhar.
 */

import type { AbsenteismoLinha, VigentesResumo, Recorrentes } from "./tipos";
import { anoDe } from "./formato";

/* ------------------------------------------------------------------ */
/* Filtros: secretaria + vínculos                                      */
/* ------------------------------------------------------------------ */

export interface SecretariaFiltro {
  codigo: string;
  nome: string;
  vinculos: number;
}

function normalizar(s: string): string {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Une a lista de divisões de `vigentes/resumo` (traz `codigo` e `nome`)
 * com os vínculos totais do `absenteismo` (só traz `divisao`, sem código).
 *
 * O JOIN é por nome normalizado — ambos vêm do mesmo SIP.
 */
export function unirSecretarias(
  resumo: VigentesResumo | null,
  absenteismo: { itens: AbsenteismoLinha[]; total: { vinculos: number } } | null,
): { lista: SecretariaFiltro[]; totalPrefeitura: number } {
  if (!resumo) return { lista: [], totalPrefeitura: absenteismo?.total?.vinculos ?? 0 };

  const porNome = new Map<string, number>();
  if (absenteismo) {
    for (const item of absenteismo.itens) {
      porNome.set(normalizar(item.divisao), item.vinculos);
    }
  }

  const lista = resumo.itens.map((item) => ({
    codigo: item.codigo,
    nome: item.nome,
    vinculos: porNome.get(normalizar(item.nome)) ?? 0,
  }));

  return {
    lista,
    totalPrefeitura: absenteismo?.total?.vinculos ?? resumo.total_vinculos,
  };
}

/* ------------------------------------------------------------------ */
/* Ano corrente e lista de anos                                        */
/* ------------------------------------------------------------------ */

/** Lista de anos de `ano-2` até `ano` para o seletor de ano. */
export function anosDisponiveis(referencia?: { data_copia: string }): number[] {
  const copia = referencia ? anoDe(referencia.data_copia) : null;
  const atual = copia ?? new Date().getFullYear();
  return [atual, atual - 1, atual - 2];
}

/* ------------------------------------------------------------------ */
/* Supressão abaixo de 5 (LGPD / Saúde)                                */
/* ------------------------------------------------------------------ */

export function suprimir(valor: number): string {
  return valor < 5 ? "< 5" : String(valor);
}

/* ------------------------------------------------------------------ */
/* Top N                                                               */
/* ------------------------------------------------------------------ */

export function topN<T>(lista: T[], n = 8): T[] {
  return lista.slice(0, n);
}

/* ------------------------------------------------------------------ */
/* Bradford sort helper                                                */
/* ------------------------------------------------------------------ */

export function bradfordDoServidor(registro: string, recorrentes: Recorrentes | null) {
  if (!recorrentes) return null;
  return recorrentes.itens.find((r) => r.registro === registro) ?? null;
}

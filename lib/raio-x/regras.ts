/**
 * Ids de cartão que a interface sabe desenhar.
 *
 * A UI guarda os números em campos fixos de `Secretaria` (`irrf`, `salfam`…),
 * então o id do cartão precisa estar nesta lista para virar coluna/gráfico.
 * Título, ordem e destaque crítico vêm da API — aqui fica só a chave.
 */

import type { RegraId } from "./types";

export const REGRAS_CONHECIDAS: RegraId[] = [
  "irrf",
  "salfam",
  "depCpf",
  "depNasc",
  "cert",
  "semEmail",
  "semFone",
];

export function ehRegraConhecida(id: string): id is RegraId {
  return (REGRAS_CONHECIDAS as string[]).includes(id);
}

/** Usado só quando a API não devolve nenhum cartão (não deveria acontecer). */
export const REGRAS_RESERVA: RegraId[] = ["cert", "irrf", "salfam", "depCpf", "depNasc", "semEmail", "semFone"];

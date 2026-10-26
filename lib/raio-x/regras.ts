/**
 * Ids de cartão que a interface sabe desenhar.
 *
 * A UI guarda os números em campos fixos de `Secretaria` (`irrf`, `salfam`…),
 * então o id do cartão precisa estar nesta lista para virar coluna/gráfico.
 *
 * Vem da **API**: `label` (nome longo, usado no título dos gráficos e nas
 * legendas) e `critica` (o card crítico ocupa duas colunas).
 *
 * É decisão de **tela**, e mora aqui: a ordem dos cards, o agrupamento por
 * assunto, o rótulo curto do card e a cor de cada pendência. O nome da API não
 * cabe em 127px de card — "Salário-família acima da idade" vira três linhas e
 * empurra o número.
 */

import { CORES_PENDENCIA } from "@/lib/paleta";

import type { RegraDef, RegraId } from "./types";

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

/**
 * Rótulo curto do card de pendência.
 *
 * O `label` da API continua sendo o nome longo: ele aparece no título dos
 * gráficos ("Certidão ausente: % dos vínculos por secretaria") e nas legendas,
 * onde há espaço para ele. Aqui é só o que cabe no card.
 */
export const ROTULO_CARD: Record<RegraId, string> = {
  cert: "Sem certidão",
  depCpf: "Sem CPF",
  depNasc: "Sem data de nascimento",
  irrf: "IRRF fora da idade",
  salfam: "Salário-família fora da idade",
  semEmail: "Sem e-mail",
  semFone: "Sem celular",
};

/**
 * Grupos da coluna de pendências, na ordem em que aparecem.
 *
 * Dependentes primeiro porque são cinco das sete pendências e é o assunto que
 * o pré-censo persegue; contato do servidor vem depois. Dentro do grupo, a
 * ordem é a de `ids` — a crítica abre a lista, mas quem decide o destaque é o
 * `critica` da API, não esta posição.
 */
export const GRUPOS_CARDS: { titulo: string; ids: RegraId[] }[] = [
  { titulo: "Dependentes", ids: ["cert", "depCpf", "depNasc", "irrf", "salfam"] },
  { titulo: "Contato do servidor", ids: ["semEmail", "semFone"] },
];

/**
 * A ordem dos sete cards, achatada — e a ordem de **tudo** que lista pendência
 * na tela: as fatias do gráfico de composição, as colunas da tabela e as barras
 * do "Secretaria × média da Prefeitura".
 *
 * Derivada de `GRUPOS_CARDS` de propósito: acrescentar um id lá já o põe em
 * todos os gráficos, sem uma segunda lista para esquecer.
 */
export const ORDEM_CARDS: RegraId[] = GRUPOS_CARDS.flatMap((grupo) => grupo.ids);

/**
 * Cor de cada pendência, nos gráficos e na tabela.
 *
 * `Record<RegraId, string>` completo: um id novo sem cor quebra o build em vez
 * de sair cinza no meio de um gráfico. Os hexadecimais vivem em
 * `lib/paleta.ts` (`CORES_PENDENCIA`).
 */
export const COR_CARD: Record<RegraId, string> = CORES_PENDENCIA;

export interface GrupoDeCartoes {
  titulo: string;
  itens: RegraDef[];
}

/**
 * Distribui os cartões que a API mandou nos grupos acima, na ordem de `ids`.
 *
 * Cartão que não estiver em nenhum grupo cai em "Outras pendências" em vez de
 * desaparecer: esta coluna é o único seletor de pendência da tela, então um id
 * novo no backend sem grupo aqui ficaria inalcançável. Grupo sem nenhum cartão
 * na resposta não é desenhado.
 */
export function agruparCartoes(cartoes: RegraDef[] = []): GrupoDeCartoes[] {
  const usados = new Set<RegraId>();
  const grupos: GrupoDeCartoes[] = [];

  for (const grupo of GRUPOS_CARDS) {
    const itens = grupo.ids
      .map((id) => cartoes.find((cartao) => cartao.id === id))
      .filter((cartao): cartao is RegraDef => Boolean(cartao));

    if (!itens.length) continue;
    for (const cartao of itens) usados.add(cartao.id);
    grupos.push({ titulo: grupo.titulo, itens });
  }

  const resto = cartoes.filter((cartao) => !usados.has(cartao.id));
  if (resto.length) grupos.push({ titulo: "Outras pendências", itens: resto });

  return grupos;
}

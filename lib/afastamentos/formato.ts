/**
 * Formatação e rótulos da tela de Afastamentos.
 *
 * Tudo em pt-BR: milhar com ponto (`3.570`), percentual com vírgula (`6,4%`),
 * data `DD/MM/AAAA`. As datas chegam da API em ISO e **nunca** são construídas
 * com `new Date(iso)` — isso deslocaria o dia pelo fuso.
 */

import type { PerfilRecorrencia, StatusEsocial } from "./tipos";

const numero = new Intl.NumberFormat("pt-BR");
const umaCasa = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const duasCasas = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function fmtNum(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return numero.format(valor);
}

export function fmtPct(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return `${umaCasa.format(valor)}%`;
}

/** Fator de Bradford tem duas casas: 12,34. */
export function fmtFator(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return duasCasas.format(valor);
}

/**
 * `2026-09-29` → `29/09/2026`.
 *
 * Fatia a string em vez de passar por `Date`: `new Date("2026-09-29")` é meia-
 * noite UTC e, a oeste de Greenwich, volta um dia.
 */
export function dataBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** `2026-09` → `set/26`, para o eixo do gráfico. */
export function mesCurto(mes: string): string {
  const [ano, m] = mes.split("-");
  const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const indice = Number(m) - 1;
  if (!ano || Number.isNaN(indice) || !nomes[indice]) return mes;
  return `${nomes[indice]}/${ano.slice(2)}`;
}

/** `2026-09` → `setembro de 2026`. */
export function mesLongo(mes: string): string {
  const [ano, m] = mes.split("-");
  const nomes = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const indice = Number(m) - 1;
  if (!ano || Number.isNaN(indice) || !nomes[indice]) return mes;
  return `${nomes[indice]} de ${ano}`;
}

/** Ano de uma data ISO, sem passar por `Date`. */
export function anoDe(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ano = Number(iso.slice(0, 4));
  return Number.isFinite(ano) ? ano : null;
}

/* ------------------------------------------------------------------ */
/* Rótulos                                                             */
/* ------------------------------------------------------------------ */

const STATUS_ESOCIAL: Record<StatusEsocial, string> = {
  valido: "Válido",
  aguardando: "Aguardando",
  nao_enviado: "Não enviado",
  invalido: "Inválido",
  sem_status: "Sem envio",
};

export function rotuloStatus(status: StatusEsocial | null | undefined): string {
  if (!status) return "—";
  return STATUS_ESOCIAL[status] ?? status;
}

const PERFIL: Record<PerfilRecorrencia, string> = {
  frequente: "Frequente",
  prolongado: "Prolongado",
  misto: "Misto",
  moderado: "Moderado",
};

export function rotuloPerfil(perfil: PerfilRecorrencia | null | undefined): string {
  if (!perfil) return "—";
  return PERFIL[perfil] ?? perfil;
}

/**
 * Cores dos perfis: laranja, azul, roxo e cinza.
 *
 * Elas diferem também em claridade, não só em tom, para continuarem
 * distinguíveis em escala de cinza e para quem não separa cor.
 */
const CLASSE_PERFIL: Record<PerfilRecorrencia, string> = {
  frequente: "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300",
  prolongado: "border-transparent bg-primary/12 text-primary",
  misto: "border-transparent bg-purple-500/15 text-purple-800 dark:text-purple-300",
  moderado: "border-transparent bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export function classePerfil(perfil: PerfilRecorrencia | null | undefined): string {
  if (!perfil) return CLASSE_PERFIL.moderado;
  return CLASSE_PERFIL[perfil] ?? CLASSE_PERFIL.moderado;
}

/**
 * Legenda dos perfis, como o backend define: é regra de negócio, não texto
 * solto de interface.
 */
export const LEGENDA_PERFIS: { perfil: PerfilRecorrencia; texto: string }[] = [
  { perfil: "frequente", texto: "metade ou mais dos episódios com até 2 dias" },
  { perfil: "prolongado", texto: "algum episódio com 60 dias ou mais" },
  { perfil: "misto", texto: "os dois casos acima" },
  { perfil: "moderado", texto: "nenhum dos dois" },
];

/** Título do agrupamento de `vigentes/resumo`. */
export function rotuloAgrupamento(por: string): string {
  if (por === "tipo") return "Tipo de afastamento";
  if (por === "divisao") return "Secretaria";
  if (por === "cargo") return "Cargo";
  return por;
}

/** `12` + `LICENCA PARA TRATAMENTO DE SAUDE` → `12 · Licença para tratamento de saúde`. */
export function rotuloTipo(reduzido: string, tipo: string): string {
  if (!reduzido) return tipo;
  return `${reduzido} · ${tipo}`;
}

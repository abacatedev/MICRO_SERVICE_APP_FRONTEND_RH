/**
 * Derivações puras da Visão geral (RH).
 *
 * Nada aqui acessa rede ou React: são funções testáveis com as fixtures de
 * `__fixtures__/`. Se o contrato do backend mudar, muda só este arquivo.
 *
 * Regra que vem do backend e não se recalcula no front:
 * - `resumo` e `universo` são contagens oficiais do diagnóstico;
 * - `regras` já chegam ordenadas por gravidade e quantidade.
 */

import type {
  EtapaFunil,
  FatiaTipo,
  KpiRH,
  Painel,
  RegraBarra,
  RegraDoPainel,
  ResumoDivisao,
  SerieDivisao,
  TipoRegra,
} from "./types";

function num(valor: unknown): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) ? n : 0;
}

export function pct(parte: number, total: number): number {
  if (!total) return 0;
  return (parte / total) * 100;
}

const umaCasa = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function fmtPct(valor: number): string {
  return `${umaCasa.format(valor)}%`;
}

/* ------------------------------------------------------------------ */
/* Rótulos                                                             */
/* ------------------------------------------------------------------ */

export const ROTULO_TIPO: Record<TipoRegra, string> = {
  erro: "Erro",
  alerta: "Alerta",
  recadastro: "Recadastro",
  conferencia: "Conferência",
  indicador: "Indicador",
};

/** Cores fixas por tipo de pendência (as três primeiras vêm do guia). */
export const COR_TIPO: Record<TipoRegra, string> = {
  erro: "#B42318",
  alerta: "#E0731F",
  recadastro: "#B7791F",
  conferencia: "#1351B4",
  indicador: "#7A8699",
};

const ORDEM_TIPOS: TipoRegra[] = ["erro", "alerta", "recadastro", "conferencia", "indicador"];

/**
 * O SIP grava o nome da divisão de formas diferentes — "SECRETARIA MUNICIPAL DE
 * SAUDE", "SECRET. MUNICIPAL DE MEIO AMBIENTE…", "SECRETARIA ESPECIAL DE
 * ASSUNTOS ESTRATEGICOS" —, então a primeira regra casa a família inteira:
 * `SECRETARIA`/`SECRET`/`SECR` + ponto opcional, zero ou mais qualificadores
 * (`MUNICIPAL`/`MUN`/`ESPECIAL`) e `DE` opcional.
 *
 * Qualificador é o que diz o **tipo** da divisão, não o que ela faz: por isso
 * "SECRETARIA ESPECIAL DE ASSUNTOS ESTRATEGICOS" vira "Assuntos Estratégicos",
 * do mesmo jeito que "SECRETARIA MUNICIPAL DE SAUDE" vira "Saúde".
 *
 * Antes a lista exigia "SECRETARIA" por extenso e o nome abreviado passava
 * inteiro para o eixo: o gráfico mostrava "Secret. Municipal de Meio Ambiente e
 * Desenvolvimento Econômico" em vez de "Meio Ambiente" (22/10/2026).
 */
const PREFIXOS = [
  // O `(?=\S)` exige que sobre alguma coisa: um nome que seja só o prefixo não
  // pode virar rótulo vazio no eixo.
  /^(?:SECRETARIA|SECRET|SECR)\.?\s+(?:(?:MUNICIPAL|MUN|ESPECIAL)\.?\s+)*(?:DE\s+)?(?=\S)/i,
  /^FUNDO MUNICIPAL DE /i,
  /^FUNDO MUNICIPAL /i,
  /^FUNDO DE /i,
  /^FUNDO /i,
  /^AUTARQUIA MUNICIPAL DE /i,
  /^AUTARQUIA /i,
];

const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "em"]);

/**
 * O SIP grava os nomes sem acento ("EDUCACAO", "SAUDE"). Só reacentuamos as
 * palavras que aparecem em nome de divisão — não é um corretor ortográfico.
 */
const ACENTOS: Record<string, string> = {
  economico: "Econômico",
  educacao: "Educação",
  saude: "Saúde",
  administracao: "Administração",
  assistencia: "Assistência",
  habitacao: "Habitação",
  servicos: "Serviços",
  gestao: "Gestão",
  comunicacao: "Comunicação",
  previdencia: "Previdência",
  promocao: "Promoção",
  financiamento: "Financiamento",
  financas: "Finanças",
  seguranca: "Segurança",
  juridico: "Jurídico",
  juridica: "Jurídica",
  pecuaria: "Pecuária",
  ciencia: "Ciência",
  inovacao: "Inovação",
  basica: "Básica",
  publica: "Pública",
  publico: "Público",
  infraestrutura: "Infraestrutura",
  transito: "Trânsito",
  estrategico: "Estratégico",
  estrategicos: "Estratégicos",
};

/**
 * Rótulos curtos para divisões que o SIP grava por extenso.
 *
 * Casa por **palavras**, não pelo nome inteiro: o SIP varia o final do nome
 * ("…ECONOMICO", "…ECONOMICO E TURISMO", "…ECONOMICO, CULTURA") e uma chave
 * exata pararia de funcionar na primeira variação. Todas as palavras listadas
 * precisam aparecer no nome; a ordem não importa.
 *
 * Fora daqui, o rótulo é o próprio nome sem o prefixo.
 */
const ALIASES: { palavras: string[]; rotulo: string }[] = [
  { palavras: ["meio", "ambiente", "desenvolvimento"], rotulo: "Meio Ambiente" },
];

/** Palavras do nome em minúsculas, sem acento e sem pontuação. */
function palavrasDoNome(texto: string): string[] {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

/**
 * "SECRETARIA MUNICIPAL DE EDUCACAO" → "Educação".
 * O `por-divisao` devolve só o nome, sem código: o rótulo curto é o que cabe
 * no eixo do gráfico.
 */
export function nomeCurtoDivisao(nome: string): string {
  // Espaço duplo (ou não separável) no meio do nome quebraria os prefixos.
  let texto = String(nome ?? "")
    .replace(/\s+/g, " ")
    .trim();
  for (const prefixo of PREFIXOS) texto = texto.replace(prefixo, "");

  const palavras = palavrasDoNome(texto);
  const alias = ALIASES.find(({ palavras: exigidas }) =>
    exigidas.every((palavra) => palavras.includes(palavra)),
  );
  if (alias) return alias.rotulo;

  return texto
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((palavra, indice) => {
      if (indice > 0 && MINUSCULAS.has(palavra)) return palavra;
      const acentuada = ACENTOS[palavra];
      if (acentuada) return acentuada;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

/** `2026-10-20T02:26:36+00:00` → data e hora curtas em pt-BR, no fuso local. */
export function formatarGeradoEm(iso: string): string {
  if (!iso) return "—";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

/* ------------------------------------------------------------------ */
/* KPIs                                                                */
/* ------------------------------------------------------------------ */

export function kpisDoPainel(painel: Painel): KpiRH[] {
  const universo = painel?.universo;
  const resumo = painel?.resumo;

  const vinculos = num(resumo?.vinculos) || num(universo?.vinculos);
  const dependentes = num(universo?.dependentes);
  const comErro = num(resumo?.com_erro);
  const semPendencia = num(resumo?.sem_pendencia);

  const situacoes = (universo?.situacoes ?? []).join(" e ");
  const empresa = universo?.empresa ?? "—";

  return [
    {
      id: "vinculos",
      label: "Vínculos ativos",
      valor: vinculos,
      hint: `Empresa ${empresa}${situacoes ? ` · situações ${situacoes}` : ""}`,
    },
    {
      id: "dependentes",
      label: "Dependentes",
      valor: dependentes,
      badge: vinculos ? `${umaCasa.format(dependentes / vinculos)} / vínculo` : undefined,
      tom: "neutro",
      hint: "Vinculados aos servidores no SIP",
    },
    {
      id: "com_erro",
      label: "Com erro",
      valor: comErro,
      badge: fmtPct(pct(comErro, vinculos)),
      tom: "ruim",
      hint: "Inconsistência que bloqueia o cadastro",
    },
    {
      id: "sem_pendencia",
      label: "Sem pendência",
      valor: semPendencia,
      badge: fmtPct(pct(semPendencia, vinculos)),
      tom: "bom",
      hint: "Cadastro em conformidade",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Pendências por tipo                                                 */
/* ------------------------------------------------------------------ */

/**
 * Soma `servidores` por tipo de regra. Um vínculo pode aparecer em mais de um
 * tipo, então a soma não é o total de vínculos — a tela avisa isso.
 */
export function pendenciasPorTipo(regras: RegraDoPainel[] = []): FatiaTipo[] {
  const mapa = new Map<TipoRegra, number>();

  for (const regra of regras) {
    const tipo = regra?.tipo;
    if (!tipo) continue;
    mapa.set(tipo, (mapa.get(tipo) ?? 0) + num(regra.servidores));
  }

  return ORDEM_TIPOS.filter((tipo) => (mapa.get(tipo) ?? 0) > 0).map((tipo) => ({
    tipo,
    label: ROTULO_TIPO[tipo],
    value: mapa.get(tipo) ?? 0,
    color: COR_TIPO[tipo],
  }));
}

/* ------------------------------------------------------------------ */
/* Situação por secretaria                                             */
/* ------------------------------------------------------------------ */

/**
 * `/rh/diagnostico/por-divisao` devolve a lista direto, mas aceitamos também o
 * envelope `{ divisoes: [...] }` que os endpoints irmãos usam.
 */
export function normalizarDivisoes(
  resposta: ResumoDivisao[] | { divisoes?: ResumoDivisao[] } | null | undefined,
): ResumoDivisao[] {
  if (!resposta) return [];
  if (Array.isArray(resposta)) return resposta;
  return Array.isArray(resposta.divisoes) ? resposta.divisoes : [];
}

/** As `limite` secretarias com mais vínculos com erro, da pior para a melhor. */
export function situacaoPorDivisao(
  divisoes: ResumoDivisao[] = [],
  limite = 12,
): SerieDivisao[] {
  return [...divisoes]
    .filter((linha) => Boolean(linha?.divisao))
    .sort((a, b) => num(b.com_erro) - num(a.com_erro) || num(b.vinculos) - num(a.vinculos))
    .slice(0, limite)
    .map((linha) => ({
      divisao: linha.divisao,
      curto: nomeCurtoDivisao(linha.divisao),
      vinculos: num(linha.vinculos),
      com_erro: num(linha.com_erro),
      com_alerta: num(linha.com_alerta),
      sem_pendencia: num(linha.sem_pendencia),
    }));
}

/* ------------------------------------------------------------------ */
/* Funil de conformidade                                               */
/* ------------------------------------------------------------------ */

/**
 * Funil sobre o `resumo`. A última etapa usa a regra mais grave do painel;
 * etapas que quebrem a monotonicidade são descartadas — melhor um funil de
 * três degraus do que um degrau que cresce.
 */
export function funilConformidade(painel: Painel): EtapaFunil[] {
  const resumo = painel?.resumo;
  const vinculos = num(resumo?.vinculos);
  const comErro = num(resumo?.com_erro);
  const comAlerta = num(resumo?.com_alerta);

  // "Regra mais grave" precisa ser uma pendência de verdade: indicador é perfil,
  // não inconsistência, e não pode fechar o funil.
  const regras = painel?.regras ?? [];
  const maisGrave =
    regras.find((regra) => regra?.tipo === "erro") ??
    regras.find((regra) => regra?.tipo && regra.tipo !== "indicador");

  const candidatas: EtapaFunil[] = [
    { label: "Vínculos ativos", valor: vinculos, taxa: 100 },
    { label: "Com alguma pendência", valor: comErro + comAlerta, taxa: 0 },
    { label: "Com erro", valor: comErro, taxa: 0 },
  ];

  if (maisGrave && num(maisGrave.servidores) > 0) {
    candidatas.push({
      label: "Na regra mais grave",
      valor: num(maisGrave.servidores),
      taxa: 0,
      detalhe: maisGrave.titulo,
    });
  }

  const etapas: EtapaFunil[] = [];
  for (const etapa of candidatas) {
    const anterior = etapas[etapas.length - 1];
    if (anterior && etapa.valor > anterior.valor) continue;
    etapas.push(etapa);
  }

  return etapas.map((etapa) => ({ ...etapa, taxa: pct(etapa.valor, vinculos) }));
}

/* ------------------------------------------------------------------ */
/* Rankings de regras                                                  */
/* ------------------------------------------------------------------ */

function topRegras(
  regras: RegraDoPainel[] = [],
  campo: "servidores" | "ocorrencias",
  limite: number,
): RegraBarra[] {
  const ordenadas = [...regras]
    .filter((regra) => Boolean(regra?.codigo))
    .sort((a, b) => num(b[campo]) - num(a[campo]))
    .slice(0, limite);

  const maior = ordenadas.length ? num(ordenadas[0][campo]) : 0;

  return ordenadas.map((regra) => ({
    codigo: regra.codigo,
    titulo: regra.titulo?.trim() || regra.codigo,
    tipo: regra.tipo,
    valor: num(regra[campo]),
    largura: pct(num(regra[campo]), maior),
    critica: regra.tipo === "erro",
  }));
}

/** Regras que atingem mais vínculos. */
export function regrasPorServidores(regras: RegraDoPainel[] = [], limite = 10): RegraBarra[] {
  return topRegras(regras, "servidores", limite);
}

/** Regras com mais ocorrências (um vínculo pode gerar várias). */
export function regrasPorOcorrencias(regras: RegraDoPainel[] = [], limite = 6): RegraBarra[] {
  return topRegras(regras, "ocorrencias", limite);
}

/* ------------------------------------------------------------------ */
/* Tabela de servidores                                                */
/* ------------------------------------------------------------------ */

export interface ColunaServidor {
  chave: string;
  rotulo: string;
  /** Números vão alinhados à direita. */
  numerica?: boolean;
}

const COLUNAS_PREFERIDAS: { chaves: string[]; rotulo: string; numerica?: boolean }[] = [
  { chaves: ["REGISTRO"], rotulo: "Registro" },
  { chaves: ["NOME", "SERVIDOR"], rotulo: "Servidor" },
  { chaves: ["SITUACAO_NOME", "SITUACAO"], rotulo: "Situação" },
  { chaves: ["DIVISAO_NOME", "DIVISAO"], rotulo: "Divisão" },
  { chaves: ["VINCULO_NOME", "VINCULO"], rotulo: "Vínculo" },
  { chaves: ["CARGO_NOME", "CARGO"], rotulo: "Cargo" },
  { chaves: ["ADMISSAO"], rotulo: "Admissão" },
];

/**
 * O endpoint devolve as colunas cruas do SIP, sem contrato fixo. Descobrimos
 * os nomes a partir do primeiro item e descartamos colunas sem valor algum.
 */
export function colunasDeServidores(itens: Record<string, unknown>[] = []): ColunaServidor[] {
  if (!itens.length) return [];

  const amostra = itens[0] ?? {};

  return COLUNAS_PREFERIDAS.map((coluna) => {
    const encontrada = coluna.chaves.find((chave) => chave in amostra);
    if (!encontrada) return null;

    const temValor = itens.some((item) => {
      const valor = item?.[encontrada];
      return valor !== null && valor !== undefined && String(valor).trim() !== "";
    });
    if (!temValor) return null;

    return { chave: encontrada, rotulo: coluna.rotulo, numerica: coluna.numerica };
  }).filter((coluna): coluna is ColunaServidor => coluna !== null);
}

export function valorDaColuna(item: Record<string, unknown>, chave: string): string {
  const valor = item?.[chave];
  if (valor === null || valor === undefined || valor === "") return "—";
  if (typeof valor === "number") return new Intl.NumberFormat("pt-BR").format(valor);
  return String(valor);
}

export function totalDePaginas(total: number, limite: number): number {
  if (!limite) return 1;
  return Math.max(1, Math.ceil(total / limite));
}

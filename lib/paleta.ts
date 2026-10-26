/**
 * Paleta do produto (Padrão Digital de Governo / gov.br).
 *
 * Único lugar com valores hexadecimais. `lib/raio-x/cores.ts` reexporta estes
 * tokens como `RX` para não quebrar as telas que já existiam; telas novas
 * importam daqui.
 *
 * Fonte: "Raio-X das Secretarias — Guia da interface visual", 20/10/2026.
 */

export const PALETA = {
  /* Fundos, superfícies e bordas */
  fundo: "#F3F6FA",
  /** Superfície do card. Só para atributo SVG: em HTML use `bg-card`. */
  cartao: "#FFFFFF",
  /** Cabeçalho, aba ativa, contorno da seleção, números em destaque. */
  azulEscuro: "#0C2350",
  borda: "#DCE3EC",
  /** Borda do seletor, pílulas desligadas, linha de base dos gráficos. */
  entrada: "#C9D3E1",
  /** Linhas entre linhas da tabela e colunas vazias. */
  bordaSuave: "#E6EBF2",
  trilho: "#EEF2F7",
  /** Borda tracejada do aviso "Aguardando a consulta". */
  tracejado: "#9AA6BA",

  /* Texto */
  texto: "#14213D",
  textoSec: "#56637A",
  /** Rótulo dentro dos cards de regra. */
  rotulo: "#3A465C",
  /** Subtítulo sobre o azul-marinho. */
  sobreAzulSuave: "#DCE6F5",

  /* Ação e seleção */
  azul: "#1351B4",
  azulHover: "#0C326F",
  azulClaro: "#DBE8FB",
  azulSuave: "#EAF1FC",

  /* Estados */
  critico: "#B42318",
  criticoBg: "#FDECEA",
  criticoBorda: "#F1B8B2",
  /** Alertas, "subdivisão errada", "Local não identificado". */
  ambar: "#B9470E",
  /** Coluna de secretaria acima da média da Prefeitura. */
  laranja: "#E0731F",
  /** Parte "demais regras" das colunas empilhadas. */
  cinzaOutras: "#D5DCE6",
  /** Fatia "Demais" das roscas. */
  demais: "#7A8699",

  /* Série dos gráficos */
  roxo: "#8E4EC6",
  verde: "#2A9D8F",
  ouro: "#B7791F",
  vermelho: "#C23B5E",

  /*
   * Faixa etária dos dependentes (aba Inconsistências) — exceção combinada em
   * 22/10/2026: aqui a cor marca uma condição de negócio ("exige comprovação"),
   * não volume. Por isso foge da rampa azul de `GRAFICO`, e só neste gráfico.
   */
  desconformidade: "#C2850C",
  desconformidadeLeve: "#FFCD07",
} as const;

/** Ordem fixa da série categórica, aplicada às fatias e às regras. */
export const CATEGORICAS = [
  "#1351B4",
  "#E0731F",
  "#2A9D8F",
  "#8E4EC6",
  "#C23B5E",
  "#B7791F",
] as const;

export function corDaFatia(indice: number): string {
  return CATEGORICAS[indice % CATEGORICAS.length];
}

/**
 * Paleta definitiva dos gráficos do Raio-X (21/10/2026).
 *
 * Substitui o uso de `critico`/`laranja` nas séries: pendência em gráfico não
 * é erro de sistema, é volume a comparar. Por isso a leitura é monocromática
 * em azul, com cinza para o que é "resto".
 *
 * - `principal` — barras principais e a regra em foco
 * - `escuro` — destaque, comparação entre séries e item selecionado
 * - `claro` — série secundária
 * - `verde` — indicador positivo, quando aplicável
 * - `cinza` — demais vínculos e séries neutras
 * - `cinzaClaro` — grades, linhas de referência e divisores
 */
export const GRAFICO = {
  principal: "#1351B4",
  escuro: "#0C326F",
  claro: "#5992ED",
  verde: "#168821",
  cinza: "#6C757D",
  cinzaClaro: "#D8DEE8",
} as const;

/**
 * Uma cor por pendência, na ordem dos cards (`ORDEM_CARDS`).
 *
 * A cor identifica o **grupo** — azul para Dependentes, cinza para Contato do
 * servidor — e o tom separa as pendências vizinhas na pilha, alternando claro
 * e escuro para que duas fatias encostadas nunca tenham a mesma luminosidade.
 *
 * Laranja fica de fora de propósito: no Comparativo ele marca "acima da
 * Prefeitura", e uma cor com dois significados na mesma tela não significa
 * nada. Quem garante a leitura é a ordem fixa, a legenda e o tooltip; os
 * números exatos estão na tabela logo abaixo.
 */
export const CORES_PENDENCIA = {
  cert: "#0C326F",
  depCpf: "#5B8DEF",
  depNasc: "#16407F",
  irrf: "#9FC0F5",
  salfam: "#2E63C8",
  semEmail: "#6C757D",
  semFone: "#B3BDC9",
} as const;

/**
 * Equivalente de cada cor da paleta no tema escuro.
 *
 * Superfícies, texto e bordas já viram classes semânticas (`bg-card`,
 * `text-muted-foreground`, `border-border`) e não passam por aqui. Este mapa
 * existe para o que **não** pode ser classe: atributos SVG dos gráficos
 * (`fill`, `stroke`), largura de barra calculada em runtime e as cores de
 * série, que são identidade e por isso não podem virar token.
 *
 * Os valores escuros espelham `--chart-*` e `--border` de `app/globals.css`
 * para que gráfico e interface não divirjam.
 */
const ESCURO: Record<string, string> = {
  /* Série categórica */
  [PALETA.azul]: "#6AA2F8",
  [PALETA.laranja]: "#F0904F",
  [PALETA.verde]: "#4BBFAE",
  [PALETA.roxo]: "#A97AD9",
  [PALETA.vermelho]: "#D96B88",
  [PALETA.ouro]: "#CFA14A",
  [PALETA.demais]: "#8B97A9",
  [PALETA.critico]: "#F2776A",
  [PALETA.ambar]: "#F08A4B",
  [PALETA.cinzaOutras]: "#33445F",
  /* Dourado/amarelo da faixa etária: no escuro o amarelo puro ofusca. */
  [PALETA.desconformidade]: "#E0A93A",
  [PALETA.desconformidadeLeve]: "#F2CE5C",

  /* Rampa das sete pendências (Comparativo) */
  [CORES_PENDENCIA.depCpf]: "#8FB4F2",
  [CORES_PENDENCIA.depNasc]: "#4E86E8",
  [CORES_PENDENCIA.irrf]: "#C7DBFA",
  [CORES_PENDENCIA.salfam]: "#6AA2F8",
  [CORES_PENDENCIA.semFone]: "#CBD5E1",

  /* Cromo dos gráficos */
  [PALETA.borda]: "#22314B",
  [PALETA.entrada]: "#22314B",
  [PALETA.bordaSuave]: "#22314B",
  [PALETA.trilho]: "#17233A",
  [PALETA.tracejado]: "#3A4C6B",

  /* Texto e seleção */
  [PALETA.cartao]: "#101A2B",
  [PALETA.fundo]: "#17233A",
  [PALETA.texto]: "#E6EDF7",
  [PALETA.textoSec]: "#94A6BF",
  [PALETA.rotulo]: "#94A6BF",
  [PALETA.azulEscuro]: "#E6EDF7",
  [PALETA.azulClaro]: "#1B2A44",
  [PALETA.azulSuave]: "#1B2A44",
  [PALETA.criticoBg]: "#2C1512",
  [PALETA.criticoBorda]: "#5B2A24",
};

/**
 * A rampa azul no escuro precisa inverter a ordem de luminosidade para as três
 * continuarem distinguíveis sobre `--card` (#101A2B): o "escuro" deixa de ser
 * o mais apagado e vira um azul profundo ainda saturado.
 */
const GRAFICO_ESCURO: Record<string, string> = {
  [GRAFICO.principal]: "#6AA2F8",
  [GRAFICO.escuro]: "#3B6FD4",
  [GRAFICO.claro]: "#9CC0FF",
  [GRAFICO.verde]: "#4ADE80",
  [GRAFICO.cinza]: "#9BA6B4",
  [GRAFICO.cinzaClaro]: "#22314B",
};

const ESCURO_TOTAL: Record<string, string> = { ...ESCURO, ...GRAFICO_ESCURO };

/** Converte uma cor da paleta para o tema pedido. Cor desconhecida volta igual. */
export function corNoTema(cor: string, escuro: boolean): string {
  return escuro ? (ESCURO_TOTAL[cor] ?? cor) : cor;
}


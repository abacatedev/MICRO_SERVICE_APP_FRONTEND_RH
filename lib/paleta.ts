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

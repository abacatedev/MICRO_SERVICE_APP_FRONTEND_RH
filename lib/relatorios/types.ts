/** Tipos da API de Relatórios (`/rh/relatorios`). */

export type TipoColuna = "texto" | "numero" | "data" | "sim_nao" | "percentual" | "lista";
export type TipoFiltro = "selecao" | "multipla" | "numero" | "data" | "booleano";
export type NaturezaRelatorio = "nominal" | "agregado";

export interface ColunaCatalogo {
  id: string;
  rotulo: string;
  tipo: TipoColuna;
  padrao: boolean;
  sensivel: boolean;
}

export interface OpcaoFiltro {
  valor: string;
  rotulo: string;
}

export interface FiltroCatalogo {
  id: string;
  rotulo: string;
  tipo: TipoFiltro;
  opcoes: OpcaoFiltro[] | null;
  opcoes_das_linhas: boolean;
  dominio: string | null;
  padrao: unknown;
  obrigatorio: boolean;
  minimo?: number;
  maximo?: number;
  ajuda?: string;
  somente?: boolean;
}

export interface OrdemPadrao {
  coluna: string;
  decrescente: boolean;
}

export interface RelatorioCatalogo {
  id: string;
  grupo: string;
  titulo: string;
  descricao: string;
  natureza: NaturezaRelatorio;
  busca: boolean;
  agrupar_por_pessoa: boolean;
  colunas: ColunaCatalogo[];
  filtros: FiltroCatalogo[];
  ordem_padrao: OrdemPadrao;
  fichas: string[];
}

export interface CatalogoRelatorios {
  pode_ver_dados_sensiveis: boolean;
  relatorios: RelatorioCatalogo[];
}

/* ------------------------------------------------------------------ */
/* Resposta de execução                                               */
/* ------------------------------------------------------------------ */

export interface ColunaResposta {
  id: string;
  rotulo: string;
  tipo: TipoColuna;
}

export interface TotalAgregado {
  coluna: string;
  valor: number | string | null;
}

export interface ItemRelatorio {
  [key: string]: unknown;
}

export interface OpcoesResposta {
  [filtroId: string]: { valor: string; rotulo: string; total: number }[];
}

export interface ContextoRegra {
  titulo: string;
  descricao: string;
  orientacao: string;
}

export interface ContextoRelatorio {
  regra?: ContextoRegra;
  [key: string]: unknown;
}

export interface FiltroAplicado {
  id: string;
  rotulo: string;
  valor: unknown;
}

export interface RespostaRelatorio {
  relatorio: string;
  data_referencia: string | null;
  gerado_em: string;
  contexto: ContextoRelatorio;
  filtros: FiltroAplicado[];
  q: string | null;
  agrupado_por_pessoa: boolean;
  ordenado_por: string;
  direcao: "asc" | "desc";
  total_carregado: number;
  total: number;
  pagina: number;
  por_pagina: number;
  opcoes: OpcoesResposta;
  totais: TotalAgregado[] | null;
  colunas: ColunaResposta[];
  itens: ItemRelatorio[];
}

/* ------------------------------------------------------------------ */
/* Parâmetros de consulta                                             */
/* ------------------------------------------------------------------ */

export interface ParametrosRelatorio {
  q?: string;
  colunas?: string[];
  agrupar?: boolean;
  ordenar?: string;
  direcao?: "asc" | "desc";
  pagina?: number;
  por_pagina?: number;
  [filtroId: string]: unknown;
}

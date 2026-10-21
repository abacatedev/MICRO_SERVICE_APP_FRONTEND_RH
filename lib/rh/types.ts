/** Contrato da API do RH (Pré-Censo) — espelha o OpenAPI do backend. */

export type TipoRegra = "erro" | "alerta" | "recadastro" | "conferencia" | "indicador";
export type AlvoRegra = "dependente" | "servidor";

export interface Universo {
  empresa: string;
  situacoes: string[];
  vinculos: number;
  dependentes: number;
}

export interface Resumo {
  vinculos: number;
  com_erro: number;
  com_alerta: number;
  sem_pendencia: number;
}

export interface RegraDoPainel {
  codigo: string;
  titulo: string;
  tipo: TipoRegra;
  alvo: AlvoRegra;
  descricao: string;
  orientacao: string;
  /** Vínculos com a pendência. */
  servidores: number;
  /** Quantas vezes a pendência aparece. */
  ocorrencias: number;
}

/** `/rh/diagnostico` */
export interface Painel {
  gerado_em: string;
  universo: Universo;
  resumo: Resumo;
  /** Já ordenadas por gravidade e quantidade. */
  regras: RegraDoPainel[];
}

/** `/rh/diagnostico/por-divisao` — uma linha por secretaria, da pior para a melhor. */
export interface ResumoDivisao {
  divisao: string;
  vinculos: number;
  com_erro: number;
  com_alerta: number;
  sem_pendencia: number;
}

/** `/rh/servidores` — `itens` são colunas cruas do SIP, sem contrato fixo. */
export interface ListaServidores {
  total: number;
  pagina: number;
  limite: number;
  itens: Record<string, unknown>[];
}

/** `/rh/me` */
export interface UsuarioRH {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  exp: number;
  sessao_expira_em: string | null;
}

/* ------------------------------------------------------------------ */
/* Modelo da tela                                                      */
/* ------------------------------------------------------------------ */

export type TomBadge = "neutro" | "bom" | "ruim";

export interface KpiRH {
  id: string;
  label: string;
  valor: number;
  /** Texto curto do selo (percentual, razão…). */
  badge?: string;
  tom?: TomBadge;
  hint: string;
}

export interface FatiaTipo {
  label: string;
  value: number;
  color: string;
  tipo: TipoRegra;
}

export interface SerieDivisao {
  divisao: string;
  curto: string;
  vinculos: number;
  com_erro: number;
  com_alerta: number;
  sem_pendencia: number;
}

export interface EtapaFunil {
  label: string;
  valor: number;
  /** Percentual sobre a primeira etapa. */
  taxa: number;
  detalhe?: string;
}

export interface RegraBarra {
  codigo: string;
  titulo: string;
  tipo: TipoRegra;
  valor: number;
  largura: number;
  critica: boolean;
}

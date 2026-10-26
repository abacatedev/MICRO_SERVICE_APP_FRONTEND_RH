/**
 * Contrato das rotas de afastamentos do backend do RH.
 *
 * Os nomes de campo seguem o JSON da API, em snake_case, para não haver
 * tradução silenciosa entre back e front. A tradução para a tela (datas, rótulos
 * de status, perfis) fica em `formato.ts`.
 *
 * Datas chegam em ISO (`2026-09-29`); `null` quando o SIP não tem o dado.
 */

export type StatusEsocial = "valido" | "aguardando" | "nao_enviado" | "invalido" | "sem_status";

export type PerfilRecorrencia = "frequente" | "prolongado" | "misto" | "moderado";

export type Agrupamento = "tipo" | "divisao" | "cargo";

/* ------------------------------------------------------------------ */
/* Referência                                                          */
/* ------------------------------------------------------------------ */

export interface Referencia {
  /** Data da cópia do SIP: todos os números da página são desta data. */
  data_copia: string;
  origem: string;
  ultimo_dtini: string | null;
}

/* ------------------------------------------------------------------ */
/* Vigentes na data                                                    */
/* ------------------------------------------------------------------ */

export interface ResumoItem {
  codigo: string;
  nome: string;
  vinculos: number;
  afastamentos: number;
}

export interface VigentesResumo {
  data_referencia: string;
  agrupado_por: Agrupamento;
  total_vinculos: number;
  total_afastamentos: number;
  itens: ResumoItem[];
}

export interface Afastamento {
  registro: string;
  matricula: string | null;
  nome: string;
  cpf: string | null;
  situacao_vinculo_nome: string | null;
  divisao_codigo: string | null;
  divisao: string | null;
  cargo_codigo: string | null;
  cargo: string | null;
  item: string;
  reduzido: string;
  tipo: string;
  causa: string | null;
  dtini: string;
  dtfim: string | null;
  /** Dia em que a pessoa **volta**. O último dia afastado é a véspera. */
  retorno_previsto: string | null;
  duracao_dias: number;
  sem_remuneracao: boolean;
  status_esocial: StatusEsocial;
  motivo_codigo: string | null;
  documento_tipo: string | null;
  documento_numero: string | null;
  documento_data: string | null;
}

export interface Vigentes {
  data_referencia: string;
  total: number;
  vinculos: number;
  itens: Afastamento[];
}

/* ------------------------------------------------------------------ */
/* Retornos previstos                                                  */
/* ------------------------------------------------------------------ */

export interface RetornoItem extends Afastamento {
  dias_ate_retorno: number;
  /** `true` = a pessoa não volta: começa outro afastamento em seguida. */
  emenda_outro_afastamento: boolean;
}

export interface Retornos {
  data_referencia: string;
  total: number;
  ate: string;
  itens: RetornoItem[];
}

/* ------------------------------------------------------------------ */
/* Linha do tempo                                                      */
/* ------------------------------------------------------------------ */

export interface MesSerie {
  /** `2026-09` */
  mes: string;
  ate: string;
  /** O último mês quase sempre vem parcial: vai só até a cópia do SIP. */
  mes_incompleto: boolean;
  afastamentos_iniciados: number;
  vinculos_afastados_no_mes: number;
  vinculos_afastados_no_fim_do_mes: number;
  dias_afastados: number;
}

export interface SerieMensal {
  data_referencia: string;
  meses: number;
  itens: MesSerie[];
}

/* ------------------------------------------------------------------ */
/* Absenteísmo                                                         */
/* ------------------------------------------------------------------ */

export interface AbsenteismoLinha {
  divisao: string;
  vinculos: number;
  vinculos_afastados: number;
  dias_afastados: number;
  percentual_dias_afastados: number;
}

export interface DiasPorTipo {
  reduzido: string;
  tipo: string;
  dias_afastados: number;
}

export interface Absenteismo {
  data_referencia: string;
  periodo: { inicio: string; ate: string; dias: number };
  total: AbsenteismoLinha;
  itens: AbsenteismoLinha[];
  dias_por_tipo: DiasPorTipo[];
  observacao: string | null;
}

/* ------------------------------------------------------------------ */
/* Acumulado no ano e afastamentos longos                              */
/* ------------------------------------------------------------------ */

export interface AcumuladoItem {
  registro: string;
  matricula: string | null;
  nome: string;
  cpf: string | null;
  divisao: string | null;
  cargo: string | null;
  dias_afastado: number;
  afastamentos: number;
  /** `{ "12 LICENCA...": 30 }` — dias por tipo de afastamento. */
  dias_por_tipo: Record<string, number>;
}

export interface Acumulado {
  data_referencia?: string;
  itens: AcumuladoItem[];
}

export interface AfastamentoVigenteResumo {
  item: string;
  reduzido: string;
  tipo: string;
  dtini: string;
  retorno_previsto: string | null;
}

export interface LongoItem {
  registro: string;
  matricula: string | null;
  nome: string;
  cpf: string | null;
  divisao: string | null;
  cargo: string | null;
  afastado_desde: string;
  dias_continuos: number;
  sem_remuneracao: boolean;
  afastamentos_vigentes: AfastamentoVigenteResumo[];
}

export interface Longos {
  itens: LongoItem[];
}

/* ------------------------------------------------------------------ */
/* Recorrentes                                                         */
/* ------------------------------------------------------------------ */

export interface Episodio {
  inicio: string;
  retorno: string | null;
  dias: number;
  lancamentos: number;
}

export interface RecorrenteItem {
  registro: string;
  matricula: string | null;
  nome: string;
  cpf: string | null;
  divisao: string | null;
  cargo: string | null;
  perfil: PerfilRecorrencia;
  fator_bradford: number;
  episodios: number;
  /** Episódios com até 2 dias. */
  episodios_curtos: number;
  maior_episodio_dias: number;
  lancamentos: number;
  dias_afastado: number;
  tipos: Record<string, number>;
  lista_episodios: Episodio[];
}

export interface Recorrentes {
  data_referencia: string;
  total: number;
  ano: number;
  total_por_perfil: Record<PerfilRecorrencia, number>;
  legenda?: Record<string, string> | string | null;
  itens: RecorrenteItem[];
}

/* ------------------------------------------------------------------ */
/* Histórico de um servidor                                            */
/* ------------------------------------------------------------------ */

export interface Lancamento {
  item: string;
  reduzido: string;
  tipo: string;
  causa_nome: string | null;
  temporario: boolean;
  vigente: boolean;
  dtini: string;
  dtfim: string | null;
  retorno_previsto: string | null;
  duracao_dias: number;
  status_esocial: StatusEsocial;
  documento_tipo: string | null;
  documento_numero: string | null;
  documento_data: string | null;
  /** `"S"` ou `"N"` */
  abate_temposervico: string;
  abate_tempocontrib: string;
  abate_ferias: string;
  abate_licencapremio: string;
}

export interface HistoricoServidor {
  data_referencia: string;
  servidor: {
    registro: string;
    matricula: string | null;
    nome: string;
    cpf: string | null;
    situacao_vinculo_nome: string | null;
    divisao: string | null;
    cargo: string | null;
  };
  resumo: {
    afastado_na_data: boolean;
    afastado_continuamente_desde: string | null;
    dias_afastado_no_ano: number;
    total_lancamentos: number;
    total_afastamentos_temporarios: number;
  };
  lancamentos: Lancamento[];
}

/* ------------------------------------------------------------------ */
/* eSocial                                                             */
/* ------------------------------------------------------------------ */

export interface EsocialItem {
  reduzido: string;
  tipo: string;
  /** `null` = o tipo não tem motivo eSocial configurado no SIP. */
  motivo_esocial: { codigo: string; descricao: string } | null;
  total: number;
  por_status: Partial<Record<StatusEsocial, number>>;
  sem_status_por_duracao: {
    ate_15_dias: number;
    mais_de_15_dias: number;
    em_aberto: number;
  };
}

export interface EsocialResumo {
  desde: string;
  totais: Record<StatusEsocial, number> & { total: number };
  itens: EsocialItem[];
  observacao: string | null;
}

export interface TipoComProblema {
  reduzido: string;
  tipo: string;
  lancamentos_desde: number;
  ultimo_uso: string | null;
  problema: string;
}

export interface TiposComProblema {
  itens: TipoComProblema[];
}

/** Lista nominal de pendências do eSocial. Campos podem faltar conforme o status. */
export interface PendenciaEsocial {
  registro?: string;
  matricula?: string | null;
  nome?: string;
  cpf?: string | null;
  divisao?: string | null;
  cargo?: string | null;
  tipo?: string;
  reduzido?: string;
  dtini?: string;
  retorno_previsto?: string | null;
  status_esocial?: StatusEsocial;
}

export interface PendenciasEsocial {
  itens: PendenciaEsocial[];
}

/* ------------------------------------------------------------------ */
/* Erros de lançamento                                                 */
/* ------------------------------------------------------------------ */

export type RegraInconsistencia =
  | "sobrepostos"
  | "sem-tipo"
  | "tipo-descontinuado"
  | "desligado-com-afastamento";

export interface InconsistenciaResumoItem {
  regra: RegraInconsistencia | string;
  descricao: string;
  total: number;
}

export interface InconsistenciasResumo {
  itens: InconsistenciaResumoItem[];
}

/**
 * Uma linha de lista de inconsistência.
 *
 * O backend não documenta os campos de cada regra além de `sobrepostos` (que
 * traz `a_*`, `b_*` e `dias_sobrepostos`), então a linha é lida como registro
 * aberto e a tela mostra só o que veio.
 */
export type LinhaInconsistencia = Record<string, string | number | boolean | null>;

export interface ListaInconsistencia {
  itens: LinhaInconsistencia[];
}

/* ------------------------------------------------------------------ */
/* Gerencial — Visão geral                                             */
/* ------------------------------------------------------------------ */

export interface AfastadosPorTipoGerencial {
  nome: string;
  vinculos: number;
}

export interface AfastadosNaDataGerencial {
  vinculos: number;
  por_tipo: AfastadosPorTipoGerencial[];
}

export interface Retornos7DiasGerencial {
  total: number;
  emendam_outro_afastamento: number;
}

export interface AbsenteismoTotalGerencial {
  percentual_dias_afastados: number;
  dias_afastados: number;
}

export interface AbsenteismoMesGerencial {
  total: AbsenteismoTotalGerencial;
}

export interface LinhaDoTempoGerencial {
  vinculos_afastados_no_fim_do_mes: number;
  mes_incompleto: boolean;
}

export interface EsocialTotaisGerencial {
  sem_status: number;
}

export interface TipoSemMotivoGerencial {
  reduzido: string;
}

export interface EsocialNoAnoGerencial {
  totais: EsocialTotaisGerencial;
  tipos_sem_motivo: TipoSemMotivoGerencial[];
}

export interface InconsistenciaGerencial {
  regra: string;
  total: number;
}

export interface Gerencial {
  data_referencia: string;
  afastados_na_data: AfastadosNaDataGerencial;
  retornos_em_7_dias: Retornos7DiasGerencial;
  absenteismo_mes: AbsenteismoMesGerencial;
  linha_do_tempo: LinhaDoTempoGerencial[];
  esocial_no_ano: EsocialNoAnoGerencial;
  afastados_longos_sem_remuneracao: number;
  inconsistencias: InconsistenciaGerencial[];
}

/* ------------------------------------------------------------------ */
/* Exportação                                                          */
/* ------------------------------------------------------------------ */

export type RelatorioExportavel =
  | "vigentes"
  | "retornos"
  | "longos"
  | "acumulado"
  | "recorrentes"
  | "esocial-pendencias";

/* ------------------------------------------------------------------ */
/* Filtros da tela                                                     */
/* ------------------------------------------------------------------ */

export interface FiltrosAfastamentos {
  /** `"ALL"` ou o código da divisão. */
  sec: string;
  /** Ano de referência dos blocos anuais; `""` = todos. */
  ano: string;
  /** `reduzido` do tipo de afastamento; `""` = todos. */
  tipo: string;
}

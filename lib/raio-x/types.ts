/** Tipos do domínio da tela "Raio-X das Secretarias". */

export type RegraId = "irrf" | "salfam" | "depCpf" | "depNasc" | "cert" | "semEmail" | "semFone";

export type Aba = "regra" | "quadro" | "qualidade" | "tabela";

export type MinVinc = 1 | 30 | 100;

export interface Secretaria {
  cod: string;
  curto: string;
  vinc: number;
  deps: number;
  depCpf: number;
  depNasc: number;
  cert: number;
  irrf: number;
  salfam: number;
  lotSetor: number;
  semEmail: number;
  semFone: number;
  confP5: number;
}

export interface RegraDef {
  id: RegraId;
  label: string;
  critica: boolean;
}

export interface FiltroState {
  sec: string;
  regra: RegraId;
  minVinc: MinVinc;
  aba: Aba;
}

export type Totais = Pick<
  Secretaria,
  "vinc" | "deps" | "irrf" | "salfam" | "depCpf" | "depNasc" | "cert" | "semEmail" | "semFone"
>;

export interface PontoSecretaria {
  cod: string;
  curto: string;
  vinc: number;
  valor: number;
  rotulo: string;
  acima: boolean;
  selecionada: boolean;
}

export interface VolumePonto {
  cod: string;
  curto: string;
  foco: number;
  demais: number;
  total: number;
  selecionada: boolean;
}

export interface RankingItem {
  cod: string;
  curto: string;
  valor: number;
  largura: number;
  selecionada: boolean;
}

export interface Fatia {
  label: string;
  value: number;
  color: string;
  cod?: string;
  detalhe?: string;
}

export interface CategoriaQualidade {
  label: string;
  detalhe: string;
  value: number;
  color: string;
}

export interface Alerta {
  n: string;
  t: string;
  d: string;
}

export interface RaioXData {
  secretarias: Secretaria[];
  /** Linha `ALL` da API: totais da Prefeitura. Nunca é soma das divisões. */
  total: Secretaria;
  /** Cartões na ordem e com os títulos que o backend manda. */
  cartoes: RegraDef[];
  locais: Record<string, [string, number][]>;
  cargos: Record<string, [string, number][]>;
  tipoVinculo: [string, number][];
  pisFicticio: Record<string, number>;
  alertas: Alerta[];
  faixaDependentes: Record<string, number>;
  atualizadoEm: string;
}

export type LocalTuple = [string, number];
export type CargoTuple = [string, number];

/* ------------------------------------------------------------------ */
/* Contrato da API (FastAPI) — espelha o Swagger do backend do RH.     */
/* ------------------------------------------------------------------ */

export interface Cartao {
  id: string;
  titulo: string;
  regras: string[];
  critica: boolean;
}

export interface LinhaDivisao {
  /** '000006' por secretaria, 'ALL' no total, 'SEM' para vínculos sem divisão. */
  codigo: string;
  nome: string;
  vinculos: number;
  com_erro: number;
  com_alerta: number;
  sem_pendencia: number;
  dependentes: number;
  /** % sem pendência, 0–100. */
  conformidade: number;
  /** Vínculos distintos por id de cartão. */
  cartoes: Record<string, number>;
  /** Vínculos distintos por código de regra (D01, S02…). */
  regras: Record<string, number>;
}

export interface RaioXRegras {
  gerado_em: string;
  cartoes: Cartao[];
  total: LinhaDivisao;
  divisoes: LinhaDivisao[];
}

export interface ItemContagem {
  nome: string;
  vinculos: number;
}

export interface PerfilDivisao {
  locais: ItemContagem[];
  cargos: ItemContagem[];
  tipos_vinculo: ItemContagem[];
}

export interface RaioXPerfil {
  gerado_em: string;
  minimos: { local: number; cargo: number };
  divisoes: Record<string, PerfilDivisao>;
}

export type TipoRegra = "erro" | "alerta" | "recadastro" | "conferencia" | "indicador";

export interface RegraDiagnostico {
  codigo: string;
  titulo: string;
  tipo: TipoRegra;
  alvo: "dependente" | "servidor";
  descricao: string;
  orientacao: string;
  servidores: number;
  ocorrencias: number;
}

export interface DiagnosticoPainel {
  gerado_em: string;
  universo: {
    empresa: string;
    situacoes: string[];
    vinculos: number;
    dependentes: number;
  };
  resumo: {
    vinculos: number;
    com_erro: number;
    com_alerta: number;
    sem_pendencia: number;
  };
  regras: RegraDiagnostico[];
}

/** Resposta de `/rh/me`. Campos extras são tolerados. */
export interface SessaoRH {
  nome?: string;
  email?: string;
  permissoes?: string[];
  [chave: string]: unknown;
}

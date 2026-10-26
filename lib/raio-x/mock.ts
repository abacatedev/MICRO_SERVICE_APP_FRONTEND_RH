/**
 * Dados agregados reais do SIP (empresa 001, situação 1 e 3).
 * Fonte: 02_painel_real.sql sobre SIP_ANALISE_2 — nenhum dado pessoal.
 * Substituir por `useRaioX()` quando o endpoint agregado existir.
 */

import type {
  Alerta,
  FaixaDependentes,
  IndicadorFaixas,
  RaioXData,
  RegraDef,
  Secretaria,
} from "./types";

export const REGRAS: RegraDef[] = [
  { id: "irrf", label: "IRRF acima da idade", critica: false },
  { id: "salfam", label: "Salário-família acima de 14", critica: false },
  { id: "depCpf", label: "Dependente sem CPF", critica: false },
  { id: "depNasc", label: "Dependente sem nascimento", critica: false },
  { id: "cert", label: "Certidão incompleta", critica: true },
  { id: "semEmail", label: "Servidor sem e-mail", critica: false },
  { id: "semFone", label: "Servidor sem telefone", critica: false },
];

export const SECRETARIAS: Secretaria[] = [
  { cod: "000006", curto: "Educação", vinc: 1416, deps: 1937, depCpf: 141, depNasc: 2, cert: 700, irrf: 198, salfam: 179, lotSetor: 0, semEmail: 77, semFone: 13, confP5: 44.2 },
  { cod: "000005", curto: "Saúde", vinc: 532, deps: 594, depCpf: 100, depNasc: 2, cert: 186, irrf: 127, salfam: 143, lotSetor: 0, semEmail: 83, semFone: 31, confP5: 48.8 },
  { cod: "000011", curto: "Assistência Social", vinc: 130, deps: 159, depCpf: 19, depNasc: 0, cert: 53, irrf: 33, salfam: 30, lotSetor: 0, semEmail: 17, semFone: 4, confP5: 46.1 },
  { cod: "000003", curto: "Administração", vinc: 85, deps: 131, depCpf: 16, depNasc: 0, cert: 43, irrf: 21, salfam: 22, lotSetor: 0, semEmail: 12, semFone: 5, confP5: 36.4 },
  { cod: "000001", curto: "Gabinete", vinc: 60, deps: 36, depCpf: 3, depNasc: 0, cert: 12, irrf: 3, salfam: 4, lotSetor: 0, semEmail: 2, semFone: 0, confP5: 76.6 },
  { cod: "000013", curto: "Fazenda", vinc: 56, deps: 52, depCpf: 2, depNasc: 1, cert: 14, irrf: 11, salfam: 12, lotSetor: 0, semEmail: 0, semFone: 1, confP5: 55.3 },
  { cod: "000007", curto: "Infraestrutura", vinc: 55, deps: 68, depCpf: 12, depNasc: 0, cert: 27, irrf: 17, salfam: 20, lotSetor: 55, semEmail: 5, semFone: 2, confP5: 0.0 },
  { cod: "000008", curto: "Turismo e Cultura", vinc: 36, deps: 65, depCpf: 8, depNasc: 0, cert: 20, irrf: 12, salfam: 10, lotSetor: 36, semEmail: 6, semFone: 3, confP5: 0.0 },
  { cod: "000014", curto: "Meio Ambiente", vinc: 19, deps: 16, depCpf: 1, depNasc: 0, cert: 4, irrf: 4, salfam: 5, lotSetor: 0, semEmail: 3, semFone: 0, confP5: 68.4 },
  { cod: "000012", curto: "Esporte e Lazer", vinc: 18, deps: 30, depCpf: 6, depNasc: 0, cert: 6, irrf: 7, salfam: 7, lotSetor: 0, semEmail: 8, semFone: 1, confP5: 38.8 },
  { cod: "000004", curto: "Finanças", vinc: 17, deps: 19, depCpf: 3, depNasc: 0, cert: 8, irrf: 6, salfam: 5, lotSetor: 0, semEmail: 2, semFone: 1, confP5: 47.0 },
  { cod: "000002", curto: "Assuntos Estratégicos", vinc: 15, deps: 18, depCpf: 4, depNasc: 0, cert: 5, irrf: 5, salfam: 3, lotSetor: 15, semEmail: 0, semFone: 0, confP5: 0.0 },
  { cod: "000010", curto: "Agricultura", vinc: 12, deps: 14, depCpf: 1, depNasc: 0, cert: 3, irrf: 2, salfam: 2, lotSetor: 0, semEmail: 1, semFone: 0, confP5: 58.3 },
  { cod: "000009", curto: "Planejamento", vinc: 12, deps: 7, depCpf: 1, depNasc: 0, cert: 2, irrf: 1, salfam: 1, lotSetor: 0, semEmail: 2, semFone: 0, confP5: 83.3 },
];

export const TIPO_VINCULO: [string, number][] = [
  ["Efetivo", 1650],
  ["Contratado", 610],
  ["Estatutário – agentes", 70],
  ["Comissionado", 65],
  ["Estagiário", 52],
  ["Outros", 16],
];

export const PIS_FICTICIO: Record<string, number> = { "000005": 1 };

export const FAIXA_DEPENDENTES: Record<string, number> = {};

export const FAIXAS_ETARIAS = [
  "0-13",
  "14-17",
  "18-20",
  "21-23",
  "24-29",
  "30-39",
  "40+",
  "Sem data",
] as const;

/**
 * Fixture do indicador `faixa-dependentes`, só para `NEXT_PUBLIC_RAIO_X_MOCK=true`.
 *
 * Fecha com os totais da Prefeitura: 3.150 dependentes e 964 em desconformidade.
 * `em_desconformidade` é a união de `irrf_fora_do_limite` com
 * `salario_familia_fora_do_limite`, então nunca é a soma dos dois.
 */
const FAIXAS_DEPENDENTES_MOCK: FaixaDependentes[] = [
  {
    faixa: "0-13", idade_minima: 0, idade_maxima: 13, exige_comprovacao: false,
    dependentes: 1315, irrf: 0, salario_familia: 90, universitario: 0, deficiente: 14,
    irrf_fora_do_limite: 0, salario_familia_fora_do_limite: 0, em_desconformidade: 0,
  },
  {
    faixa: "14-17", idade_minima: 14, idade_maxima: 17, exige_comprovacao: false,
    dependentes: 620, irrf: 0, salario_familia: 200, universitario: 0, deficiente: 8,
    irrf_fora_do_limite: 0, salario_familia_fora_do_limite: 180, em_desconformidade: 180,
  },
  {
    faixa: "18-20", idade_minima: 18, idade_maxima: 20, exige_comprovacao: false,
    dependentes: 380, irrf: 70, salario_familia: 40, universitario: 12, deficiente: 3,
    irrf_fora_do_limite: 60, salario_familia_fora_do_limite: 0, em_desconformidade: 60,
  },
  {
    faixa: "21-23", idade_minima: 21, idade_maxima: 23, exige_comprovacao: true,
    dependentes: 290, irrf: 130, salario_familia: 100, universitario: 22, deficiente: 2,
    irrf_fora_do_limite: 110, salario_familia_fora_do_limite: 100, em_desconformidade: 210,
  },
  {
    faixa: "24-29", idade_minima: 24, idade_maxima: 29, exige_comprovacao: true,
    dependentes: 240, irrf: 200, salario_familia: 40, universitario: 40, deficiente: 1,
    irrf_fora_do_limite: 200, salario_familia_fora_do_limite: 30, em_desconformidade: 230,
  },
  {
    faixa: "30-39", idade_minima: 30, idade_maxima: 39, exige_comprovacao: true,
    dependentes: 180, irrf: 170, salario_familia: 20, universitario: 0, deficiente: 1,
    irrf_fora_do_limite: 170, salario_familia_fora_do_limite: 20, em_desconformidade: 170,
  },
  {
    faixa: "40+", idade_minima: 40, idade_maxima: null, exige_comprovacao: true,
    dependentes: 95, irrf: 90, salario_familia: 5, universitario: 0, deficiente: 0,
    irrf_fora_do_limite: 90, salario_familia_fora_do_limite: 5, em_desconformidade: 90,
  },
  {
    faixa: "Sem data", idade_minima: null, idade_maxima: null, exige_comprovacao: true,
    dependentes: 30, irrf: 24, salario_familia: 6, universitario: 0, deficiente: 0,
    irrf_fora_do_limite: 24, salario_familia_fora_do_limite: 6, em_desconformidade: 24,
  },
];

export const INDICADOR_FAIXAS_MOCK: IndicadorFaixas = {
  gerado_em: "2026-10-17T18:40:00+00:00",
  filtros: { divisao: null, subdivisao: null, vinculo: null },
  vinculos_com_dependentes: 1580,
  dependentes: 3150,
  em_desconformidade: 964,
  sem_data: 30,
  faixas: FAIXAS_DEPENDENTES_MOCK,
};

/**
 * "Outras regras do diagnóstico": as 16 que não entram nos sete cartões, com as
 * contagens reais da Prefeitura.
 *
 * Sem `tipo` de propósito: a classificação (`erro`, `recadastro`, `indicador`…)
 * é do backend e o fixture não inventa. Em modo mock as barras saem neutras e a
 * legenda mostra "Sem classificação" — com a API real as três cores aparecem.
 */
export const ALERTAS: Alerta[] = [
  {
    valor: 863,
    t: "Documentação do dependente entregue há mais de 5 anos",
    d: "A data de entrega registrada tem mais de 5 anos: o cadastro provavelmente nunca foi revisado.",
  },
  {
    valor: 844,
    t: "Sem dependentes em nenhum registro",
    d: "O servidor não tem dependentes em nenhum registro. Pode ser que não tenha, ou que nunca tenham sido cadastrados.",
  },
  {
    valor: 593,
    t: "Parentesco 'menor de 21 anos' com 21 anos ou mais",
    d: "O tipo de parentesco diz 'menor de 21 anos', mas o dependente já tem 21 ou mais.",
  },
  {
    valor: 254,
    t: "Dependente sem nenhum documento",
    d: "O dependente só tem nome e nascimento: sem CPF, sem RG, sem outro documento e sem dados de certidão.",
  },
  {
    valor: 76,
    t: "Sem dependentes no vínculo ativo, com dependentes em outro registro",
    d: "O vínculo ativo está sem dependentes, mas a pessoa tem dependentes cadastrados em outro registro.",
  },
  {
    valor: 31,
    t: "Parentesco 'Outros'",
    d: "O dependente está com o parentesco 'Outros', que não diz qual é a relação.",
  },
  {
    valor: 26,
    t: "Estado civil solteiro com cônjuge entre os dependentes",
    d: "O servidor está como Solteiro, mas tem um dependente cadastrado como Cônjuge.",
  },
  {
    valor: 22,
    t: "CPF com mais de um vínculo ativo",
    d: "A mesma pessoa tem mais de um vínculo ativo.",
  },
  {
    valor: 10,
    t: "Vínculo ativo com data de término vencida",
    d: "O vínculo está ativo, mas a data de término já passou.",
  },
  {
    valor: 6,
    t: "Título de eleitor ausente ou com preenchimento falso",
    d: "O título de eleitor está vazio ou preenchido só com zeros.",
  },
  {
    valor: 6,
    t: "CPF de dependente inválido, repetido no servidor ou igual ao do servidor",
    d: "O CPF do dependente não passa na conferência dos dígitos, repete o de outro dependente ou é o do próprio servidor.",
  },
  {
    valor: 4,
    t: "Idade incoerente com o parentesco",
    d: "A diferença de idade entre servidor e dependente não combina com o parentesco informado.",
  },
  {
    valor: 2,
    t: "Mais de um cônjuge ou companheiro no mesmo registro",
    d: "O mesmo registro tem mais de um cônjuge ou companheiro cadastrado.",
  },
  {
    valor: 2,
    t: "PAI com sexo feminino ou MÃE com sexo masculino",
    d: "O parentesco é PAI com sexo feminino, ou MÃE com sexo masculino.",
  },
  {
    valor: 1,
    t: "PIS ausente ou com preenchimento falso",
    d: "O PIS está vazio ou preenchido só com zeros ou noves.",
  },
  {
    valor: 1,
    t: "Servidor sem nome da mãe",
    d: "O nome da mãe do servidor não está preenchido.",
  },
];

export const LOCAIS: Record<string, [string, number][]> = {
  "000006": [
    ["EM Dom Maximo Biennes", 65],
    ["EM Brincando e Aprendendo", 60],
    ["EM Fazendo Arte", 57],
    ["CAIC – Educação Infantil", 53],
    ["EM Raquel Ramão da Silva", 52],
    ["EM Des. Gabriel Pinto de Arruda", 49],
    ["EM Santos Dumont", 47],
    ["EM Vitória Régia", 46],
    ["EMEI Madre Maria Estevão", 45],
    ["EM Pequeno Sábio", 44],
    ["EM Frei Grignion", 44],
    ["SME – COC", 44],
    ["EM Vila Irene", 41],
    ["EMEI Profª Dulsângela", 41],
    ["EM Dr. José Rodrigues Fontes", 41],
    ["EM Isabel Campos", 39],
    ["EM Santo Antônio do Caramujo", 38],
    ["EM Tancredo Neves", 37],
    ["EM Buscando o Saber", 35],
    ["Setor de Transporte – SME", 32],
  ],
  "000005": [
    ["UPA", 76],
    ["Secretaria Municipal de Saúde", 48],
    ["Local não identificado", 46],
    ["Centro de Especialidades Médicas", 26],
    ["CER – Dom Aquino", 25],
    ["Vigilância Sanitária", 23],
    ["CEO – Odontologia", 18],
    ["CTA/SAE", 18],
    ["UBS Jardim Guanabara", 15],
    ["UBS Vista Alegre", 13],
    ["CAPSi", 13],
    ["UBS Cavalhada", 12],
    ["UBS Rodeio", 12],
    ["UBS Jardim Marajoara", 12],
    ["CAPS I adulto", 12],
  ],
  "000011": [
    ["Sede SMASC", 19],
    ["CRAS I", 17],
    ["CREAS", 14],
    ["CRAS II", 12],
    ["Centro de Convivência do Idoso", 11],
    ["Casa Lar", 10],
    ["Conselho Tutelar", 10],
    ["Casa de Passagem", 8],
    ["Apoio administrativo SMAS", 7],
    ["Casa de Passagem Belbellita", 7],
  ],
  "000003": [
    ["Sala de Monitoramento", 20],
    ["Gestão de Pessoas – RH", 13],
    ["TI – Informações Sistêmicas", 9],
    ["Aquisição, Bens e Serviços", 6],
    ["Comissão de Contratação", 6],
    ["Arquivo Público", 5],
    ["Apoio administrativo SMA", 5],
    ["Almoxarifado Central", 5],
  ],
  "000001": [
    ["Procuradoria Geral", 44],
    ["Gabinete da Prefeita", 9],
    ["Controladoria Geral", 5],
  ],
  "000013": [
    ["SEFAZ", 30],
    ["Coord. Executiva de Trânsito", 13],
    ["Local não identificado", 7],
  ],
  "000007": [
    ["Sede SEMIL", 10],
    ["Assessoria Técnica – Convênios", 7],
    ["Guarita Pátio", 5],
    ["Oficina Mecânica", 5],
    ["Terraplanagem e Pavimentação", 4],
  ],
  "000008": [
    ["Sede SMTC", 21],
    ["Biblioteca Pública", 7],
    ["Museu Histórico", 3],
  ],
  "000014": [["Sede SEMADE", 18]],
  "000012": [
    ["Centro de Iniciação ao Esporte", 9],
    ["Sede SEMEL", 3],
  ],
  "000004": [
    ["Contabilidade Geral", 10],
    ["Sede SEFIN", 3],
  ],
  "000002": [
    ["Sede SEAE", 5],
    ["PROCON", 4],
  ],
  "000010": [
    ["Sede SMAG", 7],
    ["Desenvolvimento Agrícola", 3],
  ],
  "000009": [
    ["REURB", 4],
    ["Planejamento e Orçamento", 4],
  ],
};

export const CARGOS: Record<string, [string, number][]> = {
  "000006": [
    ["Prof. Pedagogia (30h)", 658],
    ["Aux. Desenv. Infantil", 364],
    ["Aux. Serviços Gerais", 104],
    ["Guarda Mun. Patrimonial", 95],
    ["Assistente Administrativo", 51],
    ["Prof. Letras", 22],
    ["Prof. Matemática", 17],
    ["Motorista de ônibus", 16],
  ],
  "000005": [
    ["Técnico em Enfermagem", 95],
    ["Enfermeiro(a)", 55],
    ["Aux. Serviços Gerais", 52],
    ["Guarda Mun. Patrimonial", 42],
    ["Assistente Administrativo", 38],
    ["Agente Comunitário de Saúde", 37],
    ["Agente de Endemias", 33],
    ["Motorista de ônibus", 15],
  ],
  "000011": [
    ["Aux. Serviços Gerais", 31],
    ["Guarda Mun. Patrimonial", 21],
    ["Educador Social", 20],
    ["Assistente Administrativo", 13],
    ["Assistente Social", 10],
    ["Psicólogo", 7],
    ["Conselheiro Tutelar", 5],
  ],
  "000003": [
    ["Guarda Mun. Patrimonial", 20],
    ["Assistente Administrativo", 16],
    ["Aux. Serviços Gerais", 15],
    ["Estagiário", 6],
  ],
  "000001": [
    ["Estagiário", 13],
    ["Estagiário II", 11],
    ["Procurador do Município", 9],
  ],
  "000013": [
    ["Assistente Administrativo", 13],
    ["Fiscal de Obras e Posturas", 11],
    ["Agente de Trânsito", 11],
    ["Fiscal de Tributos", 5],
    ["Estagiário", 5],
  ],
  "000007": [
    ["Aux. Serviços Gerais", 11],
    ["Assistente Administrativo", 7],
    ["Engenheiro Civil", 6],
    ["Motorista", 5],
  ],
  "000008": [
    ["Aux. Serviços Gerais", 11],
    ["Guarda Mun. Patrimonial", 9],
  ],
  "000009": [["Assistente Administrativo", 6]],
  "000012": [["Aux. Serviços Gerais", 7]],
};

/** Linha "Toda a Prefeitura" derivada das secretarias do mock. */
const TOTAL_MOCK: Secretaria = SECRETARIAS.reduce<Secretaria>(
  (acc, s) => ({
    cod: "ALL",
    curto: "Toda a Prefeitura",
    vinc: acc.vinc + s.vinc,
    deps: acc.deps + s.deps,
    depCpf: acc.depCpf + s.depCpf,
    depNasc: acc.depNasc + s.depNasc,
    cert: acc.cert + s.cert,
    irrf: acc.irrf + s.irrf,
    salfam: acc.salfam + s.salfam,
    lotSetor: acc.lotSetor + s.lotSetor,
    semEmail: acc.semEmail + s.semEmail,
    semFone: acc.semFone + s.semFone,
    confP5: acc.confP5 + s.confP5 * s.vinc,
  }),
  {
    cod: "ALL",
    curto: "Toda a Prefeitura",
    vinc: 0,
    deps: 0,
    depCpf: 0,
    depNasc: 0,
    cert: 0,
    irrf: 0,
    salfam: 0,
    lotSetor: 0,
    semEmail: 0,
    semFone: 0,
    confP5: 0,
  },
);

TOTAL_MOCK.confP5 = TOTAL_MOCK.vinc ? TOTAL_MOCK.confP5 / TOTAL_MOCK.vinc : 0;

export const RAIO_X_MOCK: RaioXData = {
  secretarias: SECRETARIAS,
  total: TOTAL_MOCK,
  cartoes: REGRAS,
  locais: LOCAIS,
  cargos: CARGOS,
  tipoVinculo: TIPO_VINCULO,
  pisFicticio: PIS_FICTICIO,
  alertas: ALERTAS,
  faixaDependentes: FAIXA_DEPENDENTES,
  atualizadoEm: "17/10/2026 18:40",
};

export const PADRAO = {
  sec: "ALL",
  regra: "cert" as const,
  minVinc: 1 as const,
  aba: "regra" as const,
};

import { describe, expect, it } from "vitest";

import painelFixture from "./__fixtures__/painel.json";
import divisoesFixture from "./__fixtures__/por-divisao.json";
import servidoresFixture from "./__fixtures__/servidores.json";

import {
  colunasDeServidores,
  fmtPct,
  formatarGeradoEm,
  funilConformidade,
  kpisDoPainel,
  nomeCurtoDivisao,
  normalizarDivisoes,
  pct,
  pendenciasPorTipo,
  regrasPorOcorrencias,
  regrasPorServidores,
  situacaoPorDivisao,
  totalDePaginas,
  valorDaColuna,
} from "./adaptadores";
import type { ListaServidores, Painel, ResumoDivisao } from "./types";

const painel = painelFixture as unknown as Painel;
const divisoes = divisoesFixture as unknown as ResumoDivisao[];
const servidores = servidoresFixture as unknown as ListaServidores;

/* ------------------------------------------------------------------ */
/* KPIs                                                                */
/* ------------------------------------------------------------------ */

describe("kpisDoPainel", () => {
  const kpis = kpisDoPainel(painel);

  it("devolve os quatro indicadores na ordem da tela", () => {
    expect(kpis.map((kpi) => kpi.id)).toEqual(["vinculos", "dependentes", "com_erro", "sem_pendencia"]);
  });

  it("usa as contagens do resumo, não recalcula", () => {
    expect(kpis.map((kpi) => kpi.valor)).toEqual([2463, 3146, 610, 1387]);
  });

  it("mostra a razão dependentes por vínculo", () => {
    expect(kpis[1].badge).toBe("1,3 / vínculo");
  });

  it("calcula o percentual de erro sobre os vínculos ativos", () => {
    expect(kpis[2].badge).toBe("24,8%");
    expect(kpis[2].tom).toBe("ruim");
    expect(kpis[3].badge).toBe("56,3%");
    expect(kpis[3].tom).toBe("bom");
  });

  it("não divide por zero quando o resumo vem vazio", () => {
    const vazio = kpisDoPainel({ gerado_em: "", universo: null, resumo: null, regras: [] } as never);
    expect(vazio[0].valor).toBe(0);
    expect(vazio[2].badge).toBe("0,0%");
  });
});

/* ------------------------------------------------------------------ */
/* Pendências por tipo                                                 */
/* ------------------------------------------------------------------ */

describe("pendenciasPorTipo", () => {
  const fatias = pendenciasPorTipo(painel.regras);

  it("soma os servidores de cada tipo", () => {
    expect(fatias.map((fatia) => fatia.tipo)).toEqual([
      "erro",
      "alerta",
      "recadastro",
      "conferencia",
      "indicador",
    ]);
    expect(fatias.map((fatia) => fatia.value)).toEqual([1010, 439, 318, 731, 208]);
  });

  it("mantém a cor fixa de cada tipo", () => {
    expect(fatias[0].color).toBe("#B42318");
    expect(fatias[1].color).toBe("#E0731F");
  });

  it("descarta tipo sem apontamento", () => {
    const soErro = pendenciasPorTipo([painel.regras[0]]);
    expect(soErro).toHaveLength(1);
    expect(soErro[0].tipo).toBe("erro");
  });

  it("aguenta lista vazia", () => {
    expect(pendenciasPorTipo([])).toEqual([]);
    expect(pendenciasPorTipo(undefined)).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* Situação por divisão                                                */
/* ------------------------------------------------------------------ */

describe("situacaoPorDivisao", () => {
  it("ordena da pior para a melhor pelo total com erro", () => {
    const serie = situacaoPorDivisao(divisoes);
    expect(serie[0].divisao).toBe("SECRETARIA MUNICIPAL DE EDUCACAO");
    expect(serie[0].com_erro).toBe(164);
    expect(serie[serie.length - 1].divisao).toBe("SECRETARIA MUNICIPAL DE CULTURA");
  });

  it("respeita o limite de linhas", () => {
    expect(situacaoPorDivisao(divisoes, 3)).toHaveLength(3);
  });

  it("encurta o nome para o eixo", () => {
    const serie = situacaoPorDivisao(divisoes, 1);
    expect(serie[0].curto).toBe("Educação");
  });

  it("ignora linha sem nome de divisão", () => {
    const suja: ResumoDivisao[] = [
      ...divisoes,
      { divisao: "", vinculos: 1, com_erro: 99, com_alerta: 0, sem_pendencia: 0 },
    ];
    expect(situacaoPorDivisao(suja)).toHaveLength(divisoes.length);
  });
});

describe("nomeCurtoDivisao", () => {
  it("remove os prefixos de secretaria e fundo", () => {
    expect(nomeCurtoDivisao("SECRETARIA MUNICIPAL DE SAUDE")).toBe("Saúde");
    expect(nomeCurtoDivisao("FUNDO MUNICIPAL DE SAUDE")).toBe("Saúde");
    expect(nomeCurtoDivisao("AUTARQUIA MUNICIPAL DE TRANSITO")).toBe("Trânsito");
  });

  it("mantém as conectivas em minúscula", () => {
    expect(nomeCurtoDivisao("SECRETARIA MUNICIPAL DE MEIO AMBIENTE")).toBe("Meio Ambiente");
    expect(nomeCurtoDivisao("SECRETARIA DE EDUCACAO E CULTURA")).toBe("Educação e Cultura");
  });

  // O SIP também grava o prefixo abreviado; antes ele passava inteiro para o eixo.
  it("remove o prefixo abreviado", () => {
    expect(nomeCurtoDivisao("SECRET. MUNICIPAL DE FAZENDA")).toBe("Fazenda");
    expect(nomeCurtoDivisao("SECR. MUN. DE FAZENDA")).toBe("Fazenda");
  });

  // "ESPECIAL" diz o tipo da secretaria, como "MUNICIPAL": o eixo fica só com o
  // assunto. Antes o qualificador passava inteiro e o rótulo saía "Especial de
  // Assuntos Estratégicos" (22/10/2026).
  it("remove o qualificador ESPECIAL", () => {
    expect(nomeCurtoDivisao("SECRETARIA ESPECIAL DE ASSUNTOS ESTRATEGICOS")).toBe(
      "Assuntos Estratégicos",
    );
    expect(nomeCurtoDivisao("SECRET. ESPECIAL DE CULTURA")).toBe("Cultura");
  });

  it("usa o rótulo curto das divisões com nome composto", () => {
    expect(
      nomeCurtoDivisao("SECRET. MUNICIPAL DE MEIO AMBIENTE E DESENVOLVIMENTO ECONOMICO"),
    ).toBe("Meio Ambiente");
    // A regra é por palavras: o final do nome pode variar.
    expect(
      nomeCurtoDivisao("SECRETARIA MUNICIPAL DE MEIO AMBIENTE, DESENVOLVIMENTO ECONÔMICO E TURISMO"),
    ).toBe("Meio Ambiente");
    expect(nomeCurtoDivisao("SECRETARIA DE DESENVOLVIMENTO ECONÔMICO")).toBe(
      "Desenvolvimento Econômico",
    );
    // Sem "desenvolvimento" no nome, o alias não se aplica.
    expect(nomeCurtoDivisao("SECRETARIA MUNICIPAL DE MEIO AMBIENTE E SANEAMENTO")).toBe(
      "Meio Ambiente e Saneamento",
    );
  });

  it("aguenta espaço duplo no meio do nome", () => {
    expect(nomeCurtoDivisao("SECRETARIA  MUNICIPAL  DE  SAUDE")).toBe("Saúde");
  });
});

/* ------------------------------------------------------------------ */
/* Funil                                                               */
/* ------------------------------------------------------------------ */

describe("funilConformidade", () => {
  const etapas = funilConformidade(painel);

  it("monta os quatro degraus", () => {
    expect(etapas.map((etapa) => etapa.label)).toEqual([
      "Vínculos ativos",
      "Com alguma pendência",
      "Com erro",
      "Na regra mais grave",
    ]);
    expect(etapas.map((etapa) => etapa.valor)).toEqual([2463, 1076, 610, 610]);
  });

  it("calcula a taxa sobre a primeira etapa", () => {
    expect(etapas[0].taxa).toBe(100);
    expect(fmtPct(etapas[1].taxa)).toBe("43,7%");
    expect(fmtPct(etapas[2].taxa)).toBe("24,8%");
  });

  it("nunca deixa o funil crescer", () => {
    const valores = etapas.map((etapa) => etapa.valor);
    for (let i = 1; i < valores.length; i += 1) {
      expect(valores[i]).toBeLessThanOrEqual(valores[i - 1]);
    }
  });

  it("descarta o degrau da regra mais grave quando ele é maior que o anterior", () => {
    const sintetico = {
      gerado_em: "",
      universo: { empresa: "001", situacoes: [], vinculos: 1000, dependentes: 0 },
      resumo: { vinculos: 1000, com_erro: 100, com_alerta: 200, sem_pendencia: 700 },
      regras: [
        {
          codigo: "X",
          titulo: "Regra",
          tipo: "erro",
          alvo: "servidor",
          descricao: "",
          orientacao: "",
          servidores: 500,
          ocorrencias: 500,
        },
      ],
    } as Painel;

    const resultado = funilConformidade(sintetico);
    expect(resultado.map((etapa) => etapa.label)).not.toContain("Na regra mais grave");
    expect(resultado).toHaveLength(3);
  });
});

/* ------------------------------------------------------------------ */
/* Rankings                                                            */
/* ------------------------------------------------------------------ */

describe("regrasPorServidores", () => {
  const ranking = regrasPorServidores(painel.regras, 3);

  it("pega as regras que mais atingem vínculos", () => {
    expect(ranking.map((regra) => regra.codigo)).toEqual([
      "CERTIDAO_AUSENTE",
      "SERVIDOR_SEM_FONE",
      "SALARIO_FAMILIA",
    ]);
    expect(ranking.map((regra) => regra.valor)).toEqual([610, 466, 439]);
  });

  it("normaliza a largura pelo maior valor", () => {
    expect(ranking[0].largura).toBe(100);
    expect(ranking[1].largura).toBeCloseTo((466 / 610) * 100, 5);
  });

  it("marca como crítica só a regra do tipo erro", () => {
    expect(ranking.map((regra) => regra.critica)).toEqual([true, false, false]);
  });
});

describe("regrasPorOcorrencias", () => {
  it("ordena por ocorrências, não por servidores", () => {
    const ranking = regrasPorOcorrencias(painel.regras, 2);
    expect(ranking[0].codigo).toBe("CERTIDAO_AUSENTE");
    expect(ranking[0].valor).toBe(618);
    expect(ranking[1].codigo).toBe("SERVIDOR_SEM_FONE");
  });

  it("cai para o código quando a regra não tem título", () => {
    const ranking = regrasPorServidores([
      { codigo: "SEM_TITULO", titulo: "   ", tipo: "erro", servidores: 1, ocorrencias: 1 } as never,
    ]);
    expect(ranking[0].titulo).toBe("SEM_TITULO");
  });
});

/* ------------------------------------------------------------------ */
/* Tabela de servidores                                                */
/* ------------------------------------------------------------------ */

describe("colunasDeServidores", () => {
  const colunas = colunasDeServidores(servidores.itens);

  it("descobre as colunas conhecidas na ordem da tela", () => {
    expect(colunas.map((coluna) => coluna.rotulo)).toEqual([
      "Registro",
      "Servidor",
      "Situação",
      "Divisão",
      "Vínculo",
      "Cargo",
      "Admissão",
    ]);
  });

  it("descarta coluna sem nenhum valor", () => {
    expect(colunas.map((coluna) => coluna.chave)).not.toContain("EMAIL");
  });

  it("ignora chave desconhecida", () => {
    expect(colunas.map((coluna) => coluna.chave)).not.toContain("MATRICULA_ANTIGA");
  });

  it("devolve vazio para lista vazia", () => {
    expect(colunasDeServidores([])).toEqual([]);
  });
});

describe("valorDaColuna", () => {
  it("usa travessão para valor vazio", () => {
    expect(valorDaColuna({ NOME: null }, "NOME")).toBe("—");
    expect(valorDaColuna({}, "NOME")).toBe("—");
  });

  it("formata número em pt-BR", () => {
    expect(valorDaColuna({ REGISTRO: 12345 }, "REGISTRO")).toBe("12.345");
  });

  it("mantém texto como veio", () => {
    expect(valorDaColuna({ NOME: "ANA PAULA" }, "NOME")).toBe("ANA PAULA");
  });
});

describe("totalDePaginas", () => {
  it("arredonda para cima", () => {
    expect(totalDePaginas(2463, 8)).toBe(308);
    expect(totalDePaginas(8, 8)).toBe(1);
    expect(totalDePaginas(9, 8)).toBe(2);
  });

  it("nunca devolve zero", () => {
    expect(totalDePaginas(0, 8)).toBe(1);
    expect(totalDePaginas(10, 0)).toBe(1);
  });
});

/* ------------------------------------------------------------------ */
/* Normalização e formatação                                           */
/* ------------------------------------------------------------------ */

describe("normalizarDivisoes", () => {
  it("aceita a lista crua", () => {
    expect(normalizarDivisoes(divisoes)).toHaveLength(8);
  });

  it("aceita o envelope com `divisoes`", () => {
    expect(normalizarDivisoes({ divisoes })).toHaveLength(8);
  });

  it("devolve vazio para resposta ausente", () => {
    expect(normalizarDivisoes(null)).toEqual([]);
    expect(normalizarDivisoes(undefined)).toEqual([]);
    expect(normalizarDivisoes({})).toEqual([]);
  });
});

describe("formatarGeradoEm", () => {
  it("formata data e hora em pt-BR", () => {
    expect(formatarGeradoEm("2026-10-20T02:26:36+00:00")).toMatch(
      /^\d{2}\/\d{2}\/\d{4},? \d{2}:\d{2}$/,
    );
  });

  it("devolve o texto original quando não é data", () => {
    expect(formatarGeradoEm("ontem")).toBe("ontem");
    expect(formatarGeradoEm("")).toBe("—");
  });
});

describe("pct", () => {
  it("não divide por zero", () => {
    expect(pct(10, 0)).toBe(0);
    expect(pct(1, 4)).toBe(25);
  });
});

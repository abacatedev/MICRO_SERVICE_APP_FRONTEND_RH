import { describe, expect, it } from "vitest";

import { REGRAS, SECRETARIAS } from "./mock";
import {
  comparacaoComPrefeitura,
  composicaoPorSecretaria,
  eixoDePercentual,
  fatiasPorRegra,
  listaSecretarias,
  mediaPrefeitura,
  rankingCasos,
  seriePorSecretaria,
  totaisDe,
} from "./calculos";
import type { Secretaria } from "./types";

describe("média da Prefeitura", () => {
  it("usa as 14 secretarias e ignora filtros", () => {
    // 1.083 certidões em 2.463 vínculos = 43,97%
    expect(mediaPrefeitura(SECRETARIAS, "cert")).toBeCloseTo(43.97, 1);
  });

  it("não muda quando só uma secretaria é considerada", () => {
    const saude = SECRETARIAS.filter((s) => s.cod === "000005");
    expect(totaisDe(saude).cert).toBe(186);
    expect(mediaPrefeitura(SECRETARIAS, "cert")).toBeCloseTo(43.97, 1);
  });
});

describe("série por secretaria", () => {
  const media = mediaPrefeitura(SECRETARIAS, "cert");
  const serie = seriePorSecretaria(SECRETARIAS, "cert", media, "ALL");

  // `acima` é o critério das duas cores do gráfico A (acima da referência da
  // Prefeitura = azul escuro); a cor em si fica no componente.
  it("marca acima da referência (Educação) e abaixo (Saúde)", () => {
    const educacao = serie.find((p) => p.cod === "000006");
    const saude = serie.find((p) => p.cod === "000005");

    expect(educacao?.valor).toBeCloseTo(49.4, 1);
    expect(educacao?.acima).toBe(true);
    expect(saude?.valor).toBeCloseTo(34.96, 1);
    expect(saude?.acima).toBe(false);
  });

  it("respeita a ordem decrescente de vínculos", () => {
    expect(serie[0].cod).toBe("000006");
    expect(serie[1].cod).toBe("000005");
  });
});

describe("ranking de casos", () => {
  it("devolve as 7 maiores quantidades absolutas", () => {
    const ranking = rankingCasos(SECRETARIAS, "cert", "ALL");
    expect(ranking).toHaveLength(7);
    expect(ranking[0]).toEqual(
      expect.objectContaining({ cod: "000006", valor: 700, largura: 100 }),
    );
  });
});

describe("filtro minVinc", () => {
  it("mantém apenas secretarias com 100+ vínculos", () => {
    const lista = listaSecretarias(SECRETARIAS, "ALL", 100);
    expect(lista.map((s) => s.cod)).toEqual(["000006", "000005"]);
  });

  it("nunca esconde a secretaria selecionada, mesmo abaixo do mínimo", () => {
    const lista = listaSecretarias(SECRETARIAS, "000009", 100);
    expect(lista).toHaveLength(3);
    expect(lista.map((s) => s.cod)).toContain("000009");
  });

  it("com 30+ vínculos inclui Gabinete e Fazenda", () => {
    const lista = listaSecretarias(SECRETARIAS, "ALL", 30);
    expect(lista.map((s) => s.cod)).toContain("000001");
    expect(lista.map((s) => s.cod)).toContain("000013");
    expect(lista).toHaveLength(8);
  });
});

describe("totais do quadro", () => {
  it("fecha com os números de referência", () => {
    const t = totaisDe(SECRETARIAS);
    expect(t.vinc).toBe(2463);
    expect(t.deps).toBe(3146);
    expect(t.irrf).toBe(447);
    expect(t.salfam).toBe(443);
    expect(t.depCpf).toBe(317);
    expect(t.depNasc).toBe(5);
    expect(t.cert).toBe(1083);
    expect(t.semEmail).toBe(218);
    expect(t.semFone).toBe(61);
  });
});

describe("donut por regra (aba Inconsistências)", () => {
  // Linha `ALL` da API, não a soma das divisões: 2.463 vínculos e 2.499
  // apontamentos nas sete regras.
  const total: Secretaria = {
    cod: "ALL",
    curto: "Prefeitura",
    vinc: 2463,
    deps: 3150,
    depCpf: 318,
    depNasc: 6,
    cert: 610,
    irrf: 394,
    salfam: 440,
    lotSetor: 0,
    semEmail: 265,
    semFone: 466,
    confP5: 0,
  };

  const fatias = fatiasPorRegra(total, REGRAS);
  const somaDoGrupo = (categoria: string) =>
    fatias.filter((f) => f.categoria === categoria).reduce((acc, f) => acc + f.value, 0);

  it("fecha com as categorias do gráfico de colunas", () => {
    expect(fatias).toHaveLength(7);
    expect(somaDoGrupo("Dependentes")).toBe(1158);
    expect(somaDoGrupo("Documentação")).toBe(610);
    expect(somaDoGrupo("Contato")).toBe(731);
    expect(fatias.reduce((acc, f) => acc + f.value, 0)).toBe(2499);
  });

  it("ordena as regras da categoria por volume", () => {
    const dependentes = fatias.filter((f) => f.categoria === "Dependentes").map((f) => f.value);
    expect(dependentes).toEqual([440, 394, 318, 6]);
  });

  // A cor é a categoria: três tons, um por grupo, repetidos dentro dele.
  it("dá uma cor por categoria e a repete entre as regras dela", () => {
    expect(new Set(fatias.map((f) => f.color)).size).toBe(3);
    const dependentes = fatias.filter((f) => f.categoria === "Dependentes");
    expect(new Set(dependentes.map((f) => f.color)).size).toBe(1);
  });

  it("usa o título que o backend manda", () => {
    expect(fatias.find((f) => f.categoria === "Documentação")?.label).toBe("Certidão incompleta");
  });

  // O `cod` é o que a legenda usa para abrir a aba Pendência com a regra certa.
  it("carrega o id da regra em cada fatia", () => {
    expect(fatias.map((f) => f.cod).sort()).toEqual([
      "cert",
      "depCpf",
      "depNasc",
      "irrf",
      "salfam",
      "semEmail",
      "semFone",
    ]);
  });
});

/* ------------------------------------------------------------------ */
/* Aba Comparativo                                                     */
/* ------------------------------------------------------------------ */

/** Secretaria zerada com só os campos que o teste usa. */
const base = (extra: Partial<Secretaria>): Secretaria => ({
  cod: "X",
  curto: "X",
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
  ...extra,
});

describe("secretaria × média da Prefeitura", () => {
  // 1.000 vínculos na Prefeitura; a secretaria tem 200.
  const prefeitura = base({
    cod: "ALL",
    curto: "Prefeitura",
    vinc: 1000,
    cert: 200,
    depCpf: 50,
    depNasc: 10,
    irrf: 100,
    salfam: 80,
    semEmail: 40,
    semFone: 20,
  });
  const secretaria = base({
    cod: "000001",
    curto: "Teste",
    vinc: 200,
    cert: 60,
    depCpf: 20,
    depNasc: 1,
    irrf: 10,
    salfam: 16,
    semEmail: 4,
    semFone: 6,
  });

  const serie = comparacaoComPrefeitura(secretaria, prefeitura);

  it("devolve as sete pendências na ordem dos cards", () => {
    expect(serie.map((linha) => linha.regra)).toEqual([
      "cert",
      "depCpf",
      "depNasc",
      "irrf",
      "salfam",
      "semEmail",
      "semFone",
    ]);
    expect(serie[0].rotulo).toBe("Sem certidão");
  });

  it("compara percentual de vínculos, não contagem", () => {
    expect(serie.find((l) => l.regra === "cert")).toMatchObject({
      secretaria: 30,
      prefeitura: 20,
    });
    expect(serie.find((l) => l.regra === "depNasc")).toMatchObject({
      secretaria: 0.5,
      prefeitura: 1,
    });
  });

  // Empate não é "acima": o destaque em laranja precisa querer dizer algo.
  it("marca acima só quando passa da Prefeitura", () => {
    expect(serie.filter((l) => l.acima).map((l) => l.regra)).toEqual([
      "cert",
      "depCpf",
      "semFone",
    ]);
    // salfam empata em 8% dos dois lados.
    expect(serie.find((l) => l.regra === "salfam")?.acima).toBe(false);
  });

  /*
   * A referência é casos ÷ vínculos de toda a Prefeitura, não a média simples
   * dos percentuais das secretarias. Com 900 vínculos a 10% e 100 a 50%, a
   * média simples dá 30% e a ponderada, 14% — só a segunda compara com o todo.
   */
  it("usa o total da Prefeitura e não a média das secretarias", () => {
    const grande = base({ cod: "A", vinc: 900, cert: 90 });
    const pequena = base({ cod: "B", vinc: 100, cert: 50 });
    const total = base({ cod: "ALL", vinc: 1000, cert: 140 });

    expect(comparacaoComPrefeitura(pequena, total)[0].prefeitura).toBeCloseTo(14, 5);
    expect(mediaPrefeitura([grande, pequena], "cert")).toBeCloseTo(14, 5);
    // A média simples seria 30 — o número que o gráfico NÃO usa.
    expect((10 + 50) / 2).toBe(30);
  });
});

describe("composição das pendências por secretaria", () => {
  const a = base({
    cod: "A",
    curto: "Maior",
    vinc: 100,
    cert: 60,
    depCpf: 20,
    depNasc: 1,
    irrf: 10,
    salfam: 16,
    semEmail: 4,
    semFone: 6,
  });
  const b = base({ cod: "B", curto: "Menor", vinc: 10, cert: 3, semEmail: 1 });
  const linhas = composicaoPorSecretaria([b, a]);

  it("ordena pelo total de casos, do maior para o menor", () => {
    expect(linhas.map((linha) => linha.cod)).toEqual(["A", "B"]);
    expect(linhas[0].total).toBe(117);
    expect(linhas[1].total).toBe(4);
  });

  it("faz cada barra somar 100%", () => {
    const soma = (linha: (typeof linhas)[number]) =>
      ["cert", "depCpf", "depNasc", "irrf", "salfam", "semEmail", "semFone"].reduce(
        (acc, regra) => acc + Number(linha[regra]),
        0,
      );
    expect(soma(linhas[0])).toBeCloseTo(100, 6);
    expect(soma(linhas[1])).toBeCloseTo(100, 6);
  });

  it("não divide por zero quando a secretaria não tem caso", () => {
    const semCaso = composicaoPorSecretaria([base({ cod: "Z", curto: "Zerada", vinc: 5 })]);
    expect(semCaso[0].total).toBe(0);
    expect(Number(semCaso[0].cert)).toBe(0);
  });
});

describe("escala do eixo de percentual", () => {
  it("arredonda o topo para um passo redondo", () => {
    expect(eixoDePercentual([30, 20])).toEqual({ topo: 30, ticks: [0, 10, 20, 30] });
    expect(eixoDePercentual([43.97])).toEqual({ topo: 50, ticks: [0, 10, 20, 30, 40, 50] });
  });

  // Acima de 50% o passo cresce: senão o eixo ganha uma dúzia de marcas.
  it("não passa de seis intervalos", () => {
    const { topo, ticks } = eixoDePercentual([55]);
    expect(topo).toBe(60);
    expect(ticks).toEqual([0, 20, 40, 60]);
  });

  // Sem o piso o eixo colapsa em 0 e o gráfico fica sem escala.
  it("nunca fica abaixo de 5", () => {
    expect(eixoDePercentual([])).toEqual({ topo: 5, ticks: [0, 5] });
    expect(eixoDePercentual([0, 0])).toEqual({ topo: 5, ticks: [0, 5] });
  });
});

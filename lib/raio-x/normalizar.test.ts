import { describe, expect, it } from "vitest";

import { normalizarRaioX, numero } from "./normalizar";

const PAYLOAD_DOC = {
  atualizadoEm: "17/10/2026 18:40",
  universo: { vinculos: 1500, dependentes: 1932 },
  secretarias: [
    {
      cod: "000006",
      curto: "Educação",
      vinc: 700,
      deps: 912,
      regras: {
        irrf: 210,
        salfam: 205,
        depCpf: 180,
        depNasc: 4,
        cert: 346,
        semEmail: 88,
        semFone: 31,
      },
      lotSetor: 12,
      confP5: 62.4,
    },
    {
      cod: "000007",
      curto: "Saúde",
      vinc: 500,
      deps: 640,
      regras: { irrf: 120, salfam: 118, depCpf: 90, depNasc: 1, cert: 175 },
      lotSetor: 0,
      confP5: 0,
    },
    {
      cod: "000008",
      curto: "Assistência Social",
      vinc: 300,
      deps: 380,
      regras: { cert: 53 },
      lotSetor: 3,
      confP5: 71,
    },
  ],
  locais: {
    "000006": [
      { nome: "Escola Municipal Central", vinculos: 120 },
      { nome: "Local não identificado", vinculos: 40 },
    ],
  },
  cargos: { "000006": [{ nome: "Professor", vinculos: 300 }] },
  tipoVinculo: [
    { nome: "Estatutário", vinculos: 1200 },
    { nome: "Comissionado", vinculos: 300 },
  ],
  pisFicticio: { "000006": 9 },
  faixaDependentes: { "0-13": 500, "14-17": 220 },
  alertas: [{ n: "53+", t: "certidão incompleta", d: "Sem tipo de certidão." }],
};

describe("normalizarRaioX", () => {
  it("lê o payload do contrato com regras aninhadas", () => {
    const dados = normalizarRaioX(PAYLOAD_DOC);

    expect(dados.secretarias).toHaveLength(3);

    const educacao = dados.secretarias[0];
    expect(educacao.cod).toBe("000006");
    expect(educacao.curto).toBe("Educação");
    expect(educacao.vinc).toBe(700);
    expect(educacao.deps).toBe(912);
    expect(educacao.cert).toBe(346);
    expect(educacao.irrf).toBe(210);
    expect(educacao.semFone).toBe(31);
    expect(educacao.lotSetor).toBe(12);
    expect(educacao.confP5).toBeCloseTo(62.4);
  });

  it("trata regra ausente como zero em vez de undefined", () => {
    const saude = normalizarRaioX(PAYLOAD_DOC).secretarias[1];
    expect(saude.semEmail).toBe(0);
    expect(saude.semFone).toBe(0);
    expect(saude.confP5).toBe(0);
  });

  it("converte listas de objetos em tuplas", () => {
    const dados = normalizarRaioX(PAYLOAD_DOC);
    expect(dados.locais["000006"]).toEqual([
      ["Escola Municipal Central", 120],
      ["Local não identificado", 40],
    ]);
    expect(dados.cargos["000006"]).toEqual([["Professor", 300]]);
    expect(dados.tipoVinculo).toEqual([
      ["Estatutário", 1200],
      ["Comissionado", 300],
    ]);
  });

  it("normaliza contagens, alertas e data", () => {
    const dados = normalizarRaioX(PAYLOAD_DOC);
    expect(dados.pisFicticio).toEqual({ "000006": 9 });
    expect(dados.faixaDependentes).toEqual({ "0-13": 500, "14-17": 220 });
    expect(dados.alertas[0]).toEqual({
      t: "certidão incompleta",
      d: "Sem tipo de certidão.",
      valor: 53,
    });
    expect(dados.atualizadoEm).toBe("17/10/2026 18:40");
  });

  it("aceita campos achatados e listas em tuplas", () => {
    const dados = normalizarRaioX({
      secretarias: [
        {
          cod: "000009",
          nome: "Fazenda",
          vinculos: "2.463",
          dependentes: "3.146",
          certidao: "1.083",
          irrf_idade: "447",
        },
      ],
      locais: { "000009": [["Centro Administrativo", 12]] },
      tipo_vinculo: [["Efetivo", 10]],
    });

    const fazenda = dados.secretarias[0];
    expect(fazenda.curto).toBe("Fazenda");
    expect(fazenda.vinc).toBe(2463);
    expect(fazenda.deps).toBe(3146);
    expect(fazenda.cert).toBe(1083);
    expect(fazenda.irrf).toBe(447);
    expect(dados.locais["000009"]).toEqual([["Centro Administrativo", 12]]);
    expect(dados.tipoVinculo).toEqual([["Efetivo", 10]]);
  });

  it("desembrulha payload dentro de `data`", () => {
    const dados = normalizarRaioX({ data: PAYLOAD_DOC });
    expect(dados.secretarias).toHaveLength(3);
  });

  it("descarta linhas sem código e sem nome", () => {
    const dados = normalizarRaioX({
      secretarias: [{ cod: "000001", curto: "Obras" }, { vinc: 10 }],
    });
    expect(dados.secretarias).toHaveLength(1);
  });

  it("falha com mensagem clara quando não há secretarias", () => {
    expect(() => normalizarRaioX({ total: 0 })).toThrow(/secretarias/i);
    expect(() => normalizarRaioX([])).toThrow(/objeto JSON/i);
  });
});

describe("numero", () => {
  it("aceita as formas que o backend pode mandar", () => {
    expect(numero(2463)).toBe(2463);
    expect(numero("2463")).toBe(2463);
    expect(numero("2.463")).toBe(2463);
    expect(numero("2.463,00")).toBe(2463);
    expect(numero("1.234.567")).toBe(1234567);
    expect(numero("44,0")).toBeCloseTo(44);
    expect(numero("")).toBe(0);
    expect(numero(null)).toBe(0);
    expect(numero(undefined)).toBe(0);
    expect(numero("—")).toBe(0);
  });
});

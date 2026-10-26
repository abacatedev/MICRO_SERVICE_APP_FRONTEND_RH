import { describe, expect, it } from "vitest";

import regrasFixture from "./__fixtures__/raio-x-regras.json";
import perfilFixture from "./__fixtures__/raio-x-perfil.json";
import diagnosticoFixture from "./__fixtures__/raio-x-diagnostico.json";

import {
  adaptarCartoes,
  adaptarOutrasRegras,
  adaptarPerfil,
  adaptarSecretaria,
  adaptarSecretarias,
  adaptarTotal,
  agregarPorNome,
  formatarGeradoEm,
  regraInicial,
  tiposDaSelecao,
} from "./adaptadores";
import { fmtPct, listaSecretarias, pct } from "./calculos";
import { nomeCurto } from "./nomes";
import type { DiagnosticoPainel, RaioXPerfil, RaioXRegras } from "./types";

const regras = regrasFixture as unknown as RaioXRegras;
const perfil = perfilFixture as unknown as RaioXPerfil;
const diagnostico = diagnosticoFixture as unknown as DiagnosticoPainel;

const cartoes = adaptarCartoes(regras.cartoes);
const secretarias = adaptarSecretarias(regras, cartoes);
const total = adaptarTotal(regras, cartoes);

describe("adaptarCartoes", () => {
  it("mantém os 7 cartões na ordem da API", () => {
    expect(cartoes.map((c) => c.id)).toEqual([
      "irrf",
      "salfam",
      "depCpf",
      "depNasc",
      "cert",
      "semEmail",
      "semFone",
    ]);
  });

  it("usa o título que veio do backend", () => {
    expect(cartoes[4].label).toBe("Certidão ausente");
    expect(cartoes[5].label).toBe("Servidor sem e-mail");
  });

  it("marca só a Certidão como crítica", () => {
    expect(cartoes.filter((c) => c.critica).map((c) => c.id)).toEqual(["cert"]);
  });

  it("descarta id desconhecido e duplicado", () => {
    const adaptados = adaptarCartoes([
      { id: "cert", titulo: "Certidão", regras: ["D12"], critica: true },
      { id: "cert", titulo: "Repetido", regras: [], critica: false },
      { id: "inventado", titulo: "Outro", regras: [], critica: false },
    ]);
    expect(adaptados).toHaveLength(1);
    expect(adaptados[0].label).toBe("Certidão");
  });

  it("não quebra quando a API manda lista vazia", () => {
    expect(adaptarCartoes([]).length).toBe(7);
  });

  it("escolhe o cartão crítico como regra inicial", () => {
    expect(regraInicial(cartoes)).toBe("cert");
  });
});

describe("números dos cartões", () => {
  it("Toda a Prefeitura usa a linha total, não a soma das divisões", () => {
    const porCartao = cartoes.map((c) => total[c.id]);
    expect(porCartao).toEqual([394, 439, 318, 6, 610, 265, 466]);
    expect(total.vinc).toBe(2463);
    expect(total.deps).toBe(3150);
  });

  it("Educação traz os números da divisão 000006", () => {
    const educacao = secretarias.find((s) => s.cod === "000006");
    expect(educacao).toBeDefined();
    expect(cartoes.map((c) => educacao![c.id])).toEqual([164, 175, 142, 3, 374, 101, 158]);
    expect(educacao!.vinc).toBe(1416);
    expect(educacao!.deps).toBe(1941);
  });

  it("média da Certidão na Prefeitura é 24,8%", () => {
    expect(fmtPct(pct(total.cert, total.vinc))).toBe("24,8%");
  });

  it("a soma das divisões não é usada como total", () => {
    const somaDasDivisoes = secretarias.reduce((acc, s) => acc + s.cert, 0);
    expect(somaDasDivisoes).not.toBe(total.cert);
  });

  it("conformidade da API vira a coluna de conformidade", () => {
    expect(total.confP5).toBeCloseTo(54.1);
    expect(secretarias.find((s) => s.cod === "000006")!.confP5).toBeCloseTo(62.9);
  });

  it("lotSetor fica zerado porque a API não expõe o dado", () => {
    expect(secretarias.every((s) => s.lotSetor === 0)).toBe(true);
  });
});

describe("filtro de vínculos", () => {
  it("30+ esconde as pequenas", () => {
    const filtradas = listaSecretarias(secretarias, "ALL", 30);
    expect(filtradas.map((s) => s.cod)).toEqual(["000006", "000005"]);
  });

  it("30+ mantém a secretaria selecionada mesmo com menos de 30 vínculos", () => {
    const filtradas = listaSecretarias(secretarias, "000099", 30);
    expect(filtradas.map((s) => s.cod)).toContain("000099");
  });
});

describe("nomes curtos", () => {
  it("usa o mapa para os códigos conhecidos", () => {
    expect(nomeCurto("000006", "SECRETARIA MUNICIPAL DE EDUCAÇÃO")).toBe("Educação");
    expect(nomeCurto("000005", "")).toBe("Saúde");
    expect(nomeCurto("SEM", "")).toBe("Sem divisão");
  });

  it("cai na caixa de título para código desconhecido", () => {
    const obras = secretarias.find((s) => s.cod === "000099");
    expect(obras!.curto).toBe("Secretaria Municipal de Obras e Serviços Urbanos");
  });

  it("rótulo do total", () => {
    expect(total.curto).toBe("Toda a Prefeitura");
  });
});

describe("perfil (aba Panorama)", () => {
  it("converte os itens em tuplas por divisão", () => {
    const adaptado = adaptarPerfil(perfil);
    expect(adaptado.locais["000006"]).toEqual([
      ["ESCOLA MUNICIPAL CENTRAL", 120],
      ["Local não identificado", 40],
    ]);
    expect(adaptado.cargos["000005"][1]).toEqual(["ENFERMEIRO", 60]);
  });

  it("agrupa pelo nome quando é Toda a Prefeitura", () => {
    const adaptado = adaptarPerfil(perfil);
    const locais = agregarPorNome(Object.values(adaptado.locais));
    expect(locais.find(([nome]) => nome === "ESCOLA MUNICIPAL CENTRAL")).toEqual([
      "ESCOLA MUNICIPAL CENTRAL",
      135,
    ]);
  });

  it("tipos de vínculo somam em ALL e filtram na divisão", () => {
    const adaptado = adaptarPerfil(perfil);
    expect(tiposDaSelecao(adaptado.tipos, "ALL")).toEqual([
      ["Estatutário", 1700],
      ["Comissionado", 248],
    ]);
    expect(tiposDaSelecao(adaptado.tipos, "000005")).toEqual([
      ["Estatutário", 500],
      ["Comissionado", 32],
    ]);
  });

  it("seleção sem perfil devolve lista vazia", () => {
    const adaptado = adaptarPerfil(perfil);
    expect(tiposDaSelecao(adaptado.tipos, "999999")).toEqual([]);
  });
});

describe("outras regras (aba Inconsistências)", () => {
  it("exclui as regras que já estão em cartões e as sem servidores", () => {
    const alertas = adaptarOutrasRegras(diagnostico, regras.cartoes);
    expect(alertas.map((a) => a.t)).toEqual([
      "Dependente com CPF inválido",
      "Servidor sem PIS",
    ]);
    expect(alertas[0].valor).toBe(27);
  });

  // O `tipo` é o que separa erro de recadastro e de constatação no gráfico de
  // barras; se o adapter parar de repassá-lo, as barras ficam todas neutras.
  it("repassa o tipo que o backend classificou", () => {
    const alertas = adaptarOutrasRegras(diagnostico, regras.cartoes);
    expect(alertas.map((a) => a.tipo)).toEqual(["erro", "alerta"]);
  });

  it("usa o número da divisão quando ela é a selecionada", () => {
    const educacao = regras.divisoes[0];
    const alertas = adaptarOutrasRegras(diagnostico, regras.cartoes, educacao);
    expect(alertas[0].valor).toBe(27);
  });

  it("esconde a regra que está zerada na divisão selecionada", () => {
    const divisao = { ...regras.divisoes[0], regras: { D20: 0 } };
    const alertas = adaptarOutrasRegras(diagnostico, regras.cartoes, divisao);
    expect(alertas.map((a) => a.t)).toEqual(["Servidor sem PIS"]);
  });

  it("tolera painel ausente", () => {
    expect(adaptarOutrasRegras(null, regras.cartoes)).toEqual([]);
  });
});

describe("adaptarSecretaria", () => {
  it("zera cartão que a divisão não devolveu", () => {
    const linha = {
      ...regras.divisoes[0],
      cartoes: { cert: 10 },
    };
    const secretaria = adaptarSecretaria(linha, cartoes);
    expect(secretaria.cert).toBe(10);
    expect(secretaria.irrf).toBe(0);
    expect(secretaria.semFone).toBe(0);
  });
});

describe("formatarGeradoEm", () => {
  it("formata ISO em pt-BR", () => {
    expect(formatarGeradoEm("2026-10-20T02:26:36.859829+00:00")).toMatch(
      /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/,
    );
  });

  it("devolve o texto original quando não é data", () => {
    expect(formatarGeradoEm("ontem")).toBe("ontem");
    expect(formatarGeradoEm("")).toBe("—");
  });
});

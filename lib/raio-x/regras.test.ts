import { describe, expect, it } from "vitest";

import { agruparCartoes, COR_CARD, ORDEM_CARDS, REGRAS_CONHECIDAS, ROTULO_CARD } from "./regras";
import type { RegraDef, RegraId } from "./types";

const CARTOES: RegraDef[] = [
  { id: "irrf", label: "IRRF acima da idade", critica: false },
  { id: "salfam", label: "Salário-família acima da idade", critica: false },
  { id: "depCpf", label: "Dependente sem CPF", critica: false },
  { id: "depNasc", label: "Dependente sem nascimento", critica: false },
  { id: "cert", label: "Certidão ausente", critica: true },
  { id: "semEmail", label: "Servidor sem e-mail", critica: false },
  { id: "semFone", label: "Servidor sem celular", critica: false },
];

describe("grupos de cards da coluna de pendências", () => {
  it("põe dependentes antes de contato, na ordem pedida", () => {
    const grupos = agruparCartoes(CARTOES);

    expect(grupos.map((grupo) => grupo.titulo)).toEqual(["Dependentes", "Contato do servidor"]);
    expect(grupos[0].itens.map((cartao) => cartao.id)).toEqual([
      "cert",
      "depCpf",
      "depNasc",
      "irrf",
      "salfam",
    ]);
    expect(grupos[1].itens.map((cartao) => cartao.id)).toEqual(["semEmail", "semFone"]);
  });

  // A ordem é da tela, não da resposta: a API pode mandar em qualquer sequência.
  it("ignora a ordem em que a API mandou", () => {
    const grupos = agruparCartoes([...CARTOES].reverse());

    expect(grupos[0].itens.map((cartao) => cartao.id)).toEqual([
      "cert",
      "depCpf",
      "depNasc",
      "irrf",
      "salfam",
    ]);
  });

  it("não desenha grupo sem cartão na resposta", () => {
    const soDependentes = CARTOES.filter((c) => c.id !== "semEmail" && c.id !== "semFone");

    expect(agruparCartoes(soDependentes).map((grupo) => grupo.titulo)).toEqual(["Dependentes"]);
  });

  // Guarda-corpo: id novo no backend sem grupo aqui não pode sumir da tela —
  // esta coluna é o único seletor de pendência.
  it("recolhe em 'Outras pendências' o cartão que ficou fora dos grupos", () => {
    const comRegraNova: RegraDef[] = [
      ...CARTOES,
      { id: "inventado" as RegraId, label: "Regra nova", critica: false },
    ];

    const grupos = agruparCartoes(comRegraNova);

    expect(grupos.map((grupo) => grupo.titulo)).toEqual([
      "Dependentes",
      "Contato do servidor",
      "Outras pendências",
    ]);
    expect(grupos[2].itens.map((cartao) => cartao.id)).toEqual(["inventado"]);
  });

  it("devolve nada quando a API não manda cartão", () => {
    expect(agruparCartoes([])).toEqual([]);
  });
});

describe("rótulo curto do card", () => {
  // É o texto que o Ademar pediu em 25/10/2026; mudar a copy é mudar o contrato.
  it("diz a mesma coisa que o nome longo, em menos palavras", () => {
    expect(ROTULO_CARD).toEqual({
      cert: "Sem certidão",
      depCpf: "Sem CPF",
      depNasc: "Sem data de nascimento",
      irrf: "IRRF fora da idade",
      salfam: "Salário-família fora da idade",
      semEmail: "Sem e-mail",
      semFone: "Sem celular",
    });
  });

  it("tem rótulo para toda regra conhecida", () => {
    for (const id of REGRAS_CONHECIDAS) expect(ROTULO_CARD[id]).toBeTruthy();
  });

  // O card tem ~127px de largura útil; acima de 30 caracteres o rótulo ocupa
  // três linhas e empurra o número para fora do card de 76px.
  it("não passa de 30 caracteres", () => {
    for (const rotulo of Object.values(ROTULO_CARD)) {
      expect(rotulo.length).toBeLessThanOrEqual(30);
    }
  });
});

describe("ordem única das pendências", () => {
  // É a ordem dos gráficos do Comparativo e das colunas da tabela. Se divergir
  // de `GRUPOS_CARDS`, a mesma pendência aparece em posições diferentes na
  // mesma tela.
  it("achata os grupos na ordem dos cards", () => {
    expect(ORDEM_CARDS).toEqual(["cert", "depCpf", "depNasc", "irrf", "salfam", "semEmail", "semFone"]);
  });

  it("cobre as sete regras uma vez cada", () => {
    expect(ORDEM_CARDS).toHaveLength(REGRAS_CONHECIDAS.length);
    expect(new Set(ORDEM_CARDS).size).toBe(ORDEM_CARDS.length);
  });
});

describe("cor de cada pendência", () => {
  it("existe para toda regra conhecida", () => {
    for (const id of REGRAS_CONHECIDAS) {
      expect(COR_CARD[id]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  // Cor repetida em duas pendências faria dois segmentos da mesma barra
  // parecerem a mesma coisa.
  it("não repete cor", () => {
    expect(new Set(Object.values(COR_CARD)).size).toBe(Object.keys(COR_CARD).length);
  });
});

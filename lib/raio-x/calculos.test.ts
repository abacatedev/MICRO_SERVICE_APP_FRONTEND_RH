import { describe, expect, it } from "vitest";

import { SECRETARIAS } from "./mock";
import {
  listaSecretarias,
  mediaPrefeitura,
  rankingCasos,
  seriePorSecretaria,
  totaisDe,
} from "./calculos";

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

  it("marca acima da média em laranja (Educação) e abaixo em azul (Saúde)", () => {
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

/**
 * Derivações puras da tela Raio-X. Nenhum acesso a React, rede ou estado.
 * Todas as funções recebem a lista já filtrada — fáceis de testar.
 */

import { RX, corDaFatia } from "./cores";
import { REGRAS_CONHECIDAS } from "./regras";
import type {
  Alerta,
  CategoriaQualidade,
  Fatia,
  FiltroState,
  MinVinc,
  RankingItem,
  RegraDef,
  RegraId,
  Secretaria,
  Totais,
  VolumePonto,
  PontoSecretaria,
} from "./types";

export const numero = new Intl.NumberFormat("pt-BR");
export const umaCasa = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function fmtNum(valor: number): string {
  return numero.format(valor);
}

export function fmtPct(valor: number): string {
  return `${umaCasa.format(valor)}%`;
}

export function pct(parte: number, total: number): number {
  if (!total) return 0;
  return (parte / total) * 100;
}

export function valorRegra(secretaria: Secretaria, regra: RegraId): number {
  return secretaria[regra];
}

/** Soma dos apontamentos das 7 regras em uma secretaria (pode repetir o vínculo entre regras). */
export function apontamentosTotais(secretaria: Secretaria): number {
  return REGRAS_CONHECIDAS.reduce((acc, id) => acc + secretaria[id], 0);
}

/** Média da Prefeitura: sempre sobre todas as secretarias, independente de filtro. */
export function mediaPrefeitura(secretarias: Secretaria[], regra: RegraId): number {
  const totalVinc = secretarias.reduce((acc, s) => acc + s.vinc, 0);
  const totalRegra = secretarias.reduce((acc, s) => acc + s[regra], 0);
  return pct(totalRegra, totalVinc);
}

/**
 * Média da Prefeitura a partir da linha `ALL` da API.
 * Preferir esta: o backend conta cada vínculo uma vez, a soma das divisões não.
 */
export function mediaDoTotal(total: Secretaria, regra: RegraId): number {
  return pct(total[regra], total.vinc);
}

/** Lista comparativa: respeita minVinc, mas nunca esconde a secretaria selecionada. */
export function listaSecretarias(
  secretarias: Secretaria[],
  sec: string,
  minVinc: MinVinc,
): Secretaria[] {
  return secretarias
    .filter((s) => s.vinc >= minVinc || s.cod === sec)
    .sort((a, b) => b.vinc - a.vinc);
}

/** Conjunto que alimenta cards, header e abas Quadro/Qualidade. */
export function alvoDaSelecao(
  secretarias: Secretaria[],
  sec: string,
  minVinc: MinVinc,
): Secretaria[] {
  if (sec === "ALL") return listaSecretarias(secretarias, sec, minVinc);
  const encontrada = secretarias.find((s) => s.cod === sec);
  return encontrada ? [encontrada] : [];
}

export function totaisDe(lista: Secretaria[]): Totais {
  return lista.reduce<Totais>(
    (acc, s) => ({
      vinc: acc.vinc + s.vinc,
      deps: acc.deps + s.deps,
      irrf: acc.irrf + s.irrf,
      salfam: acc.salfam + s.salfam,
      depCpf: acc.depCpf + s.depCpf,
      depNasc: acc.depNasc + s.depNasc,
      cert: acc.cert + s.cert,
      semEmail: acc.semEmail + s.semEmail,
      semFone: acc.semFone + s.semFone,
    }),
    { vinc: 0, deps: 0, irrf: 0, salfam: 0, depCpf: 0, depNasc: 0, cert: 0, semEmail: 0, semFone: 0 },
  );
}

export function totalLotacao(lista: Secretaria[]): number {
  return lista.reduce((acc, s) => acc + s.lotSetor, 0);
}

export function totalPisFicticio(lista: Secretaria[], pisFicticio: Record<string, number>): number {
  return lista.reduce((acc, s) => acc + (pisFicticio[s.cod] ?? 0), 0);
}

/** Série do gráfico A: % dos vínculos por secretaria, na ordem de vínculos. */
export function seriePorSecretaria(
  lista: Secretaria[],
  regra: RegraId,
  media: number,
  sec: string,
): PontoSecretaria[] {
  return lista.map((s) => {
    const valor = pct(s[regra], s.vinc);
    return {
      cod: s.cod,
      curto: s.curto,
      vinc: s.vinc,
      valor,
      rotulo: fmtPct(valor),
      acima: valor > media,
      selecionada: s.cod === sec,
    };
  });
}

/** Série do gráfico B: peso da regra em foco sobre o volume de apontamentos. */
export function volumePorSecretaria(
  lista: Secretaria[],
  regra: RegraId,
  sec: string,
): VolumePonto[] {
  return lista.map((s) => {
    const foco = s[regra];
    const demais = apontamentosTotais(s) - foco;
    return {
      cod: s.cod,
      curto: s.curto,
      foco,
      demais,
      total: foco + demais,
      selecionada: s.cod === sec,
    };
  });
}

/** Gráfico C: ranking absoluto da regra em foco. */
export function rankingCasos(
  lista: Secretaria[],
  regra: RegraId,
  sec: string,
  limite = 7,
): RankingItem[] {
  const ordenado = [...lista].sort((a, b) => b[regra] - a[regra]).slice(0, limite);
  const maior = ordenado.length ? ordenado[0][regra] : 0;
  return ordenado.map((s) => ({
    cod: s.cod,
    curto: s.curto,
    valor: s[regra],
    largura: pct(s[regra], maior),
    selecionada: s.cod === sec,
  }));
}

/** Donut 1 do Quadro: 6 maiores + "Demais N secretarias". */
export function fatiasSecretarias(lista: Secretaria[], max = 6): Fatia[] {
  const ordenada = [...lista].sort((a, b) => b.vinc - a.vinc);
  const topo = ordenada.slice(0, max);
  const resto = ordenada.slice(max);
  const fatias: Fatia[] = topo.map((s, i) => ({
    label: s.curto,
    value: s.vinc,
    color: corDaFatia(i),
    cod: s.cod,
  }));

  if (resto.length) {
    fatias.push({
      label: `Demais ${resto.length} ${resto.length === 1 ? "secretaria" : "secretarias"}`,
      value: resto.reduce((acc, s) => acc + s.vinc, 0),
      color: RX.demais,
    });
  }

  return fatias;
}

/** Donut 2 do Quadro: locais com 3+ vínculos da seleção. */
export function fatiasLocais(
  alvo: Secretaria[],
  locais: Record<string, [string, number][]>,
  max = 6,
): Fatia[] {
  const mapa = new Map<string, number>();
  alvo.forEach((s) => {
    (locais[s.cod] ?? []).forEach(([nome, qtd]) => {
      mapa.set(nome, (mapa.get(nome) ?? 0) + qtd);
    });
  });

  const itens = [...mapa.entries()]
    .filter(([, qtd]) => qtd >= 3)
    .sort((a, b) => b[1] - a[1]);

  const topo = itens.slice(0, max);
  const resto = itens.slice(max);

  const fatias: Fatia[] = topo.map(([nome, qtd], i) => ({
    label: nome,
    value: qtd,
    color: nome === "Local não identificado" ? RX.ambar : corDaFatia(i),
  }));

  if (resto.length) {
    fatias.push({
      label: `Demais ${resto.length} ${resto.length === 1 ? "local" : "locais"}`,
      value: resto.reduce((acc, [, qtd]) => acc + qtd, 0),
      color: RX.demais,
    });
  }

  return fatias;
}

/** Barras horizontais: cargos com 5+ vínculos, até 8. */export function cargosDaSelecao(
  alvo: Secretaria[],
  cargos: Record<string, [string, number][]>,
  max = 8,
): Fatia[] {
  const mapa = new Map<string, number>();
  alvo.forEach((s) => {
    (cargos[s.cod] ?? []).forEach(([nome, qtd]) => {
      mapa.set(nome, (mapa.get(nome) ?? 0) + qtd);
    });
  });

  return [...mapa.entries()]
    .filter(([, qtd]) => qtd >= 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([nome, qtd], i) => ({
      label: nome,
      value: qtd,
      color: corDaFatia(i),
    }));
}

/** Quantidade de locais distintos com 3+ vínculos na seleção. */
export function contarLocais(
  alvo: Secretaria[],
  locais: Record<string, [string, number][]>,
): number {
  const mapa = new Map<string, number>();
  alvo.forEach((s) => {
    (locais[s.cod] ?? []).forEach(([nome, qtd]) => {
      mapa.set(nome, (mapa.get(nome) ?? 0) + qtd);
    });
  });
  return [...mapa.values()].filter((qtd) => qtd >= 3).length;
}

export function fatiasTipoVinculo(tipo: [string, number][]): Fatia[] {  return tipo.map(([nome, qtd], i) => ({
    label: nome,
    value: qtd,
    color: corDaFatia(i),
  }));
}

/** Aba Qualidade: 5 categorias de inconsistência. */
export function categoriasQualidade(
  alvo: Secretaria[],
  pisFicticio: Record<string, number>,
): CategoriaQualidade[] {
  const t = totaisDe(alvo);
  return [
    {
      label: "Dependentes",
      detalhe: "IRRF idade · salário-família · CPF · nascimento",
      value: t.irrf + t.salfam + t.depCpf + t.depNasc,
      color: RX.azul,
    },
    {
      label: "Documentação",
      detalhe: "Certidão incompleta",
      value: t.cert,
      color: RX.critico,
    },
    {
      label: "Contato",
      detalhe: "Servidor sem e-mail ou telefone",
      value: t.semEmail + t.semFone,
      color: RX.verde,
    },
    {
      label: "Lotação",
      detalhe: "Subdivisão errada",
      value: totalLotacao(alvo),
      color: RX.ouro,
    },
    {
      label: "Servidor",
      detalhe: "PIS ausente ou fictício",
      value: totalPisFicticio(alvo, pisFicticio),
      color: RX.roxo,
    },
  ];
}

export function alertasVisiveis(alertas: Alerta[]): Alerta[] {
  return alertas;
}

export function podeLimpar(state: FiltroState, regraPadrao: RegraId = "cert"): boolean {
  return state.sec !== "ALL" || state.regra !== regraPadrao || state.minVinc !== 1;
}

/** Título do cartão vem da API; o id é o último recurso. */
export function rotuloRegra(regra: RegraId, cartoes?: RegraDef[]): string {
  return cartoes?.find((c) => c.id === regra)?.label ?? regra;
}

export function regraCritica(regra: RegraId, cartoes?: RegraDef[]): boolean {
  return cartoes?.find((c) => c.id === regra)?.critica ?? false;
}

/** Cor de destaque da regra em foco. */
export function corDaRegra(regra: RegraId, cartoes?: RegraDef[]): string {
  return regraCritica(regra, cartoes) ? RX.critico : RX.azul;
}

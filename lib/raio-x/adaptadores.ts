/**
 * Ponte única entre a API do backend e os componentes da tela.
 *
 * Nada aqui acessa rede ou React: são funções puras, testáveis com as fixtures
 * de `__fixtures__/`. Se o contrato do backend mudar, muda só este arquivo.
 *
 * Regras que vêm do backend e não podem ser recalculadas no front:
 * - os totais da Prefeitura vêm de `total`, nunca da soma das divisões;
 * - a média é `total.cartoes[id] / total.vinculos`;
 * - os cartões (ordem, título, crítica) vêm de `cartoes`.
 */

import { nomeCurto } from "./nomes";
import { REGRAS_RESERVA, ehRegraConhecida } from "./regras";
import type {
  Alerta,
  Cartao,
  DiagnosticoPainel,
  ItemContagem,
  LinhaDivisao,
  RaioXPerfil,
  RaioXRegras,
  RegraDef,
  RegraId,
  Secretaria,
} from "./types";

type Lista = [string, number][];

function num(valor: unknown): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) ? n : 0;
}

/** Cartões na ordem da API, apenas com ids que a UI sabe desenhar. */
export function adaptarCartoes(cartoes: Cartao[] = []): RegraDef[] {
  const vistos = new Set<string>();
  const saida: RegraDef[] = [];

  for (const cartao of cartoes) {
    const id = String(cartao?.id ?? "");
    if (!ehRegraConhecida(id) || vistos.has(id)) continue;
    vistos.add(id);
    saida.push({ id, label: cartao.titulo?.trim() || id, critica: Boolean(cartao.critica) });
  }

  // Rede de segurança: se a API não mandar nada, a tela ainda abre.
  if (saida.length === 0) {
    return REGRAS_RESERVA.map((id) => ({ id, label: id, critica: id === "cert" }));
  }

  return saida;
}

export function adaptarSecretaria(
  linha: LinhaDivisao,
  cartoes: RegraDef[] = adaptarCartoes(),
): Secretaria {
  const secretaria: Secretaria = {
    cod: String(linha?.codigo ?? ""),
    curto:
      String(linha?.codigo ?? "") === "ALL"
        ? "Toda a Prefeitura"
        : nomeCurto(String(linha?.codigo ?? ""), String(linha?.nome ?? "")),
    vinc: num(linha?.vinculos),
    deps: num(linha?.dependentes),
    // A API não expõe "subdivisão errada" por divisão; fica zerado até existir.
    lotSetor: 0,
    // A API expõe conformidade geral (% sem pendência). É o que a tabela mostra.
    confP5: num(linha?.conformidade),
    irrf: 0,
    salfam: 0,
    depCpf: 0,
    depNasc: 0,
    cert: 0,
    semEmail: 0,
    semFone: 0,
  };

  for (const cartao of cartoes) {
    secretaria[cartao.id] = num(linha?.cartoes?.[cartao.id]);
  }

  return secretaria;
}

export function adaptarSecretarias(regras: RaioXRegras, cartoes: RegraDef[]): Secretaria[] {
  return (regras?.divisoes ?? []).map((linha) => adaptarSecretaria(linha, cartoes));
}

/** Linha `ALL`: base de todos os números da Prefeitura. */
export function adaptarTotal(regras: RaioXRegras, cartoes: RegraDef[]): Secretaria {
  return adaptarSecretaria(regras.total, cartoes);
}

function paraLista(itens: ItemContagem[] = []): Lista {
  return itens
    .map((item): Lista[number] => [String(item?.nome ?? "").trim(), num(item?.vinculos)])
    .filter(([nome]) => nome !== "");
}

/** Soma várias listas agrupando pelo nome (usado em "Toda a Prefeitura"). */
export function agregarPorNome(listas: Lista[]): Lista {
  const mapa = new Map<string, number>();
  for (const lista of listas) {
    for (const [nome, quantidade] of lista) {
      mapa.set(nome, (mapa.get(nome) ?? 0) + quantidade);
    }
  }
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

export interface PerfilAdaptado {
  locais: Record<string, Lista>;
  cargos: Record<string, Lista>;
  /** Tipos de vínculo por divisão — a tela escolhe conforme a seleção. */
  tipos: Record<string, Lista>;
}

export function adaptarPerfil(perfil: RaioXPerfil | null | undefined): PerfilAdaptado {
  const locais: Record<string, Lista> = {};
  const cargos: Record<string, Lista> = {};
  const tipos: Record<string, Lista> = {};

  for (const [codigo, dados] of Object.entries(perfil?.divisoes ?? {})) {
    const l = paraLista(dados?.locais);
    const c = paraLista(dados?.cargos);
    const t = paraLista(dados?.tipos_vinculo);
    if (l.length) locais[codigo] = l;
    if (c.length) cargos[codigo] = c;
    if (t.length) tipos[codigo] = t;
  }

  return { locais, cargos, tipos };
}

/** Tipos de vínculo da seleção: tudo somado em "ALL", só a divisão caso contrário. */
export function tiposDaSelecao(tipos: Record<string, Lista>, sec: string): Lista {
  if (sec === "ALL") return agregarPorNome(Object.values(tipos));
  return tipos[sec] ?? [];
}

/**
 * Regras de `/rh/diagnostico` que não aparecem em nenhum cartão e têm ocorrência
 * na seleção atual. Com uma divisão selecionada, o número e o filtro usam
 * `divisao.regras[codigo]` — senão a lista mostraria linhas zeradas.
 */
export function adaptarOutrasRegras(
  painel: DiagnosticoPainel | null | undefined,
  cartoes: Cartao[] = [],
  divisao?: LinhaDivisao,
): Alerta[] {
  const dentroDosCartoes = new Set<string>();
  for (const cartao of cartoes) {
    for (const codigo of cartao?.regras ?? []) dentroDosCartoes.add(codigo);
  }

  return (painel?.regras ?? [])
    .filter((regra) => !dentroDosCartoes.has(regra.codigo))
    .map((regra) => {
      const daDivisao = divisao?.regras?.[regra.codigo];
      const quantidade = daDivisao === undefined ? num(regra.servidores) : num(daDivisao);
      return { regra, quantidade };
    })
    .filter(({ quantidade }) => quantidade > 0)
    .map(({ regra, quantidade }) => ({
      t: regra.titulo?.trim() || regra.codigo,
      d: regra.descricao?.trim() || "",
      valor: quantidade,
      // `tipo` vem do backend e é o que separa erro de recadastro e de
      // constatação. Sem ele a barra sai neutra — nunca chutamos severidade.
      tipo: regra.tipo,
    }))
    .filter((alerta) => alerta.t !== "");
}

/** `2026-10-20T02:26:36+00:00` → `20/10/2026 02:26` (pt-BR). */
export function formatarGeradoEm(iso: string): string {
  if (!iso) return "—";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

/** Cartão crítico vira a regra em foco inicial; se não houver, o primeiro. */
export function regraInicial(cartoes: RegraDef[]): RegraId {
  return cartoes.find((cartao) => cartao.critica)?.id ?? cartoes[0]?.id ?? "cert";
}

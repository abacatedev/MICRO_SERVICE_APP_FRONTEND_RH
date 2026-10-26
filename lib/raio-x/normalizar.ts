/**
 * Normaliza o payload agregado do backend para o formato interno da tela.
 *
 * O contrato combinado está em `docs/raio-x-backend.md`. Como o backend pode
 * devolver os campos aninhados (`regras.irrf`) ou achatados (`irrf`), e as listas
 * como objeto (`{ nome, vinculos }`) ou tupla (`[nome, vinculos]`), este módulo
 * aceita as duas formas. É função pura: dá para testar sem rede.
 */

import { REGRAS_RESERVA } from "./regras";
import type { Alerta, RaioXData, Secretaria } from "./types";

type Objeto = Record<string, unknown>;

function ehObjeto(valor: unknown): valor is Objeto {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function comoObjeto(valor: unknown): Objeto | null {
  return ehObjeto(valor) ? valor : null;
}

function comoArray(valor: unknown): unknown[] {
  return Array.isArray(valor) ? valor : [];
}

/** Primeiro valor presente (não `undefined` nem `null`) entre as chaves dadas. */
function primeiro(obj: Objeto | null, ...chaves: string[]): unknown {
  if (!obj) return undefined;
  for (const chave of chaves) {
    const valor = obj[chave];
    if (valor !== undefined && valor !== null) return valor;
  }
  return undefined;
}

/** Aceita `2463`, `"2463"`, `"2.463"` e `"2.463,00"`. */
export function numero(valor: unknown): number {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  if (typeof valor !== "string") return 0;

  const limpo = valor.trim();
  if (!limpo) return 0;

  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo.replace(/\.(?=\d{3}(\D|$))/g, "");

  const n = Number(normalizado.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function texto(valor: unknown): string {
  if (typeof valor === "string") return valor.trim();
  if (typeof valor === "number") return String(valor);
  return "";
}

function normalizarSecretaria(bruto: Objeto): Secretaria {
  const regras = comoObjeto(bruto.regras) ?? comoObjeto(bruto.regra) ?? {};

  // Procura na regra aninhada primeiro; se não existir, cai no nível da secretaria.
  const valor = (...chaves: string[]): number =>
    numero(primeiro(regras, ...chaves) ?? primeiro(bruto, ...chaves));

  return {
    cod: texto(primeiro(bruto, "cod", "codigo", "cod_divisao", "divisao")),
    curto: texto(primeiro(bruto, "curto", "nome_curto", "nome", "descricao")),
    vinc: valor("vinc", "vinculos", "vinculos_ativos"),
    deps: valor("deps", "dependentes"),
    depCpf: valor("depCpf", "dep_cpf", "dependente_sem_cpf"),
    depNasc: valor("depNasc", "dep_nasc", "dependente_sem_nascimento"),
    cert: valor("cert", "certidao", "certidao_incompleta"),
    irrf: valor("irrf", "irrf_idade"),
    salfam: valor("salfam", "sal_familia", "salario_familia"),
    lotSetor: valor("lotSetor", "lot_setor", "subdivisao_errada"),
    semEmail: valor("semEmail", "sem_email"),
    semFone: valor("semFone", "sem_fone", "sem_telefone"),
    confP5: valor("confP5", "conf_p5", "conformidade_p5"),
  };
}

function normalizarLista(valor: unknown): [string, number][] {
  const itens: ([string, number] | null)[] = comoArray(valor).map((item) => {
    if (Array.isArray(item)) {
      const nome = texto(item[0]);
      return nome ? ([nome, numero(item[1])] as [string, number]) : null;
    }

    const obj = comoObjeto(item);
    if (!obj) return null;

    const nome = texto(primeiro(obj, "nome", "label", "local", "cargo", "descricao", "titulo"));
    if (!nome) return null;

    const quantidade = numero(primeiro(obj, "vinculos", "vinc", "total", "quantidade", "value"));
    return [nome, quantidade] as [string, number];
  });

  return itens.filter((item): item is [string, number] => item !== null);
}

function normalizarMapa(valor: unknown): Record<string, [string, number][]> {
  const obj = comoObjeto(valor);
  if (!obj) return {};

  const saida: Record<string, [string, number][]> = {};
  for (const [chave, lista] of Object.entries(obj)) {
    const normalizada = normalizarLista(lista);
    if (normalizada.length) saida[chave] = normalizada;
  }
  return saida;
}

function normalizarContagem(valor: unknown): Record<string, number> {
  const obj = comoObjeto(valor);
  if (!obj) return {};

  const saida: Record<string, number> = {};
  for (const [chave, v] of Object.entries(obj)) saida[chave] = numero(v);
  return saida;
}

function normalizarAlertas(valor: unknown): Alerta[] {
  return comoArray(valor)
    .map((item): Alerta => {
      const obj = comoObjeto(item) ?? {};
      return {
        t: texto(primeiro(obj, "t", "titulo", "texto", "label")),
        d: texto(primeiro(obj, "d", "descricao", "detalhe")),
        valor: numero(primeiro(obj, "valor", "n", "numero", "quantidade", "servidores")),
      };
    })
    .filter((alerta) => alerta.t !== "");
}

/** Alguns backends embrulham o payload em `{ data: ... }`. */
function desembrulhar(bruto: unknown): Objeto {
  const obj = comoObjeto(bruto);
  if (!obj) throw new Error("A resposta do backend não é um objeto JSON.");

  if (Array.isArray(obj.secretarias)) return obj;

  for (const chave of ["data", "dados", "resultado", "result", "payload"]) {
    const interno = comoObjeto(obj[chave]);
    if (interno && Array.isArray(interno.secretarias)) return interno;
  }

  return obj;
}

/**
 * Converte o payload do backend no `RaioXData` que a tela consome.
 * Lança `Error` com mensagem legível quando o payload não serve.
 */
export function normalizarRaioX(bruto: unknown): RaioXData {
  const obj = desembrulhar(bruto);

  const secretarias = comoArray(obj.secretarias)
    .map((item) => {
      const registro = comoObjeto(item);
      return registro ? normalizarSecretaria(registro) : null;
    })
    .filter((s): s is Secretaria => s !== null && (s.cod !== "" || s.curto !== ""));

  if (secretarias.length === 0) {
    throw new Error("O backend respondeu sem a lista `secretarias` (ou ela veio vazia).");
  }

  // Sanidade: o universo declarado precisa bater com a soma por secretaria.
  const universo = comoObjeto(obj.universo);
  const totalDeclarado = numero(primeiro(universo, "vinculos", "vinc"));
  const totalSomado = secretarias.reduce((acc, s) => acc + s.vinc, 0);

  if (totalDeclarado > 0 && totalDeclarado !== totalSomado) {
    console.warn(
      `[raio-x] universo.vinculos (${totalDeclarado}) difere da soma por secretaria (${totalSomado}).`,
    );
  }

  return {
    secretarias,
    total: somarSecretarias(secretarias),
    cartoes: REGRAS_RESERVA.map((id) => ({ id, label: id, critica: id === "cert" })),
    locais: normalizarMapa(obj.locais),
    cargos: normalizarMapa(obj.cargos),
    tipoVinculo: normalizarLista(obj.tipoVinculo ?? obj.tipo_vinculo),
    pisFicticio: normalizarContagem(obj.pisFicticio ?? obj.pis_ficticio),
    alertas: normalizarAlertas(obj.alertas),
    faixaDependentes: normalizarContagem(obj.faixaDependentes ?? obj.faixa_dependentes),
    atualizadoEm: texto(primeiro(obj, "atualizadoEm", "atualizado_em", "data_atualizacao")),
  };
}

/** Linha sintética da Prefeitura, usada só por este normalizador legado. */
function somarSecretarias(lista: Secretaria[]): Secretaria {
  const campos = [
    "vinc",
    "deps",
    "depCpf",
    "depNasc",
    "cert",
    "irrf",
    "salfam",
    "lotSetor",
    "semEmail",
    "semFone",
  ] as const;

  const total: Secretaria = {
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
  };

  for (const item of lista) {
    for (const campo of campos) total[campo] += item[campo];
  }

  return total;
}

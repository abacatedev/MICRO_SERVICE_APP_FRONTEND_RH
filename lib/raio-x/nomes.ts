/**
 * Mapa `código da divisão → nome curto` usado nos eixos, legendas e tabela.
 *
 * Os nomes completos do SIP são longos (e às vezes vêm truncados), então a tela
 * usa esta versão curta. Código fora do mapa cai em `nomeEmTitulo`.
 */

export const NOME_CURTO: Record<string, string> = {
  "000006": "Educação",
  "000005": "Saúde",
  "000011": "Assistência Social",
  "000003": "Administração",
  "000001": "Gabinete",
  "000013": "Fazenda",
  "000007": "Infraestrutura",
  "000008": "Turismo e Cultura",
  "000014": "Meio Ambiente",
  "000012": "Esporte e Lazer",
  "000004": "Finanças",
  "000002": "Assuntos Estratégicos",
  "000010": "Agricultura",
  "000009": "Planejamento",
  SEM: "Sem divisão",
};

/** Converte "SECRETARIA MUNICIPAL DE EDUCAÇÃO" em "Secretaria Municipal de Educação". */
export function nomeEmTitulo(nome: string): string {
  const minusculo = nome.toLocaleLowerCase("pt-BR").trim();
  if (!minusculo) return "";

  const conectores = new Set(["de", "da", "do", "das", "dos", "e", "a", "o", "em"]);

  return minusculo
    .split(/\s+/)
    .map((palavra, indice) =>
      indice > 0 && conectores.has(palavra)
        ? palavra
        : palavra.charAt(0).toLocaleUpperCase("pt-BR") + palavra.slice(1),
    )
    .join(" ");
}

/** Nome curto do código; se não houver, o nome completo em caixa de título. */
export function nomeCurto(codigo: string, nomeCompleto = ""): string {
  const doMapa = NOME_CURTO[codigo];
  if (doMapa) return doMapa;
  if (nomeCompleto.trim()) return nomeEmTitulo(nomeCompleto);
  return codigo || "—";
}

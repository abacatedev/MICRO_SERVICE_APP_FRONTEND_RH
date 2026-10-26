/**
 * Monta uma URL com query params de forma segura.
 *
 * - Ignora `undefined`, `null` e `""`.
 * - Para arrays, repete a chave (`reduzido=12&reduzido=228`).
 * - Só acrescenta `?` quando houver parâmetro.
 *
 * Exemplo:
 *   montarUrl("/api/rh/afastamentos/vigentes", { reduzido: "12" })
 *   → "/api/rh/afastamentos/vigentes?reduzido=12"
 */

export type Parametro =
  | string
  | number
  | boolean
  | undefined
  | null
  | Array<string | number | boolean>;

export function montarUrl(
  caminho: string,
  params?: Record<string, Parametro>,
): string {
  if (!params) return caminho;

  const p = new URLSearchParams();

  for (const [chave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === null || valor === "") continue;

    if (Array.isArray(valor)) {
      for (const item of valor) {
        if (item === undefined || item === null || item === "") continue;
        p.append(chave, String(item));
      }
    } else {
      p.set(chave, String(valor));
    }
  }

  const q = p.toString();
  return q ? `${caminho}?${q}` : caminho;
}

import { NextResponse } from "next/server";

/**
 * Ponte para o login do backend.
 *
 * O cliente chama `/api/rh/login?retorno=<url do frontend>` e daqui saímos para
 * `{BACKEND_URL}/rh/login?retorno=...`. Assim a URL do backend fica só no
 * servidor e o `retorno` continua sendo a origem do frontend, que o backend já
 * valida contra `CORS_ORIGINS`.
 */

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const backend = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");
  const url = new URL(request.url);
  const retorno = url.searchParams.get("retorno") ?? "";

  const destino = new URL(`${backend}/rh/login`);
  if (retorno) destino.searchParams.set("retorno", retorno);

  return NextResponse.redirect(destino);
}

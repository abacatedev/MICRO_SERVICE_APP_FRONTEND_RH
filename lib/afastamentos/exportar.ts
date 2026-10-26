"use client";

/**
 * Download de CSV pelo proxy `/api/rh`.
 *
 * O navegador chama a mesma origem; o proxy repassa o cookie httpOnly e
 * devolve `Content-Disposition` com o nome do arquivo. Não há URL do backend
 * no código do cliente.
 */

import { BASE_RH } from "@/lib/http/recurso";
import { montarUrl } from "./url";
import type { FiltrosAfastamentos, RelatorioExportavel } from "./tipos";

export interface ProgressoExportacao {
  /** Nome amigável para a UI. */
  nome: string;
  relatorio: RelatorioExportavel;
}

export const RELATORIOS: ProgressoExportacao[] = [
  { nome: "Vigentes", relatorio: "vigentes" },
  { nome: "Retornos previstos", relatorio: "retornos" },
  { nome: "Afastamentos longos", relatorio: "longos" },
  { nome: "Acumulado no ano", relatorio: "acumulado" },
  { nome: "Recorrentes", relatorio: "recorrentes" },
  { nome: "Pendências do eSocial", relatorio: "esocial-pendencias" },
];

export async function baixarCSV(
  relatorio: RelatorioExportavel,
  filtros: FiltrosAfastamentos,
  extra?: Record<string, string>,
): Promise<void> {
  const url = montarUrl(`${BASE_RH}/afastamentos/exportar/${relatorio}`, {
    ano: filtros.ano || undefined,
    reduzido: filtros.tipo || undefined,
    ...extra,
  });

  const resposta = await fetch(url, { credentials: "include" });

  if (resposta.status === 401) {
    // O tratamento de 401 em lib/http/recurso.ts faz redirect; aqui
    // só propagamos para a tela mostrar erro.
    throw new Error("Sessão expirada. Faça o login novamente.");
  }
  if (resposta.status === 403) {
    throw new Error("Seu perfil não tem acesso a esta exportação.");
  }
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao exportar.`);
  }

  const blob = await resposta.blob();
  const disposition = resposta.headers.get("content-disposition") ?? "";
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
  const nomeArquivo = match?.[1]?.replace(/['"]/g, "") ?? `${relatorio}.csv`;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

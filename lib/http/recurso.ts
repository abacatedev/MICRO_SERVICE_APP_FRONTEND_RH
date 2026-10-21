"use client";

/**
 * Cliente HTTP do backend do RH — usado por todas as telas que leem `/rh/*`.
 *
 * O navegador fala só com `/api/rh/...` (mesma origem). O `next.config.ts`
 * encaminha para `BACKEND_URL`, repassando o cookie de sessão httpOnly — o
 * front nunca vê nem guarda token.
 *
 * Só existe um `useRecurso` no projeto. Não crie outro `fetch` fora daqui.
 */

import * as React from "react";

/** Prefixo do proxy. O `next.config.ts` troca `/api/rh` por `BACKEND_URL/rh`. */
export const BASE_RH = "/api/rh";

const TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_RH_TIMEOUT ?? process.env.NEXT_PUBLIC_RAIO_X_TIMEOUT ?? 20000,
);

export interface Estado<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  erro: string | null;
  /** Status HTTP da última resposta (401, 403, 500…). */
  status: number | null;
  refetch: () => void;
}

let redirecionando = false;

/**
 * Manda para o login do backend, voltando para a tela atual.
 * Passa pelo proxy para não precisar da URL do backend no cliente.
 */
export function irParaLogin() {
  if (typeof window === "undefined" || redirecionando) return;
  redirecionando = true;
  const retorno = encodeURIComponent(window.location.href);
  window.location.assign(`${BASE_RH}/login?retorno=${retorno}`);
}

function descreverErro(causa: unknown, caminho: string): string {
  if (causa instanceof DOMException && causa.name === "AbortError") {
    return `Tempo esgotado (${TIMEOUT_MS} ms) em ${caminho}.`;
  }
  if (causa instanceof TypeError) {
    return `Não foi possível conectar ao backend (${caminho}). Ele está no ar?`;
  }
  if (causa instanceof Error) return causa.message;
  return `Falha ao chamar ${caminho}.`;
}

export function useRecurso<T>(caminho: string, ativo = true): Estado<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(ativo);
  const [isError, setIsError] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<number | null>(null);
  const [tentativa, setTentativa] = React.useState(0);

  const refetch = React.useCallback(() => setTentativa((n) => n + 1), []);

  React.useEffect(() => {
    if (!ativo) {
      setIsLoading(false);
      return;
    }

    let vivo = true;
    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);

    setIsLoading(true);
    setIsError(false);
    setErro(null);
    setStatus(null);

    void (async () => {
      try {
        const resposta = await fetch(caminho, {
          signal: controle.signal,
          // o cookie de sessão é httpOnly; sem isso o proxy não o recebe
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (resposta.status === 401) {
          irParaLogin();
          return;
        }

        if (!vivo) return;
        setStatus(resposta.status);

        if (resposta.status === 403) {
          setErro("Seu perfil não tem acesso a esta informação.");
          setIsError(true);
          return;
        }

        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status} ${resposta.statusText} em ${caminho}`);
        }

        const json = (await resposta.json()) as T;
        if (!vivo) return;
        setData(json);
      } catch (causa) {
        if (!vivo) return;
        setErro(descreverErro(causa, caminho));
        setIsError(true);
      } finally {
        clearTimeout(relogio);
        if (vivo) setIsLoading(false);
      }
    })();

    return () => {
      vivo = false;
      clearTimeout(relogio);
      controle.abort();
    };
  }, [caminho, ativo, tentativa]);

  return { data, isLoading, isError, erro, status, refetch };
}

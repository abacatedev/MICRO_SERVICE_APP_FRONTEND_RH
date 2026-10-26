"use client";

/**
 * Canal da ação "Atualizar" da tela atual até a topbar.
 *
 * A topbar é renderizada pelo `AppShell`, fora da árvore da página, então a
 * página não consegue entregar o botão por props. Aqui ela *registra* a ação
 * enquanto está montada; a topbar só desenha o botão quando existe registro.
 *
 * Consequência proposital: tela sem recálculo (as que ainda usam mock) não
 * ganha um botão morto. O botão existe porque a ação existe.
 *
 * São dois contextos de propósito: o de registro nunca muda de identidade, e
 * por isso registrar não re-renderiza a página inteira — só a topbar.
 */

import * as React from "react";

export interface AcaoAtualizacao {
  /** Dispara o recálculo na tela. */
  atualizar: () => void;
  /** true enquanto a requisição está em curso: o ícone gira e o clique bloqueia. */
  ocupado: boolean;
  /** Nome acessível do botão (só há ícone, então isto é o texto). */
  rotulo: string;
  /** Texto do `title`, para explicar o que o clique faz. */
  dica?: string;
}

type Registrar = (acao: AcaoAtualizacao | null) => void;

const CtxAcao = React.createContext<AcaoAtualizacao | null>(null);
const CtxRegistrar = React.createContext<Registrar>(() => {});

export function ProvedorAtualizacao({ children }: { children: React.ReactNode }) {
  const [acao, setAcao] = React.useState<AcaoAtualizacao | null>(null);

  // `setAcao` é estável: quem só registra nunca é re-renderizado por registrar.
  return (
    <CtxRegistrar.Provider value={setAcao}>
      <CtxAcao.Provider value={acao}>{children}</CtxAcao.Provider>
    </CtxRegistrar.Provider>
  );
}

/** A topbar lê isto para saber se desenha o botão. */
export function useAcaoAtualizacao(): AcaoAtualizacao | null {
  return React.useContext(CtxAcao);
}

/**
 * A página chama isto com a ação dela. `atualizar` precisa ser estável
 * (`useCallback`), senão o efeito re-registra a cada render.
 */
export function useRegistrarAtualizacao(acao: AcaoAtualizacao | null) {
  const registrar = React.useContext(CtxRegistrar);

  // A ref evita que o botão da topbar chame um callback de um render antigo.
  const acaoRef = React.useRef(acao);
  acaoRef.current = acao;

  const atualizar = acao?.atualizar;
  const ocupado = acao?.ocupado ?? false;
  const rotulo = acao?.rotulo ?? "";
  const dica = acao?.dica;

  React.useEffect(() => {
    if (!atualizar) {
      registrar(null);
      return;
    }

    registrar({
      atualizar: () => acaoRef.current?.atualizar(),
      ocupado,
      rotulo,
      dica,
    });

    return () => registrar(null);
  }, [registrar, atualizar, ocupado, rotulo, dica]);
}

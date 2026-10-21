/**
 * Marca do Pré-Censo dos Servidores.
 *
 * Vetor, não bitmap: o PNG original tem 512px e detalhes finos (os três
 * checkmarks), que viram borrão num quadrado de 32px. Aqui o desenho foi
 * simplificado para o tamanho de uso, mantendo o que identifica a marca —
 * o ciclo (seta circular), as três pessoas e a lista de conferência.
 *
 * O azul-marinho vem de `currentColor` para o ícone sobreviver ao tema escuro
 * (a sidebar é #ffffff no claro e #0d1626 no escuro). Verde e laranja são
 * fixos: funcionam nos dois fundos.
 */

const VERDE = "#2FA45F";
const LARANJA = "#F5A623";
const AZUL_CLARO = "#3E8FD9";

export function MarcaPreCenso({
  className,
  titulo = "Pré-Censo dos Servidores",
}: {
  className?: string;
  titulo?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={titulo}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{titulo}</title>

      {/* ciclo: dois arcos com uma seta em cada ponta */}
      <g fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
        <path d="M36.51 6.4A26 26 0 0 1 36.51 57.6" />
        <path d="M27.49 57.6A26 26 0 0 1 27.49 6.4" />
      </g>
      <path d="M33.4 5.36 L24.74 2.32 L26.3 11.18 Z" fill="currentColor" />
      <path d="M30.6 58.64 L39.26 52.82 L37.7 61.68 Z" fill="currentColor" />

      {/* pessoas: as laterais atrás, a do centro na frente */}
      <g fill={VERDE}>
        <circle cx="21.8" cy="22.8" r="4.3" />
        <path d="M14.6 36.5V31.6a7.2 7.2 0 0 1 14.4 0v4.9Z" />
      </g>
      <g fill={LARANJA}>
        <circle cx="42.2" cy="22.8" r="4.3" />
        <path d="M35 36.5V31.6a7.2 7.2 0 0 1 14.4 0v4.9Z" />
      </g>

      <g fill="currentColor">
        <circle cx="32" cy="20.5" r="5.2" />
        <path d="M23.2 36.5V32.4a8.8 8.8 0 0 1 17.6 0v4.1Z" />
      </g>
      {/* metade iluminada da figura central, como no original */}
      <g fill="currentColor" opacity="0.55">
        <path d="M32 15.3a5.2 5.2 0 0 1 0 10.4Z" />
        <path d="M32 23.6a8.8 8.8 0 0 1 8.8 8.8v4.1H32Z" />
      </g>

      {/* lista de conferência */}
      <g strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M20.6 42.5l1.9 1.9 3.4-3.9" stroke={VERDE} />
        <path d="M20.6 47l1.9 1.9 3.4-3.9" stroke={AZUL_CLARO} />
        <path d="M20.6 51.5l1.9 1.9 3.4-3.9" stroke={LARANJA} />
      </g>
      <g>
        <rect x="26.4" y="41.3" width="14" height="2.5" rx="1.25" fill={VERDE} />
        <rect x="26.4" y="45.8" width="14" height="2.5" rx="1.25" fill={AZUL_CLARO} />
        <rect x="26.4" y="50.3" width="14" height="2.5" rx="1.25" fill={LARANJA} />
      </g>
    </svg>
  );
}

import type { NextConfig } from "next";

/**
 * Proxy para o backend do RH.
 *
 * O navegador chama `/api/rh/...` (mesma origem) e o Next repassa para
 * `BACKEND_URL`, preservando o cookie de sessão httpOnly. Assim não há CORS
 * no meio e o front nunca precisa saber a URL real do backend.
 *
 * Exemplo: `/api/rh/diagnostico` → `http://localhost:8000/rh/diagnostico`
 *
 * Portas: casa `http://localhost:8000`, servidor CT-THOTH `http://localhost:8010`.
 */
const backend = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/rh/:caminho*",
        destination: `${backend}/rh/:caminho*`,
      },
    ];
  },
};

export default nextConfig;

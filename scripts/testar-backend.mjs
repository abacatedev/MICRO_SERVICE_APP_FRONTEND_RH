/**
 * Diagnóstico da conexão com o backend do RH (sem abrir o navegador).
 *
 * Rode de dentro de `nexo-bi/`:
 *   npm run testar:backend
 *
 * Ou de qualquer diretório, passando a URL:
 *   node caminho/para/scripts/testar-backend.mjs http://localhost:8000
 *
 * Com cookie de sessão (pegue no DevTools › Application › Cookies):
 *   RH_COOKIE="sessao=abc123" npm run testar:backend
 *
 * Sem cookie os endpoints respondem 401 — é o esperado, e já confirma que o
 * backend está no ar e que a rota existe.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function carregarEnv(arquivo) {
  try {
    const texto = readFileSync(resolve(process.cwd(), arquivo), "utf8");
    for (const linha of texto.split(/\r?\n/)) {
      const limpa = linha.trim();
      if (!limpa || limpa.startsWith("#")) continue;
      const igual = limpa.indexOf("=");
      if (igual === -1) continue;
      const chave = limpa.slice(0, igual).trim();
      const valor = limpa.slice(igual + 1).trim().replace(/^["']|["']$/g, "");
      if (!(chave in process.env)) process.env[chave] = valor;
    }
  } catch {
    /* arquivo ausente: segue com o ambiente */
  }
}

carregarEnv(".env.local");
carregarEnv(".env");

// URL como argumento vence o .env — permite rodar de qualquer diretório.
const base = (process.argv[2] ?? process.env.BACKEND_URL ?? "http://localhost:8000").replace(
  /\/+$/,
  "",
);
const cookie = process.env.RH_COOKIE ?? "";
const limite = Number(process.env.NEXT_PUBLIC_RAIO_X_TIMEOUT ?? 20000);

const alvos = [
  { nome: "/rh/me", caminho: "/rh/me" },
  { nome: "regras", caminho: "/rh/diagnostico/por-divisao/regras?atualizar=false" },
  { nome: "perfil", caminho: "/rh/diagnostico/por-divisao/perfil" },
  { nome: "diagnostico", caminho: "/rh/diagnostico" },
];

console.log(`\nBackend: ${base}`);
console.log(`Cookie:  ${cookie ? "enviado" : "nenhum (esperado 401)"}\n`);

let falhas = 0;

for (const alvo of alvos) {
  const url = `${base}${alvo.caminho}`;
  const inicio = Date.now();

  try {
    const resposta = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      signal: AbortSignal.timeout(limite),
    });

    const ms = Date.now() - inicio;
    const marca = resposta.ok ? "✓" : resposta.status === 401 ? "•" : "✗";
    if (!resposta.ok && resposta.status !== 401) falhas += 1;

    console.log(`${marca} ${alvo.nome.padEnd(13)} ${resposta.status} ${resposta.statusText} (${ms} ms)`);

    if (resposta.ok) {
      const json = await resposta.json();
      if (alvo.nome === "regras") {
        const total = json?.total ?? {};
        console.log(`    cartões: ${(json?.cartoes ?? []).length} · divisões: ${(json?.divisoes ?? []).length}`);
        console.log(`    vínculos: ${total.vinculos} · dependentes: ${total.dependentes}`);
        console.log(`    cartoes: ${JSON.stringify(total.cartoes)}`);
      } else if (alvo.nome === "perfil") {
        const chaves = Object.keys(json?.divisoes ?? {});
        console.log(`    divisões com perfil: ${chaves.length} (${chaves.slice(0, 5).join(", ")}…)`);
      } else if (alvo.nome === "diagnostico") {
        console.log(`    regras: ${(json?.regras ?? []).length}`);
      } else {
        console.log(`    ${JSON.stringify(json).slice(0, 160)}`);
      }
    }
  } catch (erro) {
    falhas += 1;
    console.log(`✗ ${alvo.nome.padEnd(13)} falhou (${Date.now() - inicio} ms)`);

    if (erro?.name === "TimeoutError") {
      console.log(`    tempo esgotado em ${limite} ms`);
    } else if (erro?.cause?.code === "ECONNREFUSED" || erro?.code === "ECONNREFUSED") {
      console.log(`    conexão recusada em ${base} — o backend está rodando nessa porta?`);
    } else {
      console.log(`    ${erro?.message ?? erro}`);
    }
  }
}

console.log("");

if (falhas === 0) {
  console.log("Conexão OK. Abra http://localhost:3000/raio-x.\n");
} else {
  console.log("Alguns endpoints falharam. Confira BACKEND_URL no .env.local e o Swagger em");
  console.log(`${base}/docs\n`);
  process.exitCode = 1;
}

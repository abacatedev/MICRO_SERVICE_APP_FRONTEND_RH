import type { UsuarioRH } from "./types";

/** Primeira e última palavra do nome → iniciais. */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Primeiro nome. */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/** Mapeia roles[0] para rótulo de perfil. */
export function rotuloPerfilRH(role?: string): string {
  if (!role) return "—";
  const r = role.toLowerCase();
  if (r === "admin") return "Administrador";
  if (r === "rh") return "RH";
  if (r === "consulta") return "Consulta";
  return role;
}

/** Formata `sessao_expira_em` para "HH:mm". */
export function horaExpira(iso: string | null): string {
  if (!iso) return "—";
  const [hora, min] = iso.slice(11, 16).split(":");
  return `${hora}:${min}`;
}

import { redirect } from "next/navigation";

/**
 * A rota antiga /produtos redireciona para /afastamentos.
 *
 * O menu e as trilhas já apontam para o novo endereço; este redirect
 * preserva bookmarks e links externos.
 */
export default function ProdutosRedirect() {
  redirect("/afastamentos");
}

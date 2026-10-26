/**
 * @deprecated Dividido em dois em 25/10/2026.
 *
 * Os filtros (secretaria, "Mostrar secretarias com", "Limpar filtros") foram
 * para o topo da página, acima das abas — `barra-filtros.tsx`. Os cards de
 * pendência foram para dentro da aba Pendência, como coluna à esquerda do
 * conteúdo — `painel-pendencias.tsx`.
 *
 * O arquivo fica como ponte para não quebrar import antigo; pode ser removido
 * quando ninguém mais importar daqui.
 */
export { BarraFiltros } from "./barra-filtros";
export { PainelPendencias } from "./painel-pendencias";

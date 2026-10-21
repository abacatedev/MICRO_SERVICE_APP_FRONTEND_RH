/**
 * Dados de demonstração das telas que ainda não têm backend
 * (Vendas, Clientes, Produtos).
 *
 * Visão geral e Raio-X não usam este módulo: leem `/rh/*` via `lib/http/recurso.ts`.
 */

export type Trend = "up" | "down";

export interface Kpi {
  id: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number;
  deltaSuffix?: string;
  trend: Trend;
  hint: string;
  spark: number[];
}

export const kpis: Kpi[] = [
  {
    id: "receita",
    label: "Receita líquida",
    value: 1284320,
    format: "currency",
    delta: 12.4,
    trend: "up",
    hint: "vs. 1.142.180 no período anterior",
    spark: [42, 48, 45, 52, 58, 55, 64, 61, 72, 78, 74, 86, 92, 98],
  },
  {
    id: "pedidos",
    label: "Pedidos",
    value: 8942,
    format: "number",
    delta: 4.1,
    trend: "up",
    hint: "863 pedidos acima do período anterior",
    spark: [58, 55, 62, 60, 66, 63, 70, 68, 72, 69, 76, 74, 80, 83],
  },
  {
    id: "ticket",
    label: "Ticket médio",
    value: 143.63,
    format: "currency",
    delta: -1.8,
    trend: "down",
    hint: "queda puxada pelo canal marketplace",
    spark: [72, 74, 71, 73, 69, 70, 67, 68, 65, 66, 63, 64, 61, 62],
  },
  {
    id: "conversao",
    label: "Taxa de conversão",
    value: 3.84,
    format: "percent",
    delta: 0.6,
    deltaSuffix: " p.p.",
    trend: "up",
    hint: "meta do trimestre: 3,5%",
    spark: [40, 42, 41, 45, 44, 48, 47, 51, 50, 55, 54, 58, 57, 61],
  },
];

export interface RevenuePoint {
  label: string;
  receita: number;
  meta: number;
  pedidos: number;
}

/** Série diária (em milhares de reais) dos últimos 14 dias. */
export const revenueSeries: RevenuePoint[] = [
  { label: "04/10", receita: 62, meta: 70, pedidos: 412 },
  { label: "05/10", receita: 68, meta: 72, pedidos: 438 },
  { label: "06/10", receita: 74, meta: 74, pedidos: 466 },
  { label: "07/10", receita: 71, meta: 76, pedidos: 451 },
  { label: "08/10", receita: 88, meta: 80, pedidos: 522 },
  { label: "09/10", receita: 95, meta: 82, pedidos: 561 },
  { label: "10/10", receita: 84, meta: 85, pedidos: 498 },
  { label: "11/10", receita: 91, meta: 88, pedidos: 534 },
  { label: "12/10", receita: 103, meta: 90, pedidos: 602 },
  { label: "13/10", receita: 112, meta: 95, pedidos: 648 },
  { label: "14/10", receita: 98, meta: 98, pedidos: 571 },
  { label: "15/10", receita: 121, meta: 100, pedidos: 704 },
  { label: "16/10", receita: 134, meta: 105, pedidos: 762 },
  { label: "17/10", receita: 128, meta: 110, pedidos: 731 },
];

export interface MonthPoint {
  label: string;
  receita: number;
  meta: number;
  pedidos: number;
}

export const monthlyRevenue: MonthPoint[] = [
  { label: "Jan", receita: 780, meta: 760, pedidos: 5410 },
  { label: "Fev", receita: 812, meta: 790, pedidos: 5632 },
  { label: "Mar", receita: 905, meta: 840, pedidos: 6108 },
  { label: "Abr", receita: 878, meta: 870, pedidos: 5944 },
  { label: "Mai", receita: 960, meta: 910, pedidos: 6412 },
  { label: "Jun", receita: 1032, meta: 960, pedidos: 6890 },
  { label: "Jul", receita: 1005, meta: 990, pedidos: 6721 },
  { label: "Ago", receita: 1124, meta: 1040, pedidos: 7488 },
  { label: "Set", receita: 1198, meta: 1100, pedidos: 7960 },
  { label: "Out", receita: 1284, meta: 1160, pedidos: 8942 },
];

export interface ChannelSlice {
  label: string;
  value: number;
  color: string;
}

export const channelSplit: ChannelSlice[] = [
  { label: "Orgânico", value: 462000, color: "var(--chart-1)" },
  { label: "Mídia paga", value: 321000, color: "var(--chart-2)" },
  { label: "Indicação", value: 218000, color: "var(--chart-3)" },
  { label: "Marketplace", value: 180000, color: "var(--chart-4)" },
  { label: "Direto", value: 103320, color: "var(--chart-5)" },
];

export interface CategoryPoint {
  label: string;
  receita: number;
  pedidos: number;
  margem: number;
}

export const categoryRevenue: CategoryPoint[] = [
  { label: "Eletrônicos", receita: 412, pedidos: 2140, margem: 18.4 },
  { label: "Casa & Decor.", receita: 268, pedidos: 1860, margem: 32.1 },
  { label: "Moda", receita: 214, pedidos: 1985, margem: 41.7 },
  { label: "Beleza", receita: 178, pedidos: 1620, margem: 46.2 },
  { label: "Esporte", receita: 132, pedidos: 884, margem: 27.8 },
  { label: "Outros", receita: 80, pedidos: 453, margem: 24.5 },
];

export interface Product {
  name: string;
  sku: string;
  category: string;
  receita: number;
  unidades: number;
  margem: number;
  share: number;
}

export const topProducts: Product[] = [
  { name: "Fone Aurora Pro", sku: "AUR-PRO-01", category: "Eletrônicos", receita: 184320, unidades: 1240, margem: 22.4, share: 14.4 },
  { name: "Cafeteira Nórdica", sku: "NOR-CAF-04", category: "Casa & Decor.", receita: 141800, unidades: 890, margem: 34.8, share: 11.0 },
  { name: "Tênis Rota 27", sku: "ROT-027-09", category: "Esporte", receita: 118400, unidades: 1120, margem: 29.1, share: 9.2 },
  { name: "Sérum Vitamina C", sku: "SER-C-12", category: "Beleza", receita: 96250, unidades: 2410, margem: 48.6, share: 7.5 },
  { name: "Jaqueta Corta-Vento", sku: "JCV-118-02", category: "Moda", receita: 88700, unidades: 760, margem: 43.2, share: 6.9 },
];

export type TxStatus = "Pago" | "Pendente" | "Processando" | "Reembolsado";

export interface Transaction {
  id: string;
  customer: string;
  email: string;
  channel: string;
  value: number;
  status: TxStatus;
  date: string;
}

export const transactions: Transaction[] = [
  { id: "TX-24817", customer: "Helena Prado", email: "helena.prado@exemplo.com", channel: "Orgânico", value: 1849.9, status: "Pago", date: "17/10 14:32" },
  { id: "TX-24816", customer: "Rafael Nunes", email: "r.nunes@exemplo.com", channel: "Mídia paga", value: 429.0, status: "Pago", date: "17/10 13:58" },
  { id: "TX-24815", customer: "Bianca Alves", email: "bianca.alves@exemplo.com", channel: "Marketplace", value: 279.9, status: "Pendente", date: "17/10 12:11" },
  { id: "TX-24814", customer: "Otávio Lima", email: "otavio.lima@exemplo.com", channel: "Indicação", value: 3120.0, status: "Processando", date: "17/10 11:44" },
  { id: "TX-24813", customer: "Marina Costa", email: "marina.costa@exemplo.com", channel: "Orgânico", value: 149.9, status: "Pago", date: "17/10 10:02" },
  { id: "TX-24812", customer: "Diego Ferraz", email: "diego.ferraz@exemplo.com", channel: "Mídia paga", value: 689.0, status: "Reembolsado", date: "16/10 18:27" },
  { id: "TX-24811", customer: "Luciana Reis", email: "lu.reis@exemplo.com", channel: "Direto", value: 2450.0, status: "Pago", date: "16/10 17:05" },
  { id: "TX-24810", customer: "Pedro Machado", email: "pedro.machado@exemplo.com", channel: "Orgânico", value: 98.5, status: "Pago", date: "16/10 15:40" },
];

export interface Customer {
  name: string;
  email: string;
  segment: "Enterprise" | "Mid-market" | "SMB" | "Varejo";
  ltv: number;
  pedidos: number;
  ultima: string;
  risco: "Baixo" | "Médio" | "Alto";
}

export const topCustomers: Customer[] = [
  { name: "Grupo Vértice", email: "compras@vertice.com.br", segment: "Enterprise", ltv: 184320, pedidos: 42, ultima: "há 2 dias", risco: "Baixo" },
  { name: "Casa Aurora", email: "suprimentos@casaaurora.com", segment: "Mid-market", ltv: 142800, pedidos: 36, ultima: "há 5 dias", risco: "Baixo" },
  { name: "Rede Solimões", email: "central@solimoes.com", segment: "Enterprise", ltv: 118400, pedidos: 28, ultima: "há 9 dias", risco: "Médio" },
  { name: "Studio Maré", email: "oi@studiomare.com", segment: "SMB", ltv: 96400, pedidos: 24, ultima: "há 14 dias", risco: "Médio" },
  { name: "Clínica Bem Viver", email: "adm@bemviver.com.br", segment: "SMB", ltv: 71250, pedidos: 19, ultima: "há 27 dias", risco: "Alto" },
  { name: "Ateliê Bonfim", email: "contato@ateliebonfim.com", segment: "Varejo", ltv: 58900, pedidos: 15, ultima: "há 31 dias", risco: "Alto" },
];

export interface SegmentShare {
  label: string;
  clientes: number;
  receita: number;
  cor: string;
}

export const segments: SegmentShare[] = [
  { label: "Varejo", clientes: 1840, receita: 486000, cor: "var(--chart-1)" },
  { label: "SMB", clientes: 962, receita: 342000, cor: "var(--chart-2)" },
  { label: "Mid-market", clientes: 214, receita: 268000, cor: "var(--chart-3)" },
  { label: "Enterprise", clientes: 48, receita: 188320, cor: "var(--chart-4)" },
];

export interface FunnelStep {
  label: string;
  value: number;
  rate?: number;
}

export const funnel: FunnelStep[] = [
  { label: "Visitas", value: 128400 },
  { label: "Leads", value: 18320, rate: 14.3 },
  { label: "Oportunidades", value: 6140, rate: 33.5 },
  { label: "Propostas", value: 2480, rate: 40.4 },
  { label: "Fechados", value: 1106, rate: 44.6 },
];

export interface CohortRow {
  label: string;
  size: number;
  values: (number | null)[];
}

export const cohorts: CohortRow[] = [
  { label: "Out/26", size: 412, values: [100, 62, 48, 39, 34, 31] },
  { label: "Set/26", size: 388, values: [100, 58, 44, 36, 32, null] },
  { label: "Ago/26", size: 341, values: [100, 61, 47, 38, null, null] },
  { label: "Jul/26", size: 302, values: [100, 55, 41, null, null, null] },
  { label: "Jun/26", size: 288, values: [100, 57, null, null, null, null] },
  { label: "Mai/26", size: 254, values: [100, null, null, null, null, null] },
];

export const cohortPeriods = ["M0", "M1", "M2", "M3", "M4", "M5"];

export interface RegionPoint {
  label: string;
  share: number;
  receita: number;
}

export const regions: RegionPoint[] = [
  { label: "São Paulo", share: 34.2, receita: 439240 },
  { label: "Rio de Janeiro", share: 18.4, receita: 236310 },
  { label: "Minas Gerais", share: 12.1, receita: 155400 },
  { label: "Rio Grande do Sul", share: 9.3, receita: 119440 },
  { label: "Paraná", share: 8.2, receita: 105310 },
  { label: "Bahia", share: 6.4, receita: 82190 },
  { label: "Demais", share: 11.4, receita: 146430 },
];

export interface ReportItem {
  title: string;
  description: string;
  owner: string;
  updated: string;
  schedule?: string;
  tag: "Vendas" | "Clientes" | "Produto" | "Financeiro";
}

export const reports: ReportItem[] = [
  { title: "Fechamento comercial mensal", description: "Receita, meta e desvio por regional com comentário do time.", owner: "Ana Vasques", updated: "há 2 h", schedule: "Todo dia 1º", tag: "Vendas" },
  { title: "Cohort de retenção", description: "Retenção por safra de aquisição e receita recorrente.", owner: "Time de Growth", updated: "ontem", schedule: "Semanal, seg 08h", tag: "Clientes" },
  { title: "Margem por categoria", description: "Margem bruta, frete e devoluções por categoria de produto.", owner: "Financeiro", updated: "há 3 dias", tag: "Financeiro" },
  { title: "Curva ABC de produtos", description: "Concentração de receita e giro dos 200 SKUs mais vendidos.", owner: "Comercial", updated: "há 4 dias", schedule: "Mensal", tag: "Produto" },
  { title: "Funil de aquisição pago", description: "CAC, CPL e ROAS por canal e criativo.", owner: "Performance", updated: "há 6 h", schedule: "Diário, 07h", tag: "Vendas" },
  { title: "Churn e risco de cancelamento", description: "Score de risco por conta com histórico de uso.", owner: "Customer Success", updated: "há 1 dia", tag: "Clientes" },
];

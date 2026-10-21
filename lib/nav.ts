import {
  BarChart3,
  Boxes,
  FileBarChart,
  LayoutDashboard,
  ScanSearch,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const mainNav: NavItem[] = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/vendas", label: "Vendas", icon: BarChart3 },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/produtos", label: "Produtos", icon: Boxes },
  { href: "/raio-x", label: "Raio-X Secretarias", icon: ScanSearch },
];

export const secondaryNav: NavItem[] = [
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart, badge: "12" },
  { href: "/configuracoes", label: "Configurações", icon: Settings2 },
];

export const navLabels: Record<string, string> = {
  "/": "Visão geral",
  "/vendas": "Vendas",
  "/clientes": "Clientes",
  "/produtos": "Produtos",
  "/raio-x": "Raio-X Secretarias",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações",
};

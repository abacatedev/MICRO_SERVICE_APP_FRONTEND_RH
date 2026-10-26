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
  { href: "/afastamentos", label: "Afastamentos", icon: Boxes },
  { href: "/raio-x", label: "Raio-X Secretarias", icon: ScanSearch },
];

export const secondaryNav: NavItem[] = [
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
];

export const navLabels: Record<string, string> = {
  "/": "Visão geral",
  "/vendas": "Vendas",
  "/clientes": "Clientes",
  "/produtos": "Afastamentos",
  "/afastamentos": "Afastamentos",
  "/raio-x": "Raio-X Secretarias",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações",
};

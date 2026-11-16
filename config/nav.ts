import { BarChart3, CalendarRange, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  {
    title: "Relatório de atividade",
    href: "/relatorio-atividade",
    icon: BarChart3,
  },
  {
    title: "Ocupação",
    href: "/ocupacao",
    icon: CalendarRange,
  },
];

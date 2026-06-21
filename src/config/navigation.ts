import {
  BarChart3,
  ClipboardList,
  Home,
  LucideIcon,
  Package,
  Palette,
  Settings,
  Truck,
  Users,
  Wrench
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const publicNavItems = [
  { label: "Início", path: "/" },
  { label: "Orçamento", path: "/orcamento" },
  { label: "Meus pedidos", path: "/cliente/login" }
];

export const adminNavItems: NavItem[] = [
  { label: "Início", path: "/admin/dashboard", icon: Home },
  { label: "Orçamentos", path: "/admin/orcamentos", icon: ClipboardList },
  { label: "Clientes", path: "/admin/clientes", icon: Users },
  { label: "Produtos", path: "/admin/produtos", icon: Package },
  { label: "Fornecedores", path: "/admin/fornecedores", icon: Truck },
  { label: "Serviços", path: "/admin/servicos", icon: Wrench },
  { label: "Artes prontas", path: "/admin/artes", icon: Palette },
  { label: "Configurações", path: "/admin/configuracoes", icon: Settings },
  { label: "Relatórios", path: "/admin/relatorios", icon: BarChart3 }
];

export const productHighlights = [
  { label: "Camisetas", tone: "bg-coral" },
  { label: "DTF têxtil", tone: "bg-aqua" },
  { label: "Uniformes", tone: "bg-magenta" },
  { label: "Moletons", tone: "bg-violet" },
  { label: "Ecobags", tone: "bg-mint" },
  { label: "Brindes", tone: "bg-denim" }
];

export const publicFeatureCards = [
  { label: "Orçamento rápido", description: "Receba uma estimativa em poucos minutos." },
  { label: "Personalização completa", description: "Produzimos conforme sua necessidade." },
  { label: "Qualidade premium", description: "Materiais e acabamentos selecionados." },
  { label: "Atendimento especializado", description: "Suporte humano do início ao fim." },
  { label: "Entrega segura", description: "Acompanhamento e compromisso com prazos." },
  { label: "Soluções para empresas e eventos", description: "Uniformes, brindes, ações promocionais e muito mais." }
];

export const adminStatCards = [
  { label: "Orçamentos hoje", value: "18", accent: "from-coral to-magenta" },
  { label: "Ticket médio", value: "R$ 286", accent: "from-violet to-denim" },
  { label: "Conversão", value: "42%", accent: "from-aqua to-mint" },
  { label: "Pedidos urgentes", value: "05", accent: "from-mango to-coral" }
];

export const dashboardCategories = [
  "Camisetas",
  "DTF têxtil",
  "Uniformes",
  "Moletons",
  "Ecobags",
  "Kits personalizados"
];

export const flowSteps = ["Cliente", "Produto", "Estampa", "Arte", "Entrega", "Resumo"];

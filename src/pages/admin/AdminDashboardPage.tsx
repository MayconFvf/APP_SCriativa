import {
  ArrowUpRight,
  Calculator,
  Clock3,
  Package,
  Palette,
  TrendingUp,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageIntro } from "../../components/ui/PageIntro";
import { adminStatCards, dashboardCategories } from "../../config/navigation";

const categoryIcons = [Package, Palette, Users, Clock3, Calculator, TrendingUp];

const recentBudgets = [
  { cliente: "Ana Paula", produto: "Camisetas DTF", status: "Novo", valor: "R$ 480" },
  { cliente: "Studio Fit", produto: "Uniformes", status: "Simulação", valor: "R$ 1.240" },
  { cliente: "Lume Eventos", produto: "Ecobags", status: "Contato", valor: "R$ 690" }
];

const chartBars = [42, 68, 51, 82, 74, 95, 63];

export function AdminDashboardPage() {
  return (
    <>
      <PageIntro
        eyebrow="Painel admin"
        title="Dashboard inteligente"
        description="Visão operacional para acompanhar simulações, produtos, histórico e indicadores visuais da SCRIATIVA."
      >
        <Link to="/orcamento" className="btn-primary">
          Abrir orçamento público
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </PageIntro>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminStatCards.map((stat) => (
          <article key={stat.label} className="glass-panel p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-white/[0.55]">{stat.label}</span>
              <span className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stat.accent} shadow-neon`} />
            </div>
            <p className="mt-5 text-3xl font-black text-white sm:text-4xl">{stat.value}</p>
            <p className="mt-2 text-xs font-bold text-mint">+12% nesta semana</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="neon-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
              <Calculator size={24} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white">Orçamento rápido</h2>
              <p className="text-sm text-white/[0.52]">Simulação visual, sem cálculo real ainda.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Produto", "Quantidade", "Estampa", "Arte"].map((field) => (
              <div key={field} className="rounded-lg border border-white/10 bg-black/[0.22] px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.36]">
                  {field}
                </p>
                <p className="mt-2 text-sm font-bold text-white/[0.78]">A definir</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-magenta/25 bg-magenta/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-sm font-bold text-white/[0.58]">Prévia fake</span>
              <span className="text-2xl font-black text-white">R$ 189,90</span>
            </div>
          </div>
        </article>

        <article className="glass-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Performance visual</h2>
              <p className="mt-1 text-sm text-white/[0.52]">Gráfico fake para composição do painel.</p>
            </div>
            <TrendingUp className="text-aqua" size={24} aria-hidden="true" />
          </div>

          <div className="mt-8 flex h-52 items-end gap-2 rounded-lg border border-white/10 bg-black/[0.18] p-3 sm:gap-3 sm:p-4">
            {chartBars.map((bar, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-coral via-magenta to-aqua shadow-neon"
                  style={{ height: `${bar}%` }}
                />
                <span className="text-xs font-bold text-white/[0.36]">{index + 1}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <article className="glass-panel p-5 sm:p-6">
          <h2 className="text-xl font-black text-white">Categorias e produtos</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {dashboardCategories.map((category, index) => {
              const Icon = categoryIcons[index];
              return (
                <div
                  key={category}
                  className="rounded-lg border border-white/10 bg-white/[0.08] p-4 transition hover:-translate-y-0.5 hover:border-aqua/[0.35]"
                >
                  <Icon className="text-magenta" size={22} aria-hidden="true" />
                  <p className="mt-4 text-sm font-black text-white">{category}</p>
                  <p className="mt-1 text-xs font-bold text-white/[0.38]">Visual demo</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="glass-panel p-5 sm:p-6">
          <h2 className="text-xl font-black text-white">Histórico recente</h2>
          <div className="mt-5 grid gap-3">
            {recentBudgets.map((budget) => (
              <div
                key={budget.cliente}
                className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center"
              >
                <span className="text-sm font-black text-white">{budget.cliente}</span>
                <span className="text-sm font-bold text-white/[0.58]">{budget.produto}</span>
                <span className="w-fit rounded-full border border-aqua/25 bg-aqua/10 px-3 py-1 text-xs font-black text-aqua">
                  {budget.status}
                </span>
                <span className="text-sm font-black text-white sm:text-right">{budget.valor}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

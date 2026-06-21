import { BarChart3, Download } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageIntro } from "../../components/ui/PageIntro";

export function AdminReportsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Análise"
        title="Relatórios"
        description="Área visual para relatórios de orçamentos, conversão, margem e produtos mais pedidos."
      >
        <button className="btn-secondary" type="button">
          <Download size={18} aria-hidden="true" />
          Exportar
        </button>
      </PageIntro>
      <EmptyState
        icon={BarChart3}
        title="Relatórios em preparação"
        description="Os gráficos e exportações serão ligados aos dados reais depois."
      />
    </>
  );
}

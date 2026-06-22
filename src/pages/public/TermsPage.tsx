import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Finalidade da Plataforma",
    content: [
      "A plataforma tem como objetivo permitir que clientes:",
      "- Solicitem orçamentos;",
      "- Acompanhem pedidos;",
      "- Visualizem modelos de artes;",
      "- Enviem informações necessárias para produção de produtos personalizados."
    ]
  },
  {
    title: "2. Cadastro de Usuário",
    content: [
      "Para utilizar determinadas funcionalidades, o usuário deverá fornecer informações verdadeiras e atualizadas.",
      "Cada endereço de e-mail poderá possuir apenas uma conta ativa.",
      "O usuário é responsável por manter a confidencialidade de sua senha."
    ]
  },
  {
    title: "3. Solicitações de Orçamento",
    content: [
      "Os valores apresentados pela plataforma possuem caráter informativo e poderão ser revisados pela equipe da SCRIATIVA antes da aprovação final do pedido.",
      "O envio de um orçamento não caracteriza contratação automática de serviços."
    ]
  },
  {
    title: "4. Propriedade Intelectual",
    content: [
      "Todo o conteúdo da plataforma, incluindo marca, identidade visual, layout, códigos, funcionalidades e materiais disponibilizados, é protegido pela legislação aplicável.",
      "A plataforma foi desenvolvida pela My Dev Solutions para uso exclusivo da SCRIATIVA."
    ]
  },
  {
    title: "5. Limitação de Responsabilidade",
    content: [
      "A SCRIATIVA não se responsabiliza por informações incorretas fornecidas pelo usuário durante o preenchimento dos formulários.",
      "Problemas decorrentes de informações incorretas poderão impactar prazos, valores e entregas."
    ]
  },
  {
    title: "6. Alterações",
    content: [
      "A SCRIATIVA poderá atualizar estes Termos de Uso a qualquer momento para adequação operacional ou legal."
    ]
  },
  {
    title: "7. Contato",
    content: [
      "Em caso de dúvidas, entre em contato com a equipe da SCRIATIVA pelos canais oficiais de atendimento."
    ]
  }
];

export function TermsPage() {
  return (
    <section className="section-shell py-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <Link className="btn-secondary mb-6 w-full sm:w-fit" to="/cliente/cadastro">
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar ao cadastro
        </Link>

        <article className="neon-card overflow-hidden p-5 sm:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white shadow-neon">
              <FileText size={26} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
                Última atualização: Junho de 2026
              </p>
              <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">
                TERMOS DE USO – SCRIATIVA
              </h1>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-base leading-7 text-white/[0.74]">
            <p>Bem-vindo à plataforma SCRIATIVA.</p>
            <p>
              A SCRIATIVA é uma plataforma destinada à solicitação, acompanhamento e
              orçamento de produtos personalizados, desenvolvida pela My Dev Solutions.
            </p>
            <p>
              Ao utilizar este sistema, o usuário declara que leu, compreendeu e concorda
              com os presentes Termos de Uso.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-lg border border-white/10 bg-white/[0.05] p-4 sm:p-5"
              >
                <h2 className="text-lg font-black text-white">{section.title}</h2>
                <div className="mt-3 grid gap-2 text-sm leading-6 text-white/[0.68] sm:text-base sm:leading-7">
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

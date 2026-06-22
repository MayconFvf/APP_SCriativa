import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Dados Coletados",
    content: [
      "Podemos coletar:",
      "- Nome;",
      "- E-mail;",
      "- Telefone;",
      "- Endereço de entrega;",
      "- Informações relacionadas aos orçamentos solicitados."
    ]
  },
  {
    title: "2. Finalidade do Uso dos Dados",
    content: [
      "Os dados são utilizados para:",
      "- Identificação do cliente;",
      "- Elaboração de orçamentos;",
      "- Atendimento comercial;",
      "- Acompanhamento de pedidos;",
      "- Comunicação entre cliente e SCRIATIVA."
    ]
  },
  {
    title: "3. Compartilhamento",
    content: [
      "A SCRIATIVA não comercializa dados pessoais.",
      "Os dados poderão ser compartilhados apenas quando necessário para execução dos serviços contratados ou por obrigação legal."
    ]
  },
  {
    title: "4. Armazenamento",
    content: [
      "Os dados são armazenados em ambiente digital seguro utilizando serviços de terceiros especializados em hospedagem e banco de dados."
    ]
  },
  {
    title: "5. Direitos do Titular",
    content: [
      "O usuário poderá solicitar:",
      "- Correção de dados;",
      "- Atualização de informações;",
      "- Exclusão da conta;",
      "- Informações sobre os dados armazenados."
    ]
  },
  {
    title: "6. Segurança",
    content: [
      "A SCRIATIVA adota medidas técnicas e administrativas para proteger os dados contra acessos não autorizados."
    ]
  },
  {
    title: "7. Contato",
    content: [
      "Solicitações relacionadas à privacidade poderão ser realizadas pelos canais oficiais da SCRIATIVA."
    ]
  }
];

export function PrivacyPage() {
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
              <ShieldCheck size={27} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
                Última atualização: Junho de 2026
              </p>
              <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">
                POLÍTICA DE PRIVACIDADE – SCRIATIVA
              </h1>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.05] p-4 text-base leading-7 text-white/[0.74] sm:p-5">
            A SCRIATIVA respeita sua privacidade e protege seus dados pessoais em
            conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº
            13.709/2018).
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

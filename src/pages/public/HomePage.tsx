import {
  ArrowRight,
  Clock3,
  Lightbulb,
  MessageCircle,
  Palette,
  Sparkles,
  Trophy,
  Truck,
  Wand2,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { SCRIATIVA_WHATSAPP_NUMBER } from "../../config/budget";
import { publicFeatureCards } from "../../config/navigation";

const featureIcons = [Clock3, Palette, Trophy, MessageCircle, Truck, Lightbulb];

const whatsappHref = `https://wa.me/${SCRIATIVA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá, SCRIATIVA! Quero conversar sobre um projeto personalizado."
)}`;

function SmartQuotePreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-lg bg-gradient-to-br from-coral/25 via-magenta/20 to-aqua/20 blur-2xl" />
      <div className="neon-card relative overflow-hidden p-5">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">
              Orçamento inteligente
            </p>
            <h2 className="mt-1 text-xl font-black text-white">Projeto personalizado</h2>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
            <Zap size={21} aria-hidden="true" />
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {[
            ["Produto", "Camiseta premium"],
            ["Personalização", "Frente + costas"],
            ["Arte", "Modelo ajustado"],
            ["Atendimento", "Pronto para continuar"]
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <span className="text-sm font-bold text-white/[0.46]">{label}</span>
              <span className="text-sm font-black text-white sm:text-right">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-magenta/25 bg-magenta/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-magenta">
            Prévia de investimento
          </p>
          <p className="mt-2 text-3xl font-black text-white sm:text-4xl">R$ 189,90</p>
          <p className="mt-2 text-sm leading-6 text-white/[0.58]">
            Um resumo claro para você decidir com segurança e avançar sem complicação.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <section className="section-shell grid min-h-[calc(100svh-4rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/[0.68] shadow-line">
            <Sparkles size={14} aria-hidden="true" />
            Personalizados sob medida
          </div>

          <h1 className="mt-6 max-w-4xl text-3xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
            Transformamos suas ideias em personalizados que impressionam.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/[0.65]">
            Faça seu orçamento em poucos minutos e descubra o valor ideal para camisetas,
            uniformes, DTF têxtil, moletons, ecobags e muito mais. Qualidade premium,
            atendimento personalizado e produção sob medida.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/orcamento" className="btn-primary w-full sm:w-auto">
              Fazer meu orçamento
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a className="btn-secondary w-full sm:w-auto" href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle size={18} aria-hidden="true" />
              Falar com a SCRIATIVA
            </a>
          </div>
        </div>

        <SmartQuotePreview />
      </section>

      <section className="border-y border-white/10 bg-black/[0.18] py-12">
        <div className="section-shell">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">
              Benefícios
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Por que escolher a SCRIATIVA?
            </h2>
            <p className="mt-3 text-base leading-7 text-white/[0.62]">
              Do primeiro orçamento à entrega final, você conta com uma equipe preparada
              para transformar sua ideia em um produto bonito, útil e bem acabado.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicFeatureCards.map((card, index) => {
              const Icon = featureIcons[index] ?? Wand2;
              return (
                <article key={card.label} className="glass-panel p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-coral via-magenta to-denim text-white shadow-neon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-black text-white">{card.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/[0.58]">{card.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-magenta/20 bg-magenta/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-magenta">
            <Wand2 size={14} aria-hidden="true" />
            SCRIATIVA
          </div>
          <div>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              Mais que personalizados. Criamos experiências.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/[0.64]">
              Na SCRIATIVA, cada projeto é tratado de forma única. Nossa missão é
              transformar ideias em produtos que fortalecem marcas, valorizam equipes
              e criam conexões com clientes.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="neon-card overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">
                Comece agora
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
                Pronto para transformar sua ideia em realidade?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/[0.62]">
                Faça seu orçamento agora mesmo e receba uma proposta personalizada
                para o seu projeto.
              </p>
            </div>
            <Link to="/orcamento" className="btn-primary w-full sm:w-auto">
              Fazer meu orçamento
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../../components/brand/Logo";
import { useAuth } from "../../hooks/useAuth";
import { isSupabaseConfigured } from "../../lib/supabase";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { loading, role, session, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !session) return;
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (role === "cliente") {
      navigate("/cliente/pedidos", { replace: true });
      return;
    }

    setErrorMessage("Sessão ativa, mas o perfil não foi identificado. Saia e tente entrar novamente.");
  }, [loading, navigate, role, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Preencha e-mail e senha para acessar a gestão.");
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email.trim(), password, rememberMe);
    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    if (result.role !== "admin") {
      await signOut();
      setErrorMessage("Este acesso é exclusivo para a gestão SCRIATIVA.");
      return;
    }

    navigate("/admin/dashboard", { replace: true });
  }

  return (
    <main className="creative-surface grid min-h-screen text-white lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex min-h-[36svh] flex-col justify-between border-b border-white/10 p-6 sm:p-8 lg:min-h-screen lg:border-b-0 lg:border-r">
        <Logo to="/" />
        <div className="max-w-xl py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/[0.62]">
            <ShieldCheck size={14} aria-hidden="true" />
            Painel interno
          </span>
          <h1 className="mt-6 text-3xl font-black leading-tight sm:text-5xl">
            Gestão SCRIATIVA
          </h1>
          <p className="mt-4 text-base leading-7 text-white/[0.62]">
            Área reservada para operar orçamentos inteligentes, produtos,
            clientes e configurações internas.
          </p>
        </div>
        <span className="text-sm text-white/[0.45]">
          Supabase: {isSupabaseConfigured ? "configurado" : "pendente"}
        </span>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="neon-card w-full max-w-md p-5 sm:p-6">
          <div className="flex items-start gap-3 sm:items-center">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white shadow-neon">
              <LockKeyhole size={23} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white sm:text-2xl">Acesso de gestão</h2>
              <p className="text-sm text-white/[0.55]">Autenticação conectada ao Supabase.</p>
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold text-white/70">
              E-mail
              <input
                className="field"
                type="email"
                placeholder="admin@scriativa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/70">
              Senha
              <input
                className="field"
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/[0.72]">
              <input
                className="h-4 w-4 accent-magenta"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Lembrar de mim
            </label>

            {errorMessage && (
              <p className="rounded-lg border border-coral/[0.35] bg-coral/[0.12] px-4 py-3 text-sm font-semibold text-coral">
                {errorMessage}
              </p>
            )}

            <button type="submit" className="btn-primary mt-2 w-full" disabled={isSubmitting || loading}>
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-white/10 bg-black/[0.18] px-4 py-3 text-sm font-bold text-white/[0.52]">
            <Sparkles size={16} className="text-aqua" aria-hidden="true" />
            A logo oficial entra aqui depois.
          </div>
        </div>
      </section>
    </main>
  );
}

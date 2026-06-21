import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/brand/Logo";
import {
  BUDGET_RESULT_STORAGE_KEY,
  PENDING_BUDGET_REQUEST_KEY
} from "../../config/budget";
import type { UserRole } from "../../contexts/auth-context";
import { useAuth } from "../../hooks/useAuth";

function hasPendingBudget() {
  return Boolean(
    localStorage.getItem(PENDING_BUDGET_REQUEST_KEY) &&
      localStorage.getItem(BUDGET_RESULT_STORAGE_KEY)
  );
}

function getCustomerRedirect(role: UserRole | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "cliente") return hasPendingBudget() ? "/resultado" : "/cliente/pedidos";
  return null;
}

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const { loading, role, session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !session) return;
    const redirectTo = getCustomerRedirect(role);

    if (redirectTo) {
      navigate(redirectTo, { replace: true });
      return;
    }

    setErrorMessage("Sessão ativa, mas o perfil não foi identificado. Saia e tente entrar novamente.");
  }, [loading, navigate, role, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Preencha e-mail e senha para entrar.");
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email.trim(), password, rememberMe);
    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    const redirectTo = getCustomerRedirect(result.role ?? null);

    if (!redirectTo) {
      setErrorMessage("Não foi possível identificar seu perfil. Verifique o cadastro no Supabase.");
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <main className="creative-surface grid min-h-screen place-items-center px-4 py-10 text-white">
      <section className="neon-card w-full max-w-md p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Link className="btn-secondary min-h-10 px-3 py-2 text-xs" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Início
          </Link>
        </div>

        <div className="mt-8 flex items-start gap-3 sm:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white shadow-neon">
            <LockKeyhole size={23} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-white sm:text-2xl">Entrar na conta</h1>
            <p className="text-sm text-white/[0.55]">Acompanhe pedidos e orçamentos.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-white/70">
            E-mail
            <input
              className="field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@email.com"
              autoComplete="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-white/70">
            Senha
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
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

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <ArrowRight size={18} aria-hidden="true" />
            )}
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-bold text-white/[0.58]">
          Ainda não tem conta?{" "}
          <Link className="text-aqua hover:text-white" to="/cliente/cadastro">
            Criar cadastro
          </Link>
        </p>
      </section>
    </main>
  );
}

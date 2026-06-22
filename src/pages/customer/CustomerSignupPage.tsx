import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/brand/Logo";
import {
  BUDGET_RESULT_STORAGE_KEY,
  PENDING_BUDGET_REQUEST_KEY
} from "../../config/budget";
import { useAuth } from "../../hooks/useAuth";

function hasPendingBudget() {
  return Boolean(
    localStorage.getItem(PENDING_BUDGET_REQUEST_KEY) &&
      localStorage.getItem(BUDGET_RESULT_STORAGE_KEY)
  );
}

function getCustomerRedirect(role: string | null) {
  if (role === "admin") return "/admin/dashboard";
  return hasPendingBudget() ? "/resultado" : "/cliente/pedidos";
}

export function CustomerSignupPage() {
  const navigate = useNavigate();
  const { loading, role, session, signUpCliente } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !session) return;
    navigate(getCustomerRedirect(role), { replace: true });
  }, [loading, navigate, role, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!nome.trim() || !email.trim() || password.length < 6) {
      setErrorMessage("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("A senha e a confirmação de senha não conferem.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar."
      );
      return;
    }

    if (captchaAnswer.trim() !== "7") {
      setErrorMessage("Confira o captcha: quanto é 3 + 4?");
      return;
    }

    setIsSubmitting(true);
    const result = await signUpCliente({
      nome: nome.trim(),
      email: email.trim(),
      password
    });
    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setMessage(
        "Enviamos um e-mail de confirmação. Clique no link recebido para ativar sua conta e acessar seus pedidos."
      );
      return;
    }

    navigate(getCustomerRedirect(result.role ?? "cliente"), { replace: true });
  }

  return (
    <main className="creative-surface grid min-h-screen place-items-center px-4 py-10 text-white">
      <section className="neon-card w-full max-w-lg p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Link className="btn-secondary min-h-10 px-3 py-2 text-xs" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Início
          </Link>
        </div>

        <div className="mt-8 flex items-start gap-3 sm:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white shadow-neon">
            <UserPlus size={23} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-white sm:text-2xl">Criar conta</h1>
            <p className="text-sm text-white/[0.55]">Acompanhe seus pedidos SCRIATIVA.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-white/70">
            Nome
            <input
              className="field"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-white/70">
            E-mail
            <input
              className="field"
              type="email"
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-white/70">
            Confirmação de senha
            <input
              className="field"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>

          <p className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold leading-6 text-white/[0.62]">
            Ao criar sua conta, você está solicitando acesso à área do cliente SCRIATIVA,
            plataforma desenvolvida pela My Dev Solutions para acompanhamento de orçamentos
            e pedidos personalizados.
          </p>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <label className="flex items-start gap-3 text-sm font-bold text-white/[0.72]">
              <input
                className="mt-1 h-4 w-4 accent-magenta"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>Li e aceito os Termos de Uso e a Política de Privacidade.</span>
            </label>
            <div className="mt-3 flex flex-col gap-2 text-sm font-black sm:flex-row sm:items-center sm:gap-4">
              <Link className="text-aqua hover:text-white" to="/termos">
                Ler Termos de Uso
              </Link>
              <Link className="text-aqua hover:text-white" to="/privacidade">
                Ler Política de Privacidade
              </Link>
            </div>
          </div>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Captcha visual: quanto é 3 + 4?
            <input
              className="field"
              inputMode="numeric"
              value={captchaAnswer}
              onChange={(event) => setCaptchaAnswer(event.target.value)}
              placeholder="Digite a resposta"
            />
          </label>

          {errorMessage && (
            <p className="rounded-lg border border-coral/[0.35] bg-coral/[0.12] px-4 py-3 text-sm font-semibold text-coral">
              {errorMessage}
            </p>
          )}
          {message && (
            <p className="rounded-lg border border-mint/[0.35] bg-mint/[0.12] px-4 py-3 text-sm font-semibold text-mint">
              {message}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <ArrowRight size={18} aria-hidden="true" />
            )}
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-bold text-white/[0.58]">
          Já tem conta?{" "}
          <Link className="text-aqua hover:text-white" to="/cliente/login">
            Fazer login
          </Link>
        </p>
        <p className="mt-3 text-center text-sm font-bold text-white/[0.48]">
          Não recebeu o e-mail?{" "}
          <Link className="text-aqua hover:text-white" to="/cliente/reenviar-confirmacao">
            Reenviar confirmação
          </Link>
        </p>
      </section>
    </main>
  );
}

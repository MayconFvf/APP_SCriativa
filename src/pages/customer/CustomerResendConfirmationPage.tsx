import { FormEvent, useState } from "react";
import { ArrowLeft, LoaderCircle, MailCheck, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/brand/Logo";
import { supabase } from "../../lib/supabase";

function getFriendlyResendError(message?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Aguarde alguns minutos antes de solicitar um novo e-mail.";
  }

  if (normalized.includes("email")) {
    return "Informe um e-mail válido para reenviar a confirmação.";
  }

  return "Não foi possível reenviar o e-mail agora. Tente novamente em instantes.";
}

export function CustomerResendConfirmationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Informe o e-mail usado no cadastro.");
      return;
    }

    if (!supabase) {
      setErrorMessage("Supabase ainda não está configurado.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Erro ao reenviar confirmação de e-mail:", error);
      setErrorMessage(getFriendlyResendError(error.message));
      return;
    }

    setMessage("Enviamos um novo e-mail de confirmação. Clique no link recebido para ativar sua conta.");
  }

  return (
    <main className="creative-surface grid min-h-screen place-items-center px-4 py-10 text-white">
      <section className="neon-card w-full max-w-md p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Link className="btn-secondary min-h-10 px-3 py-2 text-xs" to="/cliente/login">
            <ArrowLeft size={16} aria-hidden="true" />
            Login
          </Link>
        </div>

        <div className="mt-8 flex items-start gap-3 sm:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white shadow-lg">
            <MailCheck size={23} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-white sm:text-2xl">Reenviar confirmação</h1>
            <p className="text-sm text-white/[0.55]">Receba um novo link para ativar sua conta.</p>
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

          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            {isSubmitting ? "Reenviando..." : "Reenviar e-mail de confirmação"}
          </button>
        </form>
      </section>
    </main>
  );
}

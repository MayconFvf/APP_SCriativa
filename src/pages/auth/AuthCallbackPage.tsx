import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, MailWarning } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BUDGET_RESULT_STORAGE_KEY,
  PENDING_BUDGET_REQUEST_KEY
} from "../../config/budget";
import { supabase } from "../../lib/supabase";

function hasPendingBudget() {
  return Boolean(
    localStorage.getItem(PENDING_BUDGET_REQUEST_KEY) &&
      localStorage.getItem(BUDGET_RESULT_STORAGE_KEY)
  );
}

function getCallbackErrorFromUrl() {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return (
    url.searchParams.get("error_description") ||
    url.searchParams.get("error") ||
    hashParams.get("error_description") ||
    hashParams.get("error")
  );
}

async function ensureClienteRecordFromSession() {
  if (!supabase) return;

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) return;

  const nome =
    typeof user.user_metadata?.nome === "string" && user.user_metadata.nome.trim()
      ? user.user_metadata.nome.trim()
      : user.email?.split("@")[0] ?? "Cliente SCRIATIVA";

  const { error } = await supabase.from("clientes").upsert(
    {
      auth_user_id: user.id,
      user_id: user.id,
      nome,
      email: user.email ?? null
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Erro ao garantir cliente no callback de autenticação:", error);
  }
}

export function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function confirmAccess() {
      try {
        if (!supabase) {
          throw new Error("Supabase não configurado.");
        }

        const callbackError = getCallbackErrorFromUrl();
        if (callbackError) {
          throw new Error(callbackError);
        }

        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        let { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const retry = await supabase.auth.getSession();
          data = retry.data;
          error = retry.error;
          if (error) throw error;
        }

        if (!data.session) {
          throw new Error("Sessão não encontrada após confirmação.");
        }

        await ensureClienteRecordFromSession();

        if (!isMounted) return;
        window.location.replace(hasPendingBudget() ? "/resultado" : "/cliente/pedidos");
      } catch (error) {
        console.error("Erro ao confirmar acesso por e-mail:", error);
        if (isMounted) {
          setErrorMessage(
            "Não foi possível confirmar seu acesso. Solicite um novo link de confirmação."
          );
        }
      }
    }

    void confirmAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="creative-surface grid min-h-screen place-items-center px-4 py-10 text-white">
      <section className="neon-card w-full max-w-lg p-5 text-center sm:p-6">
        {!errorMessage ? (
          <>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white shadow-lg">
              <LoaderCircle className="animate-spin" size={24} aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-white">Confirmando seu acesso...</h1>
            <p className="mt-3 text-sm leading-6 text-white/[0.62]">
              Estamos ativando sua conta para liberar a área do cliente SCRIATIVA.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-coral/15 text-coral">
              <MailWarning size={24} aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-white">Link não confirmado</h1>
            <p className="mt-3 text-sm leading-6 text-white/[0.62]">{errorMessage}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link className="btn-primary w-full" to="/cliente/reenviar-confirmacao">
                Reenviar confirmação
              </Link>
              <Link className="btn-secondary w-full" to="/cliente/login">
                <ArrowLeft size={18} aria-hidden="true" />
                Voltar ao login
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

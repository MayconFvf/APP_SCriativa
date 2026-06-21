import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, MessageCircle, ReceiptText, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BUDGET_RESULT_STORAGE_KEY,
  LAST_SAVED_BUDGET_KEY,
  PENDING_BUDGET_REQUEST_KEY,
  SCRIATIVA_WHATSAPP_NUMBER,
  VISUAL_FINAL_PRICE
} from "../../config/budget";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

type PublicResult = {
  answers?: Record<string, string>;
  produto?: string;
  produtoId?: string | null;
  arteModeloId?: string | null;
  quantidade?: string;
  quantidadeNumero?: number;
  resumo?: string;
  precoFinal?: string;
  precoFinalNumero?: number;
  custoPecas?: number;
  custoDtf?: number;
  custoArte?: number;
  custoServicos?: number;
  custoFrete?: number;
  custoTotal?: number;
  margemPercentual?: number;
  lucro?: number;
  valoresConfigUsados?: Record<string, unknown>;
};

function getStoredResult(): PublicResult | null {
  const raw = localStorage.getItem(BUDGET_RESULT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PublicResult;
  } catch {
    return null;
  }
}

function parseCurrency(value: string) {
  const normalized = value.replace(/[^\d,]/g, "").replace(",", ".");
  return Number(normalized) || 0;
}

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function wantsDelivery(answers?: Record<string, string>) {
  const delivery = normalizeText(answers?.frete);
  return delivery === "sim" || delivery === "receber em casa";
}

function formatDeliveryAddress(answers?: Record<string, string>) {
  if (!wantsDelivery(answers)) return "";

  const mainAddress = [
    answers?.enderecoRua,
    answers?.enderecoNumero ? `nº ${answers.enderecoNumero}` : "",
    answers?.enderecoBairro,
    [answers?.enderecoCidade, answers?.enderecoEstado].filter(Boolean).join("/")
  ]
    .filter(Boolean)
    .join(", ");
  const details = [
    answers?.enderecoCep ? `CEP ${answers.enderecoCep}` : "",
    answers?.enderecoComplemento ? `Complemento: ${answers.enderecoComplemento}` : "",
    answers?.enderecoReferencia ? `Referência: ${answers.enderecoReferencia}` : ""
  ]
    .filter(Boolean)
    .join(". ");

  return [mainAddress, details].filter(Boolean).join(". ");
}

function buildWhatsAppLink(params: {
  nome: string;
  email: string;
  produto: string;
  quantidade: string;
  resumo: string;
  precoFinal: string;
  status: string;
  entrega: string;
  endereco: string;
}) {
  const message = [
    "Novo orçamento SCRIATIVA",
    "",
    "Cliente:",
    `Nome: ${params.nome}`,
    `E-mail: ${params.email}`,
    "",
    "Pedido:",
    `Produto: ${params.produto}`,
    `Quantidade: ${params.quantidade}`,
    `Resumo: ${params.resumo}`,
    `Valor final: ${params.precoFinal}`,
    `Status: ${params.status}`,
    "",
    "Entrega:",
    `Tipo: ${params.entrega}`,
    `Endereço: ${params.endereco || "Não se aplica"}`
  ].join("\n");

  return `https://wa.me/${SCRIATIVA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, session, user } = useAuth();
  const [requestStatus, setRequestStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const result = useMemo(() => {
    const routeState = location.state as PublicResult | null;
    return routeState ?? getStoredResult();
  }, [location.state]);

  const produto = result?.produto ?? "Produto personalizado";
  const quantidade = result?.quantidade ?? "0";
  const resumo =
    result?.resumo ??
    "Resumo visual do pedido gerado pelo fluxo de orçamento inteligente SCRIATIVA.";
  const precoFinal = result?.precoFinal ?? VISUAL_FINAL_PRICE;
  const precoFinalNumero = result?.precoFinalNumero ?? parseCurrency(precoFinal);
  const nomeCliente = profile?.nome ?? result?.answers?.nome ?? "Cliente";
  const emailCliente = profile?.email ?? result?.answers?.email ?? user?.email ?? "Não informado";
  const entrega = result?.answers?.frete ?? "Não informado";
  const enderecoEntrega = formatDeliveryAddress(result?.answers);
  const whatsappLink = buildWhatsAppLink({
    nome: nomeCliente,
    email: emailCliente,
    produto,
    quantidade,
    resumo,
    precoFinal,
    status: "novo",
    entrega,
    endereco: enderecoEntrega
  });

  const saveRequestedBudget = useCallback(async () => {
    if (!supabase || !session || role !== "cliente" || !profile?.cliente_id || !user) {
      setMessage("Entre ou crie uma conta para solicitar este orçamento.");
      localStorage.setItem(PENDING_BUDGET_REQUEST_KEY, "true");
      navigate("/cliente/cadastro", { replace: false });
      return;
    }

    const signature = JSON.stringify({
      authUserId: user.id,
      produto,
      quantidade,
      resumo,
      precoFinal,
      precoFinalNumero,
      custoTotal: result?.custoTotal ?? 0,
      configSnapshot: result?.valoresConfigUsados ?? null
    });

    if (localStorage.getItem(LAST_SAVED_BUDGET_KEY) === signature) {
      setRequestStatus("saved");
      setMessage("Este orçamento já foi solicitado e está salvo na sua conta.");
      localStorage.removeItem(PENDING_BUDGET_REQUEST_KEY);
      return;
    }

    setRequestStatus("saving");
    setMessage("");

    const { error } = await supabase.from("orcamentos").insert({
      auth_user_id: user.id,
      cliente_id: profile.cliente_id,
      produto_id: result?.produtoId ?? null,
      arte_modelo_id: result?.arteModeloId ?? null,
      quantidade: result?.quantidadeNumero ?? (Number.parseInt(quantidade, 10) || 1),
      resumo_pedido: resumo,
      custo_pecas: result?.custoPecas ?? 0,
      custo_dtf: result?.custoDtf ?? 0,
      custo_arte: result?.custoArte ?? 0,
      custo_servicos: result?.custoServicos ?? 0,
      custo_frete: result?.custoFrete ?? 0,
      custo_total: result?.custoTotal ?? 0,
      margem_percentual: result?.margemPercentual ?? 0,
      preco_venda: precoFinalNumero,
      lucro: result?.lucro ?? 0,
      status: "novo",
      solicitado: true,
      solicitado_em: new Date().toISOString(),
      telefone_whatsapp_destino: `+${SCRIATIVA_WHATSAPP_NUMBER}`,
      valores_config_usados: result?.valoresConfigUsados ?? {
        origem: "chatbot_publico",
        produto
      }
    });

    if (error) {
      setRequestStatus("error");
      setMessage("Não foi possível salvar o pedido agora. Tente novamente em instantes.");
      return;
    }

    localStorage.setItem(LAST_SAVED_BUDGET_KEY, signature);
    localStorage.removeItem(PENDING_BUDGET_REQUEST_KEY);
    setRequestStatus("saved");
    setMessage("Orçamento solicitado com sucesso e salvo na sua conta.");
  }, [
    navigate,
    precoFinal,
    precoFinalNumero,
    produto,
    profile?.cliente_id,
    quantidade,
    result?.arteModeloId,
    result?.custoArte,
    result?.custoDtf,
    result?.custoFrete,
    result?.custoPecas,
    result?.custoServicos,
    result?.custoTotal,
    result?.lucro,
    result?.margemPercentual,
    result?.produtoId,
    result?.quantidadeNumero,
    result?.valoresConfigUsados,
    resumo,
    role,
    session,
    user
  ]);

  useEffect(() => {
    const hasPendingRequest = localStorage.getItem(PENDING_BUDGET_REQUEST_KEY);

    if (hasPendingRequest && session && role === "cliente" && requestStatus === "idle") {
      void saveRequestedBudget();
    }
  }, [requestStatus, role, saveRequestedBudget, session]);

  function handleNewBudget() {
    localStorage.removeItem(BUDGET_RESULT_STORAGE_KEY);
    localStorage.removeItem(PENDING_BUDGET_REQUEST_KEY);
    navigate("/orcamento");
  }

  return (
    <section className="section-shell py-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">
            Resultado público
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Orçamento pronto
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/[0.62]">
            Revise o resumo e solicite este orçamento para acompanhar o pedido.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
          <section className="neon-card p-5 sm:p-6">
            <div className="flex items-start gap-3 border-b border-white/10 pb-5 sm:items-center">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white shadow-neon">
                <Sparkles size={24} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-black text-white sm:text-2xl">Resumo do pedido</h2>
                <p className="text-sm text-white/[0.52]">Informações públicas do orçamento.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ["Produto", produto],
                ["Quantidade", `${quantidade} unidades`],
                ["Resumo do pedido", resumo]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/[0.22] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.38]">
                    {label}
                  </p>
                  <p className="mt-2 break-words text-base font-bold leading-7 text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-lg border border-white/10 bg-gradient-to-br from-coral/[0.18] via-magenta/[0.14] to-denim/[0.18] p-5 shadow-neon backdrop-blur-xl sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ink">
                <ReceiptText size={24} aria-hidden="true" />
              </span>
              <span className="text-sm font-black uppercase tracking-[0.18em] text-white/[0.58]">
                Valor final
              </span>
            </div>

            <p className="mt-6 break-words text-4xl font-black leading-tight text-white sm:text-5xl">
              {precoFinal}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/[0.58]">
              Custos internos, margem e lucro não aparecem na área pública.
            </p>

            {message && (
              <p
                className={[
                  "mt-6 rounded-lg border px-4 py-3 text-sm font-bold",
                  requestStatus === "error"
                    ? "border-coral/[0.35] bg-coral/[0.12] text-coral"
                    : "border-mint/[0.35] bg-mint/[0.12] text-mint"
                ].join(" ")}
              >
                {message}
              </p>
            )}

            {requestStatus === "saved" && (
              <a
                className="btn-primary mt-6 w-full"
                href={whatsappLink}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Enviar resumo para SCRIATIVA no WhatsApp
              </a>
            )}

            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={() => void saveRequestedBudget()}
              disabled={requestStatus === "saving"}
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              {requestStatus === "saving" ? "Solicitando..." : "Solicitar este orçamento"}
            </button>

            <button type="button" className="btn-secondary mt-3 w-full" onClick={handleNewBudget}>
              Fazer novo orçamento
            </button>

            {session && role === "cliente" && (
              <Link to="/cliente/pedidos" className="btn-secondary mt-3 w-full">
                Ver meus pedidos
              </Link>
            )}

            <Link to="/" className="btn-secondary mt-3 w-full">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar ao início
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

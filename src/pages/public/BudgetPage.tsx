import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BUDGET_RESULT_STORAGE_KEY } from "../../config/budget";
import {
  calculatePublicBudget,
  isBudgetCalculationError,
  type BudgetAnswers
} from "../../lib/budgetCalculator";
import { fetchAddressByCep, formatCep, onlyCepDigits } from "../../lib/cep";
import { supabase } from "../../lib/supabase";

type PublicProduct = {
  id: string;
  nome: string;
  categoria: string | null;
  tipo: string | null;
  tecido: string | null;
  tamanho: string | null;
  cor: string | null;
};

type PublicArtModel = {
  id: string;
  nome: string;
  categoria: string | null;
  descricao: string | null;
  imagem_url: string | null;
  valor_extra: number | null;
};

type StepKey =
  | "dados"
  | "produto"
  | "quantidade"
  | "caracteristicas"
  | "estampa"
  | "arte"
  | "frete"
  | "resumo";

const steps: Array<{ key: StepKey; label: string }> = [
  { key: "dados", label: "Dados" },
  { key: "produto", label: "Produto" },
  { key: "quantidade", label: "Quantidade" },
  { key: "caracteristicas", label: "Características" },
  { key: "estampa", label: "Estampa" },
  { key: "arte", label: "Arte" },
  { key: "frete", label: "Frete" },
  { key: "resumo", label: "Resumo" }
];

const fallbackProducts = ["Camiseta", "DTF têxtil", "Uniforme", "Moletom", "Ecobag", "Outro"];
const faixaOptions = ["Adulto", "Infantil", "Misto"];
const tecidoOptions = ["Algodão", "Poliéster", "Dry fit", "Moletom", "A confirmar"];
const corOptions = ["Preto", "Branco", "Cinza", "Azul", "Personalizada"];
const tamanhoOptions = ["PP", "P", "M", "G", "GG", "Misto"];
const medidaFrenteOptions = ["10 x 10 cm", "20 x 28 cm", "28 x 35 cm", "Personalizada"];
const medidaCostasOptions = ["10 x 10 cm", "25 x 30 cm", "30 x 40 cm", "Personalizada"];
const medidaMangaOptions = ["6 x 6 cm", "8 x 10 cm", "10 x 12 cm", "Personalizada"];
const yesNoOptions = ["Sim", "Não"];
const deliveryOptions = ["Receber em casa", "Retirada", "Combinar"];

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number.isFinite(numericValue ?? 0) ? Number(numericValue ?? 0) : 0);
}

function pruneIncompatibleAnswers(answers: BudgetAnswers) {
  const nextAnswers = { ...answers };

  if (nextAnswers.estampaFrente !== "Sim") delete nextAnswers.medidaFrente;
  if (nextAnswers.estampaCostas !== "Sim") delete nextAnswers.medidaCostas;
  if (nextAnswers.estampaManga !== "Sim") delete nextAnswers.medidaManga;

  if (nextAnswers.arteFluxo !== "modelo_pronto") {
    delete nextAnswers.arteModeloId;
    delete nextAnswers.arteModeloNome;
  }

  if (nextAnswers.produtoId === "") {
    delete nextAnswers.produtoId;
  }

  if (!wantsDelivery(nextAnswers)) {
    delete nextAnswers.enderecoCep;
    delete nextAnswers.enderecoRua;
    delete nextAnswers.enderecoNumero;
    delete nextAnswers.enderecoBairro;
    delete nextAnswers.enderecoCidade;
    delete nextAnswers.enderecoEstado;
    delete nextAnswers.enderecoComplemento;
    delete nextAnswers.enderecoReferencia;
  }

  return nextAnswers;
}

function wantsDelivery(answers: BudgetAnswers) {
  const delivery = normalizeText(answers.frete);
  return delivery === "sim" || delivery === "receber em casa";
}

function isDeliveryToArrange(answers: BudgetAnswers) {
  return normalizeText(answers.frete) === "combinar";
}

function getDeliverySummaryText(answers: BudgetAnswers) {
  if (isDeliveryToArrange(answers)) return "Entrega a combinar";
  return `Entrega: ${answers.frete || "a confirmar"}`;
}

function hasRequiredAddress(answers: BudgetAnswers) {
  return Boolean(
    answers.enderecoCep?.trim() &&
      answers.enderecoRua?.trim() &&
      answers.enderecoNumero?.trim() &&
      answers.enderecoBairro?.trim() &&
      answers.enderecoCidade?.trim() &&
      answers.enderecoEstado?.trim()
  );
}

function formatDeliveryAddress(answers: BudgetAnswers) {
  if (!wantsDelivery(answers)) return "";

  const mainAddress = [
    answers.enderecoRua,
    answers.enderecoNumero ? `nº ${answers.enderecoNumero}` : "",
    answers.enderecoBairro,
    [answers.enderecoCidade, answers.enderecoEstado].filter(Boolean).join("/")
  ]
    .filter(Boolean)
    .join(", ");
  const details = [
    answers.enderecoCep ? `CEP ${answers.enderecoCep}` : "",
    answers.enderecoComplemento ? `Complemento: ${answers.enderecoComplemento}` : "",
    answers.enderecoReferencia ? `Referência: ${answers.enderecoReferencia}` : ""
  ]
    .filter(Boolean)
    .join(". ");

  return [mainAddress, details].filter(Boolean).join(". ");
}

function getPublicSummary(answers: BudgetAnswers) {
  const estampas = [
    answers.estampaFrente === "Sim" ? `frente ${answers.medidaFrente ?? "a definir"}` : "",
    answers.estampaCostas === "Sim" ? `costas ${answers.medidaCostas ?? "a definir"}` : "",
    answers.estampaManga === "Sim" ? `manga ${answers.medidaManga ?? "a definir"}` : ""
  ]
    .filter(Boolean)
    .join(", ");
  const arte =
    answers.analiseManual === "Sim"
      ? "análise manual"
      : answers.arteModeloNome || answers.arteOpcao || answers.artePronta || "a confirmar";

  return {
    produto: answers.produto || "Produto personalizado",
    quantidade: answers.quantidade || "0",
    resumo:
      `${answers.produto || "Produto"} ${answers.faixa || ""}, tecido ${answers.tecido || "a confirmar"}, cor ${answers.cor || "a confirmar"}, tamanho ${answers.tamanho || "a confirmar"}. ` +
      `Estampas: ${estampas || "sem estampa informada"}. Arte: ${arte}. ${getDeliverySummaryText(answers)}.` +
      `${formatDeliveryAddress(answers) ? ` Endereço: ${formatDeliveryAddress(answers)}.` : ""}`
  };
}

function productHasCharacteristics(product?: PublicProduct | null) {
  return Boolean(product?.tecido || product?.cor || product?.tamanho);
}

export function BudgetPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<BudgetAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [artModels, setArtModels] = useState<PublicArtModel[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState("");
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState("");

  const activeStep = steps[currentStep];
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === answers.produtoId) ?? null,
    [answers.produtoId, products]
  );
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const summary = getPublicSummary(answers);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      if (!supabase) {
        setIsCatalogLoading(false);
        return;
      }

      setIsCatalogLoading(true);
      setCatalogError("");

      try {
        const [{ data: productData, error: productError }, { data: artData, error: artError }] =
          await Promise.all([
            supabase
              .from("produtos")
              .select("id,nome,categoria,tipo,tecido,tamanho,cor")
              .eq("ativo", true)
              .order("nome", { ascending: true }),
            supabase
              .from("artes_modelos")
              .select("id,nome,categoria,descricao,imagem_url,valor_extra")
              .eq("ativo", true)
              .order("nome", { ascending: true })
          ]);

        if (productError) throw productError;
        if (artError) throw artError;
        if (!isMounted) return;

        setProducts((productData ?? []) as PublicProduct[]);
        setArtModels((artData ?? []) as PublicArtModel[]);
      } catch (error) {
        console.log("Erro técnico ao carregar catálogo público do orçamento:", error);
        if (isMounted) {
          setCatalogError(
            "Não foi possível carregar produtos e artes ativas agora. Você ainda pode seguir com as opções básicas."
          );
        }
      } finally {
        if (isMounted) setIsCatalogLoading(false);
      }
    }

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const cepDigits = onlyCepDigits(answers.enderecoCep ?? "");
    const delivery = normalizeText(answers.frete);
    const shouldSearchAddress = delivery === "sim" || delivery === "receber em casa";

    if (!shouldSearchAddress || cepDigits.length !== 8) {
      setIsCepLoading(false);
      if (cepDigits.length < 8) setCepMessage("");
      return;
    }

    let isCurrent = true;

    async function loadAddress() {
      setIsCepLoading(true);
      setCepMessage("");

      try {
        const address = await fetchAddressByCep(cepDigits);

        if (!isCurrent) return;

        if (!address) {
          setCepMessage("CEP não encontrado. Preencha o endereço manualmente.");
          return;
        }

        setAnswers((current) =>
          pruneIncompatibleAnswers({
            ...current,
            enderecoRua: address.rua,
            enderecoBairro: address.bairro,
            enderecoCidade: address.cidade,
            enderecoEstado: address.estado
          })
        );
      } catch {
        if (isCurrent) {
          setCepMessage("Não foi possível buscar o CEP agora. Preencha manualmente.");
        }
      } finally {
        if (isCurrent) setIsCepLoading(false);
      }
    }

    void loadAddress();

    return () => {
      isCurrent = false;
    };
  }, [answers.enderecoCep, answers.frete]);

  function updateAnswers(updates: BudgetAnswers) {
    setCalculationError("");
    setAnswers((current) => pruneIncompatibleAnswers({ ...current, ...updates }));
  }

  function updateCep(value: string) {
    setCepMessage("");
    updateAnswers({ enderecoCep: formatCep(value) });
  }

  function canContinue(step: StepKey) {
    if (step === "dados") {
      return Boolean(answers.nome?.trim() && answers.email?.trim() && answers.telefone?.trim());
    }

    if (step === "produto") return Boolean(answers.produto?.trim());
    if (step === "quantidade") return Number.parseInt(answers.quantidade ?? "", 10) > 0;

    if (step === "caracteristicas") {
      return Boolean(answers.faixa && answers.tecido && answers.cor && answers.tamanho);
    }

    if (step === "estampa") {
      const frontOk = answers.estampaFrente !== "Sim" || Boolean(answers.medidaFrente);
      const backOk = answers.estampaCostas !== "Sim" || Boolean(answers.medidaCostas);
      const sleeveOk = answers.estampaManga !== "Sim" || Boolean(answers.medidaManga);
      return Boolean(answers.estampaFrente && answers.estampaCostas && answers.estampaManga && frontOk && backOk && sleeveOk);
    }

    if (step === "arte") {
      if (!answers.arteFluxo) return false;
      if (answers.arteFluxo === "modelo_pronto" && artModels.length > 0) {
        return Boolean(answers.arteModeloId);
      }
      return true;
    }

    if (step === "frete") {
      return Boolean(answers.frete && answers.prazo && (!wantsDelivery(answers) || hasRequiredAddress(answers)));
    }

    return true;
  }

  function goNext() {
    if (!canContinue(activeStep.key)) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function restartBudget() {
    setAnswers({});
    setCurrentStep(0);
    setCalculationError("");
    localStorage.removeItem(BUDGET_RESULT_STORAGE_KEY);
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goNext();
  }

  function selectProduct(product: PublicProduct) {
    updateAnswers({
      produto: product.nome,
      produtoId: product.id,
      tecido: product.tecido ?? answers.tecido ?? "",
      cor: product.cor ?? answers.cor ?? "",
      tamanho: product.tamanho ?? answers.tamanho ?? "",
      categoriaProduto: product.categoria ?? "",
      tipoProduto: product.tipo ?? "",
      caracteristicasConfirmadas: productHasCharacteristics(product) ? "Sim" : ""
    });
  }

  function selectFallbackProduct(product: string) {
    updateAnswers({
      produto: product,
      produtoId: "",
      categoriaProduto: product,
      tipoProduto: "",
      caracteristicasConfirmadas: ""
    });
  }

  function selectArtFlow(flow: string) {
    const flowAnswers: Record<string, BudgetAnswers> = {
      arte_pronta: {
        arteFluxo: "arte_pronta",
        arteOpcao: "Tenho arte pronta",
        artePronta: "Sim",
        galeriaArte: "Não",
        criacaoArte: "Não",
        vetorizacao: "Não",
        analiseManual: "Não"
      },
      modelo_pronto: {
        arteFluxo: "modelo_pronto",
        arteOpcao: "Modelo pronto",
        artePronta: "Sim",
        galeriaArte: "Sim",
        criacaoArte: "Não",
        vetorizacao: "Não",
        analiseManual: "Não"
      },
      criacao: {
        arteFluxo: "criacao",
        arteOpcao: "Criação de arte",
        artePronta: "Não",
        galeriaArte: "Não",
        criacaoArte: "Sim",
        vetorizacao: "Não",
        analiseManual: "Não"
      },
      vetorizacao: {
        arteFluxo: "vetorizacao",
        arteOpcao: "Vetorização",
        artePronta: "Sim",
        galeriaArte: "Não",
        criacaoArte: "Não",
        vetorizacao: "Sim",
        analiseManual: "Não"
      },
      analise_manual: {
        arteFluxo: "analise_manual",
        arteOpcao: "Ainda não sei",
        artePronta: "Ainda não sei",
        galeriaArte: "Não",
        criacaoArte: "Talvez",
        vetorizacao: "Não sei",
        analiseManual: "Sim"
      }
    };

    updateAnswers(flowAnswers[flow]);
  }

  function selectArtModel(artModel: PublicArtModel) {
    updateAnswers({
      arteModeloId: artModel.id,
      arteModeloNome: artModel.nome,
      galeriaArte: "Sim",
      arteFluxo: "modelo_pronto",
      arteOpcao: "Modelo pronto",
      artePronta: "Sim",
      analiseManual: "Não"
    });
  }

  async function handleResult() {
    setIsCalculating(true);
    setCalculationError("");

    try {
      const payload = await calculatePublicBudget(answers, summary);
      localStorage.setItem(BUDGET_RESULT_STORAGE_KEY, JSON.stringify(payload));
      navigate("/resultado", { state: payload });
    } catch (error) {
      console.log("Erro técnico completo ao calcular orçamento público:", error);

      setCalculationError(
        isBudgetCalculationError(error)
          ? error.userMessage
          : "Não foi possível calcular o orçamento agora. Verifique os cadastros e tente novamente."
      );
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <section className="section-shell py-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">
              Orçamento guiado
            </p>
            <span className="glass-panel px-4 py-2 text-sm font-black text-white">
              {progress}% concluído
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coral via-magenta to-aqua transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h1 className="mt-5 text-3xl font-black text-white sm:text-4xl">
            Orçamento em 8 etapas
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/[0.62]">
            Responda somente o essencial. O cálculo usa os parâmetros atuais configurados pela SCRIATIVA.
          </p>
        </div>

        <div className="neon-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[0.62fr_1.38fr]">
            <aside className="border-b border-white/10 bg-black/20 p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white sm:h-12 sm:w-12">
                  <MessageCircle size={23} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-white">Chatbot SCRIATIVA</h2>
                  <p className="text-sm text-white/[0.52]">Fluxo enxuto e responsivo.</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:mt-6 lg:grid lg:overflow-visible lg:pb-0">
                {steps.map((step, index) => (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={[
                      "flex min-h-12 min-w-[8.75rem] items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-bold transition lg:min-w-0",
                      index === currentStep
                        ? "border-aqua/35 bg-aqua/10 text-white"
                        : index < currentStep
                          ? "border-mint/25 bg-mint/10 text-white"
                          : "border-white/10 bg-white/5 text-white/[0.42]"
                    ].join(" ")}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-xs">
                      {index + 1}
                    </span>
                    <span className="truncate whitespace-nowrap lg:whitespace-normal">{step.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="p-4 sm:p-7 lg:min-h-[560px]">
              <div
                key={activeStep.key}
                className="flex min-h-[420px] flex-col motion-safe:animate-[chatStep_220ms_ease-out] sm:min-h-[500px] lg:min-h-[510px]"
              >
                <div className="max-w-full rounded-lg rounded-tl-sm border border-white/10 bg-white/10 px-4 py-4 sm:max-w-[94%] sm:px-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 shrink-0 text-aqua" size={18} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-lg font-black text-white sm:text-xl">{activeStep.label}</p>
                      <p className="mt-2 text-sm leading-6 text-white/[0.58]">
                        {getStepHelper(activeStep.key)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {activeStep.key === "dados" && (
                    <form className="grid gap-4" onSubmit={submitStep}>
                      <TextField label="Nome" value={answers.nome ?? ""} onChange={(value) => updateAnswers({ nome: value })} />
                      <TextField label="E-mail" type="email" value={answers.email ?? ""} onChange={(value) => updateAnswers({ email: value })} />
                      <TextField label="Telefone" type="tel" value={answers.telefone ?? ""} onChange={(value) => updateAnswers({ telefone: value })} />
                      <StepContinue disabled={!canContinue(activeStep.key)} />
                    </form>
                  )}

                  {activeStep.key === "produto" && (
                    <div className="grid gap-5">
                      {catalogError && (
                        <p className="rounded-lg border border-coral/[0.35] bg-coral/[0.12] px-4 py-3 text-sm font-bold text-coral">
                          {catalogError}
                        </p>
                      )}
                      {isCatalogLoading && (
                        <p className="text-sm font-bold text-white/[0.58]">Carregando produtos ativos...</p>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(products.length ? products : fallbackProducts).map((item) => {
                          const isProduct = typeof item !== "string";
                          const productName = isProduct ? item.nome : item;
                          const selected = normalizeText(answers.produto) === normalizeText(productName);

                          return (
                            <button
                              key={isProduct ? item.id : item}
                              type="button"
                              className={optionClass(selected)}
                              onClick={() => (isProduct ? selectProduct(item) : selectFallbackProduct(item))}
                            >
                              <span className="block">{productName}</span>
                              {isProduct && (
                                <span className="mt-1 block text-xs font-bold text-white/[0.46]">
                                  {[item.categoria, item.tipo].filter(Boolean).join(" · ") || "Produto cadastrado"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <StepContinue disabled={!canContinue(activeStep.key)} onClick={goNext} />
                    </div>
                  )}

                  {activeStep.key === "quantidade" && (
                    <form className="grid gap-4" onSubmit={submitStep}>
                      <TextField
                        label="Quantidade"
                        type="number"
                        value={answers.quantidade ?? ""}
                        onChange={(value) => updateAnswers({ quantidade: value })}
                      />
                      <StepContinue disabled={!canContinue(activeStep.key)} />
                    </form>
                  )}

                  {activeStep.key === "caracteristicas" && (
                    <div className="grid gap-5">
                      {productHasCharacteristics(selectedProduct) && (
                        <div className="rounded-lg border border-aqua/25 bg-aqua/10 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-aqua">
                            Dados do produto cadastrado
                          </p>
                          <p className="mt-2 text-sm font-bold leading-6 text-white">
                            {[
                              selectedProduct?.tecido ? `Tecido: ${selectedProduct.tecido}` : "",
                              selectedProduct?.cor ? `Cor: ${selectedProduct.cor}` : "",
                              selectedProduct?.tamanho ? `Tamanho: ${selectedProduct.tamanho}` : ""
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <button
                            type="button"
                            className="btn-secondary mt-4 min-h-10 w-full px-3 py-2 sm:w-auto"
                            onClick={() => updateAnswers({ caracteristicasConfirmadas: "Sim" })}
                          >
                            <CheckCircle2 size={16} aria-hidden="true" />
                            Confirmar características
                          </button>
                        </div>
                      )}

                      <OptionGroup label="Adulto ou infantil?" options={faixaOptions} value={answers.faixa} onSelect={(value) => updateAnswers({ faixa: value })} />
                      <OptionGroup label="Tecido" options={prependCurrent(tecidoOptions, answers.tecido)} value={answers.tecido} onSelect={(value) => updateAnswers({ tecido: value })} />
                      <OptionGroup label="Cor" options={prependCurrent(corOptions, answers.cor)} value={answers.cor} onSelect={(value) => updateAnswers({ cor: value })} />
                      <OptionGroup label="Tamanho" options={prependCurrent(tamanhoOptions, answers.tamanho)} value={answers.tamanho} onSelect={(value) => updateAnswers({ tamanho: value })} />
                      <StepContinue disabled={!canContinue(activeStep.key)} onClick={goNext} />
                    </div>
                  )}

                  {activeStep.key === "estampa" && (
                    <div className="grid gap-5">
                      <StampBlock
                        title="Estampa na frente?"
                        enabled={answers.estampaFrente}
                        measure={answers.medidaFrente}
                        measureOptions={medidaFrenteOptions}
                        onEnabled={(value) => updateAnswers({ estampaFrente: value })}
                        onMeasure={(value) => updateAnswers({ medidaFrente: value })}
                      />
                      <StampBlock
                        title="Estampa nas costas?"
                        enabled={answers.estampaCostas}
                        measure={answers.medidaCostas}
                        measureOptions={medidaCostasOptions}
                        onEnabled={(value) => updateAnswers({ estampaCostas: value })}
                        onMeasure={(value) => updateAnswers({ medidaCostas: value })}
                      />
                      <StampBlock
                        title="Estampa na manga?"
                        enabled={answers.estampaManga}
                        measure={answers.medidaManga}
                        measureOptions={medidaMangaOptions}
                        onEnabled={(value) => updateAnswers({ estampaManga: value })}
                        onMeasure={(value) => updateAnswers({ medidaManga: value })}
                      />
                      <StepContinue disabled={!canContinue(activeStep.key)} onClick={goNext} />
                    </div>
                  )}

                  {activeStep.key === "arte" && (
                    <div className="grid gap-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["arte_pronta", "Tenho arte pronta"],
                          ["modelo_pronto", "Quero escolher um modelo pronto"],
                          ["criacao", "Preciso de criação"],
                          ["vetorizacao", "Preciso de vetorização"],
                          ["analise_manual", "Ainda não sei"]
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            className={optionClass(answers.arteFluxo === value)}
                            onClick={() => selectArtFlow(value)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {answers.arteFluxo === "modelo_pronto" && (
                        <div className="grid gap-3">
                          <p className="text-sm font-bold text-white/[0.62]">Galeria de artes prontas</p>
                          {artModels.length === 0 && (
                            <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
                              Nenhum modelo ativo encontrado. A SCRIATIVA pode analisar manualmente.
                            </p>
                          )}
                          <div className="grid gap-3 sm:grid-cols-2">
                            {artModels.map((artModel) => (
                              <button
                                key={artModel.id}
                                type="button"
                                className={[
                                  optionClass(answers.arteModeloId === artModel.id),
                                  "overflow-hidden p-0"
                                ].join(" ")}
                                onClick={() => selectArtModel(artModel)}
                              >
                                {artModel.imagem_url ? (
                                  <img
                                    src={artModel.imagem_url}
                                    alt={`Modelo pronto ${artModel.nome}`}
                                    className="h-40 w-full object-cover sm:h-36"
                                  />
                                ) : (
                                  <span className="grid h-40 w-full place-items-center bg-black/25 text-sm font-black text-white/[0.42] sm:h-36">
                                    Sem imagem
                                  </span>
                                )}
                                <span className="block p-4 text-left">
                                  <span className="block text-base font-black">{artModel.nome}</span>
                                  <span className="mt-1 block text-xs font-bold text-white/[0.5]">
                                    {artModel.categoria ?? "Modelo pronto"}
                                  </span>
                                  <span className="mt-2 block text-sm font-black text-aqua">
                                    {formatCurrency(artModel.valor_extra)}
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {answers.arteFluxo === "analise_manual" && (
                        <p className="rounded-lg border border-mango/30 bg-mango/10 p-4 text-sm font-bold text-white/[0.68]">
                          Marcado para análise manual. A equipe SCRIATIVA revisará a arte antes da produção.
                        </p>
                      )}

                      <StepContinue disabled={!canContinue(activeStep.key)} onClick={goNext} />
                    </div>
                  )}

                  {activeStep.key === "frete" && (
                    <div className="grid gap-5">
                      <OptionGroup
                        label="Como será a entrega?"
                        options={deliveryOptions}
                        value={answers.frete}
                        onSelect={(value) => updateAnswers({ frete: value })}
                      />
                      {wantsDelivery(answers) && (
                        <div className="rounded-lg border border-aqua/20 bg-aqua/[0.06] p-4">
                          <p className="text-sm font-black text-white">Endereço de entrega</p>
                          <p className="mt-1 text-sm leading-6 text-white/[0.55]">
                            Preencha os campos obrigatórios para a equipe confirmar a entrega.
                          </p>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <TextField
                              label="CEP"
                              value={answers.enderecoCep ?? ""}
                              onChange={updateCep}
                            />
                            <TextField
                              label="Rua"
                              value={answers.enderecoRua ?? ""}
                              onChange={(value) => updateAnswers({ enderecoRua: value })}
                            />
                            <TextField
                              label="Número"
                              value={answers.enderecoNumero ?? ""}
                              onChange={(value) => updateAnswers({ enderecoNumero: value })}
                            />
                            <TextField
                              label="Bairro"
                              value={answers.enderecoBairro ?? ""}
                              onChange={(value) => updateAnswers({ enderecoBairro: value })}
                            />
                            <TextField
                              label="Cidade"
                              value={answers.enderecoCidade ?? ""}
                              onChange={(value) => updateAnswers({ enderecoCidade: value })}
                            />
                            <TextField
                              label="Estado"
                              value={answers.enderecoEstado ?? ""}
                              onChange={(value) => updateAnswers({ enderecoEstado: value })}
                            />
                            <TextField
                              label="Complemento opcional"
                              value={answers.enderecoComplemento ?? ""}
                              onChange={(value) => updateAnswers({ enderecoComplemento: value })}
                            />
                            <TextField
                              label="Ponto de referência opcional"
                              value={answers.enderecoReferencia ?? ""}
                              onChange={(value) => updateAnswers({ enderecoReferencia: value })}
                            />
                          </div>
                          {isCepLoading && (
                            <p className="mt-3 text-sm font-bold text-aqua">Buscando endereço...</p>
                          )}
                          {cepMessage && (
                            <p className="mt-3 rounded-lg border border-mango/30 bg-mango/10 px-4 py-3 text-sm font-bold text-white/[0.7]">
                              {cepMessage}
                            </p>
                          )}
                        </div>
                      )}
                      <OptionGroup
                        label="Prazo desejado"
                        options={["Padrão", "Urgente"]}
                        value={answers.prazo}
                        onSelect={(value) =>
                          updateAnswers({ prazo: value, margemLucro: value === "Urgente" ? "Premium" : "Padrão" })
                        }
                      />
                      <StepContinue disabled={!canContinue(activeStep.key)} onClick={goNext} />
                    </div>
                  )}

                  {activeStep.key === "resumo" && (
                    <div className="grid gap-5">
                      <div className="flex items-start gap-3 sm:items-center">
                        <span className="grid h-12 w-12 place-items-center rounded-lg bg-mint text-ink">
                          <ClipboardList size={24} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="text-xl font-black text-white sm:text-2xl">Resumo do orçamento</h2>
                          <p className="text-sm text-white/[0.52]">Revise antes de gerar o valor final.</p>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {summaryRows(answers, summary).map((item) => (
                          <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.38]">
                              {item.label}
                            </p>
                            <p className="mt-2 break-words text-sm font-bold leading-6 text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {calculationError && (
                        <p className="rounded-lg border border-coral/[0.35] bg-coral/[0.12] px-4 py-3 text-sm font-bold text-coral">
                          {calculationError}
                        </p>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr]">
                        <button type="button" className="btn-secondary w-full" onClick={goBack}>
                          <ArrowLeft size={18} aria-hidden="true" />
                          Voltar e editar
                        </button>
                        <button type="button" className="btn-secondary w-full" onClick={restartBudget}>
                          <RotateCcw size={18} aria-hidden="true" />
                          Recomeçar orçamento
                        </button>
                        <button
                          type="button"
                          className="btn-primary w-full sm:col-span-2 lg:col-span-1"
                          onClick={() => void handleResult()}
                          disabled={isCalculating}
                        >
                          {isCalculating ? "Calculando..." : "Finalizar orçamento"}
                          <ArrowRight size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {activeStep.key !== "resumo" && (
                  <div className="mt-auto flex flex-col-reverse gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    {currentStep > 0 ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/[0.68] transition hover:bg-white/[0.08] hover:text-white sm:w-auto"
                        onClick={goBack}
                      >
                        <ArrowLeft size={17} aria-hidden="true" />
                        Voltar
                      </button>
                    ) : (
                      <span />
                    )}
                    <span className="text-center text-sm font-bold text-white/[0.42] sm:text-right">
                      Etapa {currentStep + 1} de {steps.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getStepHelper(step: StepKey) {
  const helpers: Record<StepKey, string> = {
    dados: "Informe os dados para identificar seu atendimento.",
    produto: "Escolha o item personalizado que você quer produzir.",
    quantidade: "Digite uma quantidade estimada para calcular o pedido.",
    caracteristicas: "Confirme modelagem, tecido, cor e tamanho.",
    estampa: "Informe onde terá estampa e as medidas aproximadas.",
    arte: "Escolha como a arte será preparada para produção.",
    frete: "Defina entrega e prazo desejado.",
    resumo: "Confira as respostas antes de gerar o preço final."
  };

  return helpers[step];
}

function optionClass(selected: boolean) {
  return [
    "min-h-16 w-full rounded-lg border px-5 py-4 text-left text-base font-black transition hover:-translate-y-0.5 sm:min-h-14 sm:text-sm",
    selected
      ? "border-magenta bg-magenta/[0.18] text-white shadow-neon"
      : "border-white/10 bg-white/[0.08] text-white/[0.78] hover:border-aqua/[0.45] hover:bg-white/[0.12]"
  ].join(" ");
}

function prependCurrent(options: string[], current?: string) {
  if (!current || options.includes(current)) return options;
  return [current, ...options];
}

function TextField({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-bold text-white/70">
      {label}
      <input
        className="field text-base"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StepContinue({ disabled, onClick }: { disabled: boolean; onClick?: () => void }) {
  return (
    <button type={onClick ? "button" : "submit"} className="btn-primary w-full sm:w-auto" disabled={disabled} onClick={onClick}>
      Continuar
      <ArrowRight size={18} aria-hidden="true" />
    </button>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onSelect
}: {
  label: string;
  options: string[];
  value?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-white/[0.62]">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={optionClass(value === option)}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function StampBlock({
  title,
  enabled,
  measure,
  measureOptions,
  onEnabled,
  onMeasure
}: {
  title: string;
  enabled?: string;
  measure?: string;
  measureOptions: string[];
  onEnabled: (value: string) => void;
  onMeasure: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <OptionGroup label={title} options={yesNoOptions} value={enabled} onSelect={onEnabled} />
      {enabled === "Sim" && (
        <div className="mt-4">
          <OptionGroup label="Medida aproximada" options={measureOptions} value={measure} onSelect={onMeasure} />
        </div>
      )}
    </div>
  );
}

function summaryRows(answers: BudgetAnswers, summary: ReturnType<typeof getPublicSummary>) {
  return [
    { label: "Cliente", value: `${answers.nome || "-"} · ${answers.email || "-"} · ${answers.telefone || "-"}` },
    { label: "Produto", value: `${summary.produto} · ${summary.quantidade} unidade(s)` },
    {
      label: "Características",
      value: `${answers.faixa || "-"} · tecido ${answers.tecido || "-"} · cor ${answers.cor || "-"} · tamanho ${answers.tamanho || "-"}`
    },
    {
      label: "Estampas",
      value:
        [
          answers.estampaFrente === "Sim" ? `Frente ${answers.medidaFrente}` : "",
          answers.estampaCostas === "Sim" ? `Costas ${answers.medidaCostas}` : "",
          answers.estampaManga === "Sim" ? `Manga ${answers.medidaManga}` : ""
        ]
          .filter(Boolean)
          .join(" · ") || "Sem estampa informada"
    },
    { label: "Arte", value: answers.arteModeloNome || answers.arteOpcao || "A confirmar" },
    { label: "Tipo de entrega", value: `${getDeliverySummaryText(answers)} · prazo ${answers.prazo || "-"}` },
    {
      label: "Endereço",
      value: formatDeliveryAddress(answers) || "Não informado para retirada ou entrega a combinar"
    },
    { label: "Resumo do pedido", value: summary.resumo }
  ];
}

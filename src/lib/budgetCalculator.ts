import { supabase } from "./supabase";

export type BudgetAnswers = Record<string, string>;

type BudgetCalculationErrorCode =
  | "supabase_not_configured"
  | "missing_calculation_config"
  | "missing_product_selection"
  | "product_not_found"
  | "product_without_cost"
  | "supabase_rls_permission"
  | "fetch_config_error"
  | "fetch_products_error"
  | "fetch_art_models_error"
  | "fetch_services_error";

export class BudgetCalculationError extends Error {
  code: BudgetCalculationErrorCode;
  userMessage: string;
  technicalCause?: unknown;

  constructor(
    code: BudgetCalculationErrorCode,
    userMessage: string,
    technicalMessage?: string,
    technicalCause?: unknown
  ) {
    super(technicalMessage ?? userMessage);
    this.name = "BudgetCalculationError";
    this.code = code;
    this.userMessage = userMessage;
    this.technicalCause = technicalCause;
  }
}

export function isBudgetCalculationError(error: unknown): error is BudgetCalculationError {
  return error instanceof BudgetCalculationError;
}

type PublicSummary = {
  produto: string;
  quantidade: string;
  resumo: string;
};

type ConfigNumberKey =
  | "valor_dtf_cm2"
  | "valor_minimo_dtf"
  | "perda_material_percentual"
  | "valor_criacao_arte"
  | "valor_vetorizacao"
  | "valor_arte_pronta"
  | "frete_peca_padrao"
  | "frete_dtf_padrao"
  | "frete_cliente_padrao"
  | "margem_padrao"
  | "taxa_cartao_percentual"
  | "taxa_embalagem"
  | "taxa_urgencia";

type CalculationConfigRow = Partial<Record<ConfigNumberKey, number | string | null>> & {
  id?: string | null;
  updated_at?: string | null;
};

export type CalculationConfigSnapshot = Record<ConfigNumberKey, number> & {
  id: string | null;
  updated_at: string | null;
};

type ProductInput = {
  id: string;
  nome: string;
  categoria: string | null;
  tipo: string | null;
  tecido: string | null;
  tamanho: string | null;
  cor: string | null;
  custo: number | string | null;
};

type ArtModelInput = {
  id: string;
  nome: string;
  categoria: string | null;
  valor_extra: number | string | null;
};

type ServiceInput = {
  id: string;
  nome: string;
  valor: number | string | null;
};

export type BudgetStampCalculation = {
  local_estampa: string;
  largura_cm: number;
  altura_cm: number;
  area_cm2: number;
  valor_calculado: number;
};

export type BudgetCalculationResult = {
  answers: BudgetAnswers;
  produto: string;
  produtoId: string | null;
  arteModeloId: string | null;
  quantidade: string;
  quantidadeNumero: number;
  resumo: string;
  precoFinal: string;
  precoFinalNumero: number;
  custoPecas: number;
  custoDtf: number;
  custoArte: number;
  custoServicos: number;
  custoFrete: number;
  custoTotal: number;
  margemPercentual: number;
  lucro: number;
  areaTotalCm2: number;
  estampas: BudgetStampCalculation[];
  valoresConfigUsados: Record<string, unknown>;
};

const configNumberKeys: ConfigNumberKey[] = [
  "valor_dtf_cm2",
  "valor_minimo_dtf",
  "perda_material_percentual",
  "valor_criacao_arte",
  "valor_vetorizacao",
  "valor_arte_pronta",
  "frete_peca_padrao",
  "frete_dtf_padrao",
  "frete_cliente_padrao",
  "margem_padrao",
  "taxa_cartao_percentual",
  "taxa_embalagem",
  "taxa_urgencia"
];

const defaultConfig: CalculationConfigSnapshot = {
  id: null,
  updated_at: null,
  valor_dtf_cm2: 0,
  valor_minimo_dtf: 0,
  perda_material_percentual: 0,
  valor_criacao_arte: 0,
  valor_vetorizacao: 0,
  valor_arte_pronta: 0,
  frete_peca_padrao: 0,
  frete_dtf_padrao: 0,
  frete_cliente_padrao: 0,
  margem_padrao: 100,
  taxa_cartao_percentual: 0,
  taxa_embalagem: 0,
  taxa_urgencia: 0
};

function getTechnicalErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return String(error);
}

function isPermissionError(error: unknown) {
  const errorLike = error as { code?: unknown; message?: unknown; details?: unknown };
  const message = `${String(errorLike.message ?? "")} ${String(errorLike.details ?? "")}`.toLowerCase();

  return (
    errorLike.code === "42501" ||
    message.includes("permission denied") ||
    message.includes("row-level security") ||
    message.includes("rls")
  );
}

function buildFetchError(
  defaultCode: BudgetCalculationErrorCode,
  tableLabel: string,
  error: unknown
) {
  if (isPermissionError(error)) {
    return new BudgetCalculationError(
      "supabase_rls_permission",
      `Permissão/RLS bloqueando a leitura de ${tableLabel}. Rode supabase/fix_public_budget_rls.sql no Supabase.`,
      `Erro de permissão/RLS ao buscar ${tableLabel}: ${getTechnicalErrorMessage(error)}`,
      error
    );
  }

  return new BudgetCalculationError(
    defaultCode,
    `Erro ao buscar ${tableLabel}. Verifique o Supabase e tente novamente.`,
    `Erro ao buscar ${tableLabel}: ${getTechnicalErrorMessage(error)}`,
    error
  );
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(String(value).replace(",", ".")) || 0;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundMeasure(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeConfig(row: CalculationConfigRow | null): CalculationConfigSnapshot {
  const config = { ...defaultConfig };

  if (!row) return config;

  config.id = row.id ?? null;
  config.updated_at = row.updated_at ?? null;

  for (const key of configNumberKeys) {
    config[key] = toNumber(row[key]);
  }

  return config;
}

async function fetchCurrentConfig() {
  if (!supabase) {
    throw new BudgetCalculationError(
      "supabase_not_configured",
      "Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
      "Supabase client is null."
    );
  }

  const { data, error } = await supabase
    .from("configuracoes_calculo")
    .select([...configNumberKeys, "id", "updated_at"].join(","))
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw buildFetchError("fetch_config_error", "configurações de cálculo", error);
  }

  if (!data) {
    throw new BudgetCalculationError(
      "missing_calculation_config",
      "Configuração de cálculo não encontrada. Acesse /admin/configuracoes; se ela já existir, rode supabase/fix_public_budget_rls.sql.",
      "Nenhum registro encontrado em configuracoes_calculo."
    );
  }

  return normalizeConfig(data as CalculationConfigRow);
}

async function fetchActiveProducts() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("produtos")
    .select("id,nome,categoria,tipo,tecido,tamanho,cor,custo")
    .eq("ativo", true);

  if (error) {
    throw buildFetchError("fetch_products_error", "produtos ativos", error);
  }

  return (data ?? []) as ProductInput[];
}

async function fetchActiveArtModels() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("artes_modelos")
    .select("id,nome,categoria,valor_extra")
    .eq("ativo", true);

  if (error) {
    throw buildFetchError("fetch_art_models_error", "artes ativas", error);
  }

  return (data ?? []) as ArtModelInput[];
}

async function fetchActiveServices() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("servicos")
    .select("id,nome,valor")
    .eq("ativo", true);

  if (error) {
    throw buildFetchError("fetch_services_error", "serviços ativos", error);
  }

  return (data ?? []) as ServiceInput[];
}

function scoreProduct(product: ProductInput, answers: BudgetAnswers) {
  const productAnswer = normalizeText(answers.produto);
  const tecidoAnswer = normalizeText(answers.tecido);
  const tamanhoAnswer = normalizeText(answers.tamanho);
  const corAnswer = normalizeText(answers.cor);
  const faixaAnswer = normalizeText(answers.faixa);
  const searchableFields = [
    normalizeText(product.nome),
    normalizeText(product.categoria),
    normalizeText(product.tipo)
  ];

  let score = 0;

  for (const field of searchableFields) {
    if (!field) continue;
    if (field === productAnswer) score += 8;
    if (field.includes(productAnswer) || productAnswer.includes(field)) score += 4;
  }

  if (normalizeText(product.tecido) === tecidoAnswer) score += 2;
  if (normalizeText(product.tamanho) === tamanhoAnswer) score += 1;
  if (normalizeText(product.cor) === corAnswer) score += 1;
  if (normalizeText(product.tipo).includes(faixaAnswer) && faixaAnswer) score += 1;

  return score;
}

function findBestProduct(products: ProductInput[], answers: BudgetAnswers) {
  if (answers.produtoId) {
    const productById = products.find((product) => product.id === answers.produtoId);
    if (productById) return productById;
  }

  const rankedProducts = products
    .map((product) => ({ product, score: scoreProduct(product, answers) }))
    .sort((a, b) => b.score - a.score);

  return rankedProducts[0]?.score ? rankedProducts[0].product : null;
}

function findBestArtModel(artModels: ArtModelInput[], answers: BudgetAnswers) {
  if (answers.arteModeloId) {
    const artModelById = artModels.find((artModel) => artModel.id === answers.arteModeloId);
    if (artModelById) return artModelById;
  }

  const wantsGallery =
    ["sim", "quero ver opcoes"].includes(normalizeText(answers.galeriaArte)) ||
    answers.arteFluxo === "modelo_pronto";
  if (!wantsGallery) return null;

  const productAnswer = normalizeText(answers.produto);
  const rankedModels = artModels
    .map((artModel) => {
      const category = normalizeText(artModel.categoria);
      const name = normalizeText(artModel.nome);
      const score =
        category.includes(productAnswer) || productAnswer.includes(category) || name.includes(productAnswer)
          ? 2
          : 1;

      return { artModel, score };
    })
    .sort((a, b) => b.score - a.score);

  return rankedModels[0]?.artModel ?? null;
}

function parseMeasure(value: string | undefined, fallback: { width: number; height: number }) {
  const match = value?.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)/i);

  if (!match) return fallback;

  return {
    width: toNumber(match[1]),
    height: toNumber(match[2])
  };
}

function getStampInputs(answers: BudgetAnswers) {
  const stamps: Array<{
    enabled: boolean;
    local: string;
    measure?: string;
    fallback: { width: number; height: number };
  }> = [
    {
      enabled: answers.estampaFrente === "Sim",
      local: "Frente",
      measure: answers.medidaFrente,
      fallback: { width: 28, height: 35 }
    },
    {
      enabled: answers.estampaCostas === "Sim",
      local: "Costas",
      measure: answers.medidaCostas,
      fallback: { width: 30, height: 40 }
    },
    {
      enabled: answers.estampaManga === "Sim",
      local: "Manga",
      measure: answers.medidaManga,
      fallback: { width: 10, height: 12 }
    }
  ];

  return stamps.filter((stamp) => stamp.enabled);
}

function calculateArtCost(
  config: CalculationConfigSnapshot,
  answers: BudgetAnswers,
  artModel: ArtModelInput | null
) {
  const selectedArtCosts: Array<{ nome: string; valor: number }> = [];

  if (answers.criacaoArte === "Sim" || answers.arteFluxo === "criacao") {
    selectedArtCosts.push({ nome: "Criação de arte", valor: config.valor_criacao_arte });
  }

  if (answers.vetorizacao === "Sim" || answers.arteFluxo === "vetorizacao") {
    selectedArtCosts.push({ nome: "Vetorização", valor: config.valor_vetorizacao });
  }

  if (
    ["sim", "quero ver opcoes"].includes(normalizeText(answers.galeriaArte)) ||
    answers.arteFluxo === "modelo_pronto" ||
    answers.arteModeloId
  ) {
    selectedArtCosts.push({ nome: "Arte pronta", valor: config.valor_arte_pronta });
  }

  if (artModel) {
    selectedArtCosts.push({
      nome: `Modelo: ${artModel.nome}`,
      valor: toNumber(artModel.valor_extra)
    });
  }

  return {
    total: roundMoney(selectedArtCosts.reduce((sum, item) => sum + item.valor, 0)),
    itens: selectedArtCosts
  };
}

function getSelectedServices(services: ServiceInput[], answers: BudgetAnswers) {
  const rawSelection = answers.servicos ?? answers.servicosEscolhidos ?? "";
  const tokens = rawSelection
    .split(/[,;|]/)
    .map((token) => normalizeText(token))
    .filter(Boolean);

  if (!tokens.length) return [];

  return services
    .filter((service) => {
      const serviceName = normalizeText(service.nome);
      return tokens.some(
        (token) => token === service.id || serviceName === token || serviceName.includes(token)
      );
    })
    .map((service) => ({
      id: service.id,
      nome: service.nome,
      valor: toNumber(service.valor)
    }));
}

function wantsDelivery(answers: BudgetAnswers) {
  const delivery = normalizeText(answers.frete);
  return delivery === "sim" || delivery === "receber em casa";
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

export async function calculatePublicBudget(
  answers: BudgetAnswers,
  summary: PublicSummary
): Promise<BudgetCalculationResult> {
  const [config, products, artModels, services] = await Promise.all([
    fetchCurrentConfig(),
    fetchActiveProducts(),
    fetchActiveArtModels(),
    fetchActiveServices()
  ]);

  if (!answers.produto?.trim() && !answers.produtoId) {
    throw new BudgetCalculationError(
      "missing_product_selection",
      "Nenhum produto foi selecionado. Volte para a etapa Produto e escolha um item.",
      "answers.produto e answers.produtoId estão vazios."
    );
  }

  const selectedProduct = findBestProduct(products, answers);

  if (!selectedProduct) {
    throw new BudgetCalculationError(
      "product_not_found",
      "Produto não encontrado no cadastro ativo. Acesse /admin/produtos para cadastrar/ativar; se ele já existir, rode supabase/fix_public_budget_rls.sql.",
      `Produto solicitado: ${answers.produto || answers.produtoId || "não informado"}. Produtos ativos carregados: ${products.length}.`
    );
  }

  const selectedArtModel = findBestArtModel(artModels, answers);
  const selectedServices = getSelectedServices(services, answers);
  const custoServicosSelecionados = roundMoney(
    selectedServices.reduce((sum, service) => sum + service.valor, 0)
  );
  const quantidade = Math.max(1, Number.parseInt(answers.quantidade, 10) || 1);
  const custoUnitarioProduto = toNumber(selectedProduct?.custo);

  if (custoUnitarioProduto <= 0) {
    throw new BudgetCalculationError(
      "product_without_cost",
      "Produto sem custo cadastrado. Acesse /admin/produtos e informe um custo maior que zero.",
      `Produto ${selectedProduct.nome} (${selectedProduct.id}) possui custo inválido: ${String(selectedProduct.custo)}.`
    );
  }

  const custoPecas = roundMoney(custoUnitarioProduto * quantidade);
  const areaPerPieceStamps = getStampInputs(answers).map((stamp) => {
    const measure = parseMeasure(stamp.measure, stamp.fallback);
    const area = roundMeasure(measure.width * measure.height);

    return {
      local_estampa: stamp.local,
      largura_cm: roundMeasure(measure.width),
      altura_cm: roundMeasure(measure.height),
      area_cm2: area,
      valor_calculado: 0
    };
  });
  const areaTotalCm2 = roundMeasure(
    areaPerPieceStamps.reduce((sum, stamp) => sum + stamp.area_cm2, 0) * quantidade
  );
  const areaComPerda = roundMeasure(
    areaTotalCm2 * (1 + config.perda_material_percentual / 100)
  );
  const custoDtfBruto = areaComPerda * config.valor_dtf_cm2;
  const custoDtf = roundMoney(
    areaPerPieceStamps.length ? Math.max(custoDtfBruto, config.valor_minimo_dtf) : 0
  );
  const estampas = areaPerPieceStamps.map((stamp) => ({
    ...stamp,
    valor_calculado: roundMoney(
      custoDtf * (stamp.area_cm2 / Math.max(areaPerPieceStamps.reduce((sum, item) => sum + item.area_cm2, 0), 1))
    )
  }));
  const artCost = calculateArtCost(config, answers, selectedArtModel);
  const custoArte = artCost.total;
  const custoFrete = roundMoney(
    config.frete_dtf_padrao +
      config.frete_peca_padrao * quantidade +
      (wantsDelivery(answers) ? config.frete_cliente_padrao : 0)
  );
  const taxaUrgencia =
    answers.margemLucro === "Premium" || answers.prazo === "Urgente" ? config.taxa_urgencia : 0;
  const custoSemTaxaCartao = roundMoney(
    custoPecas +
      custoDtf +
      custoArte +
      custoServicosSelecionados +
      custoFrete +
      config.taxa_embalagem +
      taxaUrgencia
  );
  const precoComMargem = roundMoney(custoSemTaxaCartao * (1 + config.margem_padrao / 100));
  const taxaCartaoValor = roundMoney(precoComMargem * (config.taxa_cartao_percentual / 100));
  const precoVenda = roundMoney(precoComMargem + taxaCartaoValor);
  const custoServicos = roundMoney(
    custoServicosSelecionados + config.taxa_embalagem + taxaUrgencia + taxaCartaoValor
  );
  const custoTotal = roundMoney(custoPecas + custoDtf + custoArte + custoFrete + custoServicos);
  const lucro = roundMoney(precoVenda - custoTotal);
  const produtoSnapshot = selectedProduct
    ? {
        id: selectedProduct.id,
        nome: selectedProduct.nome,
        categoria: selectedProduct.categoria,
        tipo: selectedProduct.tipo,
        tecido: selectedProduct.tecido,
        tamanho: selectedProduct.tamanho,
        cor: selectedProduct.cor,
        custo: custoUnitarioProduto
      }
    : null;

  return {
    answers,
    produto: summary.produto,
    produtoId: selectedProduct?.id ?? null,
    arteModeloId: selectedArtModel?.id ?? null,
    quantidade: String(quantidade),
    quantidadeNumero: quantidade,
    resumo: summary.resumo,
    precoFinal: formatCurrency(precoVenda),
    precoFinalNumero: precoVenda,
    custoPecas,
    custoDtf,
    custoArte,
    custoServicos,
    custoFrete,
    custoTotal,
    margemPercentual: config.margem_padrao,
    lucro,
    areaTotalCm2,
    estampas,
    valoresConfigUsados: {
      origem: "chatbot_publico",
      versao_formula: "scriativa_calculo_v1",
      calculado_em: new Date().toISOString(),
      analise_manual: answers.analiseManual === "Sim" || answers.arteFluxo === "analise_manual",
      produto: summary.produto,
      produto_base: produtoSnapshot,
      arte_modelo: selectedArtModel
        ? {
            id: selectedArtModel.id,
            nome: selectedArtModel.nome,
            categoria: selectedArtModel.categoria,
            valor_extra: toNumber(selectedArtModel.valor_extra)
          }
        : null,
      configuracao: config,
      estampas,
      area_total_cm2: areaTotalCm2,
      area_com_perda_cm2: areaComPerda,
      arte: artCost.itens,
      servicos: selectedServices,
      entrega: {
        tipo: answers.frete ?? null,
        prazo: answers.prazo ?? null,
        endereco: wantsDelivery(answers)
          ? {
              cep: answers.enderecoCep ?? "",
              rua: answers.enderecoRua ?? "",
              numero: answers.enderecoNumero ?? "",
              bairro: answers.enderecoBairro ?? "",
              cidade: answers.enderecoCidade ?? "",
              estado: answers.enderecoEstado ?? "",
              complemento: answers.enderecoComplemento ?? "",
              referencia: answers.enderecoReferencia ?? "",
              completo: formatDeliveryAddress(answers)
            }
          : null
      },
      fretes: {
        frete_dtf_padrao: config.frete_dtf_padrao,
        frete_peca_padrao_total: roundMoney(config.frete_peca_padrao * quantidade),
        frete_cliente_padrao: wantsDelivery(answers) ? config.frete_cliente_padrao : 0
      },
      taxas: {
        embalagem: config.taxa_embalagem,
        urgencia: taxaUrgencia,
        cartao_percentual: config.taxa_cartao_percentual,
        cartao_valor: taxaCartaoValor
      },
      custos: {
        custo_pecas: custoPecas,
        custo_dtf: custoDtf,
        custo_arte: custoArte,
        custo_servicos: custoServicos,
        custo_frete: custoFrete,
        custo_total: custoTotal,
        margem_percentual: config.margem_padrao,
        preco_venda: precoVenda,
        lucro
      }
    }
  };
}

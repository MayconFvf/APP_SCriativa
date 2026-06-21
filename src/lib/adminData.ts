import { supabase } from "./supabase";

export type Provider = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  observacao: string | null;
  ativo: boolean | null;
  created_at: string;
};

export type Product = {
  id: string;
  nome: string;
  categoria: string | null;
  tipo: string | null;
  tecido: string | null;
  tamanho: string | null;
  cor: string | null;
  fornecedor_id: string | null;
  custo: number | null;
  ativo: boolean | null;
  created_at: string;
  fornecedores?: {
    nome: string | null;
  } | null;
};

export type Service = {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number | null;
  ativo: boolean | null;
  created_at: string;
};

export type ArtModel = {
  id: string;
  nome: string;
  categoria: string | null;
  descricao: string | null;
  imagem_url: string | null;
  valor_extra: number | null;
  ativo: boolean | null;
  created_at: string;
};

export type CalculationConfig = {
  id: string;
  valor_dtf_metro: number | null;
  valor_dtf_cm2: number | null;
  valor_minimo_dtf: number | null;
  perda_material_percentual: number | null;
  valor_criacao_arte: number | null;
  valor_vetorizacao: number | null;
  valor_ajuste_simples: number | null;
  valor_arte_pronta: number | null;
  frete_peca_padrao: number | null;
  frete_dtf_padrao: number | null;
  frete_cliente_padrao: number | null;
  margem_padrao: number | null;
  margem_minima: number | null;
  taxa_cartao_percentual: number | null;
  taxa_embalagem: number | null;
  taxa_urgencia: number | null;
  desconto_maximo_percentual: number | null;
  updated_at: string | null;
};

export type AdminOrderDetail = {
  id: string;
  created_at: string;
  quantidade: number;
  resumo_pedido: string | null;
  custo_pecas: number | null;
  custo_dtf: number | null;
  custo_arte: number | null;
  custo_servicos: number | null;
  custo_frete: number | null;
  custo_total: number | null;
  margem_percentual: number | null;
  preco_venda: number | null;
  lucro: number | null;
  status: string | null;
  solicitado: boolean | null;
  solicitado_em: string | null;
  valores_config_usados: {
    produto?: string;
    origem?: string;
  } | null;
  clientes: {
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
  } | null;
};

export function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number.isFinite(numericValue ?? 0) ? Number(numericValue ?? 0) : 0);
}

export function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(String(value).replace(",", ".")) || 0;
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  return supabase;
}

export async function listProviders() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("fornecedores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Provider[];
}

export async function saveProvider(payload: Partial<Provider>) {
  const client = requireSupabase();
  const { error } = await client.from("fornecedores").upsert(payload);
  if (error) throw error;
}

export async function listProducts() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("produtos")
    .select("*,fornecedores(nome)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function saveProduct(payload: Partial<Product>) {
  const client = requireSupabase();
  const productPayload = { ...payload };
  delete productPayload.fornecedores;

  const { error } = await client.from("produtos").upsert(productPayload);
  if (error) throw error;
}

export async function listServices() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("servicos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function saveService(payload: Partial<Service>) {
  const client = requireSupabase();
  const { error } = await client.from("servicos").upsert(payload);
  if (error) throw error;
}

export async function listArtModels() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("artes_modelos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ArtModel[];
}

export async function saveArtModel(payload: Partial<ArtModel>) {
  const client = requireSupabase();
  const { error } = await client.from("artes_modelos").upsert(payload);
  if (error) throw error;
}

export async function loadOrCreateCalculationConfig() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("configuracoes_calculo")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as CalculationConfig;

  const { data: created, error: createError } = await client
    .from("configuracoes_calculo")
    .insert({})
    .select("*")
    .single();

  if (createError) throw createError;
  return created as CalculationConfig;
}

export async function saveCalculationConfig(payload: Partial<CalculationConfig>) {
  const client = requireSupabase();
  const { error } = await client
    .from("configuracoes_calculo")
    .upsert({ ...payload, updated_at: new Date().toISOString() });

  if (error) throw error;
}

export async function listAdminOrders() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("orcamentos")
    .select(
      "id,created_at,quantidade,resumo_pedido,custo_pecas,custo_dtf,custo_arte,custo_servicos,custo_frete,custo_total,margem_percentual,preco_venda,lucro,status,solicitado,solicitado_em,valores_config_usados,clientes(nome,email,telefone)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminOrderDetail[];
}

export async function updateAdminOrderStatus(orderId: string, status: string) {
  const client = requireSupabase();
  const { error } = await client.from("orcamentos").update({ status }).eq("id", orderId);

  if (error) throw error;
}

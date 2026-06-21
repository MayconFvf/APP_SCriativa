import { supabase } from "./supabase";

export type CustomerOrder = {
  id: string;
  created_at: string;
  quantidade: number;
  resumo_pedido: string | null;
  preco_venda: number | null;
  status: string | null;
  solicitado: boolean | null;
  solicitado_em: string | null;
  produtos?: {
    nome?: string | null;
  } | null;
};

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value ?? 0);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export async function fetchCustomerOrders(authUserId?: string | null) {
  if (!supabase || !authUserId) return [];

  const { data, error } = await supabase
    .from("orcamentos")
    .select("id,created_at,quantidade,resumo_pedido,preco_venda,status,solicitado,solicitado_em,produtos(nome)")
    .eq("auth_user_id", authUserId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as CustomerOrder[];
}

export async function fetchAdminClients() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("clientes")
    .select("id,nome,email,telefone,auth_user_id,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchAdminOrders() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orcamentos")
    .select("id,created_at,quantidade,resumo_pedido,preco_venda,status,solicitado,solicitado_em,auth_user_id,cliente_id,valores_config_usados,clientes(nome,email)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!supabase) return;

  const { error } = await supabase
    .from("orcamentos")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

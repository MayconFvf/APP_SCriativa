import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Eye, RefreshCw, ShieldCheck } from "lucide-react";
import { PageIntro } from "../../components/ui/PageIntro";
import {
  type AdminOrderDetail,
  formatCurrency,
  formatDate,
  listAdminOrders,
  updateAdminOrderStatus
} from "../../lib/adminData";

const statusOptions = [
  { value: "novo", label: "Novo" },
  { value: "em_analise", label: "Em análise" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "finalizado", label: "Finalizado" }
];

function formatPercent(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}%`;
}

function productName(order: AdminOrderDetail) {
  return order.valores_config_usados?.produto ?? "Personalizado";
}

export function AdminBudgetListPage() {
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  async function loadOrders() {
    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const data = await listAdminOrders();
      setOrders(data);
      setSelectedOrderId((current) => current ?? data[0]?.id ?? null);
    } catch {
      setErrorMessage("Não foi possível carregar os orçamentos.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, status: string) {
    setMessage("");
    setErrorMessage("");
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order))
    );

    try {
      await updateAdminOrderStatus(orderId, status);
      setMessage("Status atualizado com sucesso.");
    } catch {
      setErrorMessage("Não foi possível atualizar o status.");
      void loadOrders();
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  return (
    <>
      <PageIntro
        eyebrow="Gestão"
        title="Orçamentos"
        description="Lista administrativa com todos os pedidos, status, valor final e custos internos."
      >
        <button className="btn-secondary" type="button" onClick={loadOrders}>
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </PageIntro>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="glass-panel p-4 sm:p-5">
          <div className="flex items-start gap-3 border-b border-white/10 pb-4 sm:items-center">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
              <ClipboardList size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-white sm:text-xl">Histórico de orçamentos</h2>
              <p className="text-sm font-bold text-white/[0.52]">
                Valores públicos na lista, custos internos no detalhe.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando orçamentos...</p>}
            {message && <p className="text-sm font-bold text-mint">{message}</p>}
            {errorMessage && <p className="text-sm font-bold text-coral">{errorMessage}</p>}
            {!isLoading && orders.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
                Nenhum orçamento encontrado.
              </p>
            )}

            {orders.map((order) => {
              const currentStatus = order.status ?? "novo";
              const options = statusOptions.some((status) => status.value === currentStatus)
                ? statusOptions
                : [{ value: currentStatus, label: currentStatus }, ...statusOptions];

              return (
                <article
                  key={order.id}
                  className={[
                    "rounded-lg border bg-black/20 p-4 transition",
                    selectedOrderId === order.id ? "border-aqua/50 shadow-neon" : "border-white/10"
                  ].join(" ")}
                >
                  <div className="grid gap-4 lg:grid-cols-[0.8fr_1.3fr_0.8fr_0.9fr_auto] lg:items-center">
                    <span className="text-sm font-bold text-white/[0.52]">
                      {formatDate(order.created_at)}
                    </span>
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-black text-white">
                        {order.clientes?.nome ?? "Cliente não vinculado"}
                      </span>
                      <span className="block break-words text-xs font-bold text-white/[0.45]">
                        {productName(order)} · {order.quantidade} un.
                      </span>
                    </span>
                    <span className="text-sm font-black text-white lg:text-right">
                      {formatCurrency(order.preco_venda)}
                    </span>
                    <select
                      className="field min-h-10 py-2"
                      value={currentStatus}
                      onChange={(event) => void handleStatusChange(order.id, event.target.value)}
                    >
                      {options.map((status) => (
                        <option key={status.value} value={status.value} className="bg-night text-white">
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-secondary min-h-10 w-full px-3 py-2 lg:w-auto"
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <Eye size={16} aria-hidden="true" />
                      Ver detalhes
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="glass-panel p-4 sm:p-5 xl:sticky xl:top-8 xl:self-start">
          <div className="flex items-start gap-3 border-b border-white/10 pb-4 sm:items-center">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-aqua to-violet text-white">
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-white sm:text-xl">Detalhe administrativo</h2>
              <p className="text-sm font-bold text-white/[0.52]">Área interna: custos, margem e lucro.</p>
            </div>
          </div>

          {!selectedOrder && (
            <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
              Selecione um orçamento para ver os detalhes internos.
            </p>
          )}

          {selectedOrder && (
            <div className="mt-5 grid gap-5">
              <section className="rounded-lg border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-black text-white">Cliente</h3>
                <div className="mt-3 grid gap-2 break-words text-sm font-bold text-white/[0.62]">
                  <span>Nome: {selectedOrder.clientes?.nome ?? "-"}</span>
                  <span>E-mail: {selectedOrder.clientes?.email ?? "-"}</span>
                  <span>Telefone: {selectedOrder.clientes?.telefone ?? "-"}</span>
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-black text-white">Pedido</h3>
                <div className="mt-3 grid gap-2 break-words text-sm font-bold text-white/[0.62]">
                  <span>Produto: {productName(selectedOrder)}</span>
                  <span>Quantidade: {selectedOrder.quantidade}</span>
                  <span>Status: {selectedOrder.status ?? "novo"}</span>
                  <span>Solicitado: {selectedOrder.solicitado ? "Sim" : "Não"}</span>
                </div>
                <p className="mt-4 break-words rounded-lg border border-white/10 bg-white/[0.05] p-3 text-sm leading-6 text-white/[0.66]">
                  {selectedOrder.resumo_pedido ?? "Resumo não informado."}
                </p>
              </section>

              <section className="rounded-lg border border-aqua/20 bg-aqua/[0.05] p-4">
                <h3 className="text-base font-black text-white">Custos internos</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoTile label="Custo peças" value={formatCurrency(selectedOrder.custo_pecas)} />
                  <InfoTile label="Custo DTF" value={formatCurrency(selectedOrder.custo_dtf)} />
                  <InfoTile label="Custo arte" value={formatCurrency(selectedOrder.custo_arte)} />
                  <InfoTile label="Serviços" value={formatCurrency(selectedOrder.custo_servicos)} />
                  <InfoTile label="Frete interno" value={formatCurrency(selectedOrder.custo_frete)} />
                  <InfoTile label="Custo total" value={formatCurrency(selectedOrder.custo_total)} />
                  <InfoTile label="Margem" value={formatPercent(selectedOrder.margem_percentual)} />
                  <InfoTile label="Lucro" value={formatCurrency(selectedOrder.lucro)} />
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-aqua">
                    Preço final
                  </span>
                  <strong className="mt-1 block break-words text-2xl font-black text-white">
                    {formatCurrency(selectedOrder.preco_venda)}
                  </strong>
                </div>
              </section>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
      <span className="block text-xs font-black uppercase tracking-[0.14em] text-white/[0.42]">
        {label}
      </span>
      <strong className="mt-1 block break-words text-base font-black text-white">{value}</strong>
    </div>
  );
}

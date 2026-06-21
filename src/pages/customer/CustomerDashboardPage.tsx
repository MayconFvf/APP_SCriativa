import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Clock3, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  type CustomerOrder,
  fetchCustomerOrders,
  formatCurrency,
  formatDate
} from "../../lib/customerOrders";

function getOrderProduct(order: CustomerOrder) {
  return order.produtos?.nome ?? "Personalizado";
}

export function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders(user?.id)
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const openOrders = useMemo(
    () => orders.filter((order) => !["finalizado", "cancelado"].includes(order.status ?? "")),
    [orders]
  );
  const lastOrder = orders[0];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total de pedidos", value: String(orders.length), icon: ClipboardList },
          { label: "Orçamentos em aberto", value: String(openOrders.length), icon: Clock3 },
          {
            label: "Último pedido",
            value: lastOrder ? formatCurrency(lastOrder.preco_venda) : "R$ 0,00",
            icon: PackageCheck
          }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="glass-panel p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-white/[0.58]">{card.label}</span>
                <Icon className="text-aqua" size={22} aria-hidden="true" />
              </div>
              <p className="mt-5 text-3xl font-black text-white">{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="neon-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Pedidos recentes</h2>
            <p className="mt-1 text-sm text-white/[0.55]">
              Status, resumo e valor final dos seus orçamentos.
            </p>
          </div>
          <Link className="btn-secondary w-full sm:w-auto" to="/cliente/pedidos">
            Ver todos
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando pedidos...</p>}
          {!isLoading && orders.length === 0 && (
            <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
              Nenhum pedido encontrado ainda.
            </p>
          )}
          {orders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[auto_1fr_auto_auto] md:items-center"
            >
              <span className="text-sm font-bold text-white/[0.52]">
                {formatDate(order.created_at)}
              </span>
              <span>
                <span className="block text-sm font-black text-white">{getOrderProduct(order)}</span>
                <span className="block text-xs font-bold text-white/[0.45]">
                  {order.quantidade} unidade(s)
                </span>
              </span>
              <span className="w-fit rounded-full border border-aqua/25 bg-aqua/10 px-3 py-1 text-xs font-black text-aqua">
                {order.status ?? "novo"}
              </span>
              <span className="text-sm font-black text-white md:text-right">
                {formatCurrency(order.preco_venda)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

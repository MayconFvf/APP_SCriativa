import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
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

export function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders(user?.id)
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  return (
    <section className="neon-card p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:items-center">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white shadow-neon">
          <ClipboardList size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-black text-white sm:text-2xl">Meus pedidos</h2>
          <p className="text-sm text-white/[0.55]">Acompanhe status, resumo e valor final.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando pedidos...</p>}
        {!isLoading && orders.length === 0 && (
          <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
            Nenhum orçamento vinculado à sua conta ainda.
          </p>
        )}

        {orders.map((order) => (
          <article key={order.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
              <span className="text-sm font-bold text-white/[0.52]">
                {formatDate(order.created_at)}
              </span>
              <span>
                <span className="block break-words text-base font-black text-white">{getOrderProduct(order)}</span>
                <span className="block text-sm font-bold text-white/[0.5]">
                  {order.quantidade} unidade(s)
                </span>
              </span>
              <span className="w-fit rounded-full border border-aqua/25 bg-aqua/10 px-3 py-1 text-xs font-black text-aqua">
                {order.status ?? "novo"}
              </span>
              <span className="text-base font-black text-white md:text-right">
                {formatCurrency(order.preco_venda)}
              </span>
            </div>
            <p className="mt-4 break-words border-t border-white/10 pt-4 text-sm leading-6 text-white/[0.62]">
              {order.resumo_pedido ?? "Resumo não informado."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

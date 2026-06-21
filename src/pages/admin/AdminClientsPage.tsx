import { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { PageIntro } from "../../components/ui/PageIntro";
import { fetchAdminClients, formatDate } from "../../lib/customerOrders";

type AdminClient = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  created_at: string;
};

export function AdminClientsPage() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadClients() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchAdminClients();
      setClients(data as AdminClient[]);
    } catch {
      setErrorMessage("Não foi possível carregar os clientes.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, []);

  return (
    <>
      <PageIntro
        eyebrow="Relacionamento"
        title="Clientes"
        description="Clientes cadastrados pelo fluxo público ou pela criação de conta."
      >
        <button className="btn-secondary" type="button" onClick={loadClients}>
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </PageIntro>

      <section className="glass-panel mt-8 p-4 sm:p-5">
        <div className="flex items-start gap-3 border-b border-white/10 pb-4 sm:items-center">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
            <Users size={22} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-black text-white sm:text-xl">Lista de clientes</h2>
        </div>

        <div className="mt-5 grid gap-3">
          {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando clientes...</p>}
          {errorMessage && <p className="text-sm font-bold text-coral">{errorMessage}</p>}
          {!isLoading && clients.length === 0 && (
            <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
              Nenhum cliente encontrado.
            </p>
          )}

          {clients.map((client) => (
            <article
              key={client.id}
              className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
            >
              <span className="break-words text-sm font-black text-white">{client.nome}</span>
              <span className="break-words text-sm font-bold text-white/[0.58]">{client.email ?? "-"}</span>
              <span className="break-words text-sm font-bold text-white/[0.58]">{client.telefone ?? "-"}</span>
              <span className="text-sm font-bold text-white/[0.45] md:text-right">{formatDate(client.created_at)}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

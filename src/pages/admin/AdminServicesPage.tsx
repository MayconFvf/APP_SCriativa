import { FormEvent, useEffect, useState } from "react";
import { Edit3, Plus, RefreshCw, Save, Wrench } from "lucide-react";
import { PageIntro } from "../../components/ui/PageIntro";
import {
  type Service,
  formatCurrency,
  listServices,
  saveService,
  toNumber
} from "../../lib/adminData";

type ServiceForm = {
  id?: string;
  nome: string;
  descricao: string;
  valor: string;
  ativo: boolean;
};

const emptyForm: ServiceForm = {
  nome: "",
  descricao: "",
  valor: "0",
  ativo: true
};

export function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadServices() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setServices(await listServices());
    } catch {
      setErrorMessage("Não foi possível carregar os serviços.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  function editService(service: Service) {
    setForm({
      id: service.id,
      nome: service.nome,
      descricao: service.descricao ?? "",
      valor: String(service.valor ?? 0),
      ativo: service.ativo ?? true
    });
    setMessage("");
    setErrorMessage("");
  }

  async function submitService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!form.nome.trim()) {
      setErrorMessage("Informe o nome do serviço.");
      return;
    }

    setIsSaving(true);

    try {
      await saveService({
        id: form.id,
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        valor: toNumber(form.valor),
        ativo: form.ativo
      });
      setMessage(form.id ? "Serviço atualizado com sucesso." : "Serviço criado com sucesso.");
      setForm(emptyForm);
      await loadServices();
    } catch {
      setErrorMessage("Não foi possível salvar o serviço.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleService(service: Service) {
    setMessage("");
    setErrorMessage("");

    try {
      await saveService({ ...service, ativo: !(service.ativo ?? true) });
      setMessage(service.ativo ? "Serviço inativado." : "Serviço reativado.");
      await loadServices();
    } catch {
      setErrorMessage("Não foi possível alterar o status do serviço.");
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Cadastros"
        title="Serviços"
        description="Serviços extras que compõem custos internos e orçamento."
      >
        <button className="btn-secondary" type="button" onClick={loadServices}>
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </PageIntro>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form className="glass-panel grid gap-4 p-5" onSubmit={submitService}>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
              <Plus size={21} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-black text-white">
              {form.id ? "Editar serviço" : "Novo serviço"}
            </h2>
          </div>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Nome
            <input className="field" value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} />
          </label>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Descrição
            <textarea
              className="field min-h-28 resize-y"
              value={form.descricao}
              onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Valor
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/[0.45]">
                R$
              </span>
              <input
                className="field pl-11"
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(event) => setForm((current) => ({ ...current, valor: event.target.value }))}
              />
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.72]">
            <input
              className="h-4 w-4 accent-magenta"
              type="checkbox"
              checked={form.ativo}
              onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))}
            />
            Ativo
          </label>

          {message && <p className="text-sm font-bold text-mint">{message}</p>}
          {errorMessage && <p className="text-sm font-bold text-coral">{errorMessage}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary w-full sm:w-auto" type="submit" disabled={isSaving}>
              <Save size={18} aria-hidden="true" />
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
            {form.id && (
              <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setForm(emptyForm)}>
                Novo cadastro
              </button>
            )}
          </div>
        </form>

        <section className="glass-panel p-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Wrench className="text-aqua" size={24} aria-hidden="true" />
            <h2 className="text-xl font-black text-white">Serviços cadastrados</h2>
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando...</p>}
            {!isLoading && services.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
                Nenhum serviço cadastrado.
              </p>
            )}
            {services.map((service) => (
              <article key={service.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-white">{service.nome}</h3>
                      <span className={service.ativo ? "text-xs font-black text-mint" : "text-xs font-black text-coral"}>
                        {service.ativo ? "ativo" : "inativo"}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm font-bold text-white/[0.55]">
                      {service.descricao ?? "Sem descrição"}
                    </p>
                    <p className="mt-1 text-sm font-black text-white">
                      Valor: {formatCurrency(service.valor)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => editService(service)}>
                      <Edit3 size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => void toggleService(service)}>
                      {service.ativo ? "Inativar" : "Ativar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}

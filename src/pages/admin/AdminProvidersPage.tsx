import { FormEvent, useEffect, useState } from "react";
import { Edit3, Plus, RefreshCw, Save, Truck } from "lucide-react";
import { PageIntro } from "../../components/ui/PageIntro";
import {
  type Provider,
  formatDate,
  listProviders,
  saveProvider
} from "../../lib/adminData";

type ProviderForm = {
  id?: string;
  nome: string;
  telefone: string;
  email: string;
  observacao: string;
  ativo: boolean;
};

const emptyForm: ProviderForm = {
  nome: "",
  telefone: "",
  email: "",
  observacao: "",
  ativo: true
};

export function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState<ProviderForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProviders() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setProviders(await listProviders());
    } catch {
      setErrorMessage("Não foi possível carregar os fornecedores.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProviders();
  }, []);

  function editProvider(provider: Provider) {
    setForm({
      id: provider.id,
      nome: provider.nome,
      telefone: provider.telefone ?? "",
      email: provider.email ?? "",
      observacao: provider.observacao ?? "",
      ativo: provider.ativo ?? true
    });
    setMessage("");
    setErrorMessage("");
  }

  async function submitProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!form.nome.trim()) {
      setErrorMessage("Informe o nome do fornecedor.");
      return;
    }

    setIsSaving(true);

    try {
      await saveProvider({
        id: form.id,
        nome: form.nome.trim(),
        telefone: form.telefone.trim() || null,
        email: form.email.trim() || null,
        observacao: form.observacao.trim() || null,
        ativo: form.ativo
      });
      setMessage(form.id ? "Fornecedor atualizado com sucesso." : "Fornecedor criado com sucesso.");
      setForm(emptyForm);
      await loadProviders();
    } catch {
      setErrorMessage("Não foi possível salvar o fornecedor.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleProvider(provider: Provider) {
    setMessage("");
    setErrorMessage("");

    try {
      await saveProvider({ ...provider, ativo: !(provider.ativo ?? true) });
      setMessage(provider.ativo ? "Fornecedor inativado." : "Fornecedor reativado.");
      await loadProviders();
    } catch {
      setErrorMessage("Não foi possível alterar o status do fornecedor.");
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Cadastros"
        title="Fornecedores"
        description="Fornecedores de peças, insumos, impressão e acabamento."
      >
        <button className="btn-secondary" type="button" onClick={loadProviders}>
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </PageIntro>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form className="glass-panel grid gap-4 p-5" onSubmit={submitProvider}>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
              <Plus size={21} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-black text-white">
              {form.id ? "Editar fornecedor" : "Novo fornecedor"}
            </h2>
          </div>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Nome
            <input
              className="field"
              value={form.nome}
              onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-white/70">
              Telefone
              <input
                className="field"
                value={form.telefone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, telefone: event.target.value }))
                }
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/70">
              E-mail
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Observação
            <textarea
              className="field min-h-28 resize-y"
              value={form.observacao}
              onChange={(event) =>
                setForm((current) => ({ ...current, observacao: event.target.value }))
              }
            />
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
            <Truck className="text-aqua" size={24} aria-hidden="true" />
            <h2 className="text-xl font-black text-white">Fornecedores cadastrados</h2>
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando...</p>}
            {!isLoading && providers.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
                Nenhum fornecedor cadastrado.
              </p>
            )}
            {providers.map((provider) => (
              <article key={provider.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-white">{provider.nome}</h3>
                      <span className={provider.ativo ? "text-xs font-black text-mint" : "text-xs font-black text-coral"}>
                        {provider.ativo ? "ativo" : "inativo"}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm font-bold text-white/[0.55]">
                      {provider.email ?? "-"} · {provider.telefone ?? "-"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-white/[0.38]">
                      Criado em {formatDate(provider.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => editProvider(provider)}>
                      <Edit3 size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => void toggleProvider(provider)}>
                      {provider.ativo ? "Inativar" : "Ativar"}
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

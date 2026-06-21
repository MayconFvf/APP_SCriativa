import { FormEvent, useEffect, useState } from "react";
import { Edit3, Palette, Plus, RefreshCw, Save } from "lucide-react";
import { PageIntro } from "../../components/ui/PageIntro";
import {
  type ArtModel,
  formatCurrency,
  listArtModels,
  saveArtModel,
  toNumber
} from "../../lib/adminData";

type ArtForm = {
  id?: string;
  nome: string;
  categoria: string;
  descricao: string;
  imagem_url: string;
  valor_extra: string;
  ativo: boolean;
};

const emptyForm: ArtForm = {
  nome: "",
  categoria: "",
  descricao: "",
  imagem_url: "",
  valor_extra: "0",
  ativo: true
};

export function AdminArtPage() {
  const [arts, setArts] = useState<ArtModel[]>([]);
  const [form, setForm] = useState<ArtForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadArts() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setArts(await listArtModels());
    } catch {
      setErrorMessage("Não foi possível carregar as artes prontas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadArts();
  }, []);

  function editArt(art: ArtModel) {
    setForm({
      id: art.id,
      nome: art.nome,
      categoria: art.categoria ?? "",
      descricao: art.descricao ?? "",
      imagem_url: art.imagem_url ?? "",
      valor_extra: String(art.valor_extra ?? 0),
      ativo: art.ativo ?? true
    });
    setMessage("");
    setErrorMessage("");
  }

  async function submitArt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!form.nome.trim()) {
      setErrorMessage("Informe o nome da arte.");
      return;
    }

    setIsSaving(true);

    try {
      await saveArtModel({
        id: form.id,
        nome: form.nome.trim(),
        categoria: form.categoria.trim() || null,
        descricao: form.descricao.trim() || null,
        imagem_url: form.imagem_url.trim() || null,
        valor_extra: toNumber(form.valor_extra),
        ativo: form.ativo
      });
      setMessage(form.id ? "Arte atualizada com sucesso." : "Arte criada com sucesso.");
      setForm(emptyForm);
      await loadArts();
    } catch {
      setErrorMessage("Não foi possível salvar a arte.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleArt(art: ArtModel) {
    setMessage("");
    setErrorMessage("");

    try {
      await saveArtModel({ ...art, ativo: !(art.ativo ?? true) });
      setMessage(art.ativo ? "Arte inativada." : "Arte reativada.");
      await loadArts();
    } catch {
      setErrorMessage("Não foi possível alterar o status da arte.");
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Biblioteca"
        title="Artes prontas"
        description="Modelos e referências visuais com link de imagem manual."
      >
        <button className="btn-secondary" type="button" onClick={loadArts}>
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </PageIntro>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form className="glass-panel grid gap-4 p-5" onSubmit={submitArt}>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
              <Plus size={21} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-black text-white">
              {form.id ? "Editar arte" : "Nova arte"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-white/70">
              Nome
              <input className="field" value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/70">
              Categoria
              <input className="field" value={form.categoria} onChange={(event) => setForm((current) => ({ ...current, categoria: event.target.value }))} />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Descrição
            <textarea className="field min-h-28 resize-y" value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} />
          </label>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Imagem URL
            <input className="field" value={form.imagem_url} onChange={(event) => setForm((current) => ({ ...current, imagem_url: event.target.value }))} />
          </label>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Valor extra
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/[0.45]">
                R$
              </span>
              <input className="field pl-11" type="number" step="0.01" value={form.valor_extra} onChange={(event) => setForm((current) => ({ ...current, valor_extra: event.target.value }))} />
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.72]">
            <input className="h-4 w-4 accent-magenta" type="checkbox" checked={form.ativo} onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))} />
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
            <Palette className="text-aqua" size={24} aria-hidden="true" />
            <h2 className="text-xl font-black text-white">Artes cadastradas</h2>
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando...</p>}
            {!isLoading && arts.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
                Nenhuma arte cadastrada.
              </p>
            )}
            {arts.map((art) => (
              <article key={art.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-white">{art.nome}</h3>
                      <span className={art.ativo ? "text-xs font-black text-mint" : "text-xs font-black text-coral"}>
                        {art.ativo ? "ativo" : "inativo"}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm font-bold text-white/[0.55]">
                      {art.categoria ?? "Sem categoria"} · {formatCurrency(art.valor_extra)}
                    </p>
                    {art.imagem_url && (
                      <a className="mt-1 block break-all text-xs font-bold text-aqua" href={art.imagem_url} target="_blank" rel="noreferrer">
                        {art.imagem_url}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => editArt(art)}>
                      <Edit3 size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => void toggleArt(art)}>
                      {art.ativo ? "Inativar" : "Ativar"}
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

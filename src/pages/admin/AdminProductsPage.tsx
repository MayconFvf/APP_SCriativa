import { FormEvent, useEffect, useState } from "react";
import { Edit3, Package, Plus, RefreshCw, Save } from "lucide-react";
import { PageIntro } from "../../components/ui/PageIntro";
import {
  type Product,
  type Provider,
  formatCurrency,
  listProducts,
  listProviders,
  saveProduct,
  toNumber
} from "../../lib/adminData";

type ProductForm = {
  id?: string;
  nome: string;
  categoria: string;
  tipo: string;
  tecido: string;
  tamanho: string;
  cor: string;
  fornecedor_id: string;
  custo: string;
  ativo: boolean;
};

const emptyForm: ProductForm = {
  nome: "",
  categoria: "",
  tipo: "",
  tecido: "",
  tamanho: "",
  cor: "",
  fornecedor_id: "",
  custo: "0",
  ativo: true
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [loadedProducts, loadedProviders] = await Promise.all([
        listProducts(),
        listProviders()
      ]);
      setProducts(loadedProducts);
      setProviders(loadedProviders);
    } catch {
      setErrorMessage("Não foi possível carregar os produtos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function editProduct(product: Product) {
    setForm({
      id: product.id,
      nome: product.nome,
      categoria: product.categoria ?? "",
      tipo: product.tipo ?? "",
      tecido: product.tecido ?? "",
      tamanho: product.tamanho ?? "",
      cor: product.cor ?? "",
      fornecedor_id: product.fornecedor_id ?? "",
      custo: String(product.custo ?? 0),
      ativo: product.ativo ?? true
    });
    setMessage("");
    setErrorMessage("");
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!form.nome.trim()) {
      setErrorMessage("Informe o nome do produto.");
      return;
    }

    setIsSaving(true);

    try {
      await saveProduct({
        id: form.id,
        nome: form.nome.trim(),
        categoria: form.categoria.trim() || null,
        tipo: form.tipo.trim() || null,
        tecido: form.tecido.trim() || null,
        tamanho: form.tamanho.trim() || null,
        cor: form.cor.trim() || null,
        fornecedor_id: form.fornecedor_id || null,
        custo: toNumber(form.custo),
        ativo: form.ativo
      });
      setMessage(form.id ? "Produto atualizado com sucesso." : "Produto criado com sucesso.");
      setForm(emptyForm);
      await loadData();
    } catch {
      setErrorMessage("Não foi possível salvar o produto.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleProduct(product: Product) {
    setMessage("");
    setErrorMessage("");

    try {
      await saveProduct({ ...product, ativo: !(product.ativo ?? true) });
      setMessage(product.ativo ? "Produto inativado." : "Produto reativado.");
      await loadData();
    } catch {
      setErrorMessage("Não foi possível alterar o status do produto.");
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Cadastros"
        title="Produtos"
        description="Catálogo de produtos personalizados com fornecedor e custo interno."
      >
        <button className="btn-secondary" type="button" onClick={loadData}>
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </PageIntro>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="glass-panel grid gap-4 p-5" onSubmit={submitProduct}>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
              <Plus size={21} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-black text-white">
              {form.id ? "Editar produto" : "Novo produto"}
            </h2>
          </div>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Nome
            <input className="field" value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["categoria", "Categoria"],
              ["tipo", "Tipo"],
              ["tecido", "Tecido"],
              ["tamanho", "Tamanho"],
              ["cor", "Cor"]
            ].map(([key, label]) => (
              <label key={key} className="grid gap-2 text-sm font-bold text-white/70">
                {label}
                <input
                  className="field"
                  value={form[key as keyof ProductForm] as string}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
              </label>
            ))}
            <label className="grid gap-2 text-sm font-bold text-white/70">
              Custo
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/[0.45]">
                  R$
                </span>
                <input
                  className="field pl-11"
                  type="number"
                  step="0.01"
                  value={form.custo}
                  onChange={(event) => setForm((current) => ({ ...current, custo: event.target.value }))}
                />
              </div>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-white/70">
            Fornecedor
            <select
              className="field"
              value={form.fornecedor_id}
              onChange={(event) => setForm((current) => ({ ...current, fornecedor_id: event.target.value }))}
            >
              <option className="bg-night text-white" value="">
                Sem fornecedor
              </option>
              {providers.map((provider) => (
                <option key={provider.id} className="bg-night text-white" value={provider.id}>
                  {provider.nome}
                </option>
              ))}
            </select>
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
            <Package className="text-aqua" size={24} aria-hidden="true" />
            <h2 className="text-xl font-black text-white">Produtos cadastrados</h2>
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading && <p className="text-sm font-bold text-white/[0.58]">Carregando...</p>}
            {!isLoading && products.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.58]">
                Nenhum produto cadastrado.
              </p>
            )}
            {products.map((product) => (
              <article key={product.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-white">{product.nome}</h3>
                      <span className={product.ativo ? "text-xs font-black text-mint" : "text-xs font-black text-coral"}>
                        {product.ativo ? "ativo" : "inativo"}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm font-bold text-white/[0.55]">
                      {product.categoria ?? "Sem categoria"} · {product.fornecedores?.nome ?? "Sem fornecedor"}
                    </p>
                    <p className="mt-1 text-sm font-black text-white">
                      Custo: {formatCurrency(product.custo)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => editProduct(product)}>
                      <Edit3 size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button className="btn-secondary min-h-10 w-full px-3 py-2 sm:w-auto" type="button" onClick={() => void toggleProduct(product)}>
                      {product.ativo ? "Inativar" : "Ativar"}
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

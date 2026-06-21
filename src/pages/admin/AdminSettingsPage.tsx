import { FormEvent, useEffect, useState } from "react";
import { RefreshCw, Save, Settings } from "lucide-react";
import { PageIntro } from "../../components/ui/PageIntro";
import {
  type CalculationConfig,
  formatDate,
  loadOrCreateCalculationConfig,
  saveCalculationConfig,
  toNumber
} from "../../lib/adminData";

type ConfigFieldKey = Exclude<keyof CalculationConfig, "id" | "updated_at">;

type ConfigField = {
  key: ConfigFieldKey;
  label: string;
  suffix?: string;
  step?: string;
};

const configSections: Array<{
  title: string;
  description: string;
  fields: ConfigField[];
}> = [
  {
    title: "DTF e material",
    description: "Valores base para estampa, perdas e pedido mínimo.",
    fields: [
      { key: "valor_dtf_metro", label: "Valor DTF por metro", step: "0.01" },
      { key: "valor_dtf_cm2", label: "Valor DTF por cm²", step: "0.0001" },
      { key: "valor_minimo_dtf", label: "Valor mínimo DTF", step: "0.01" },
      { key: "perda_material_percentual", label: "Perda de material", suffix: "%", step: "0.01" }
    ]
  },
  {
    title: "Arte e acabamento",
    description: "Custos extras aplicados quando o pedido pede criação ou ajuste.",
    fields: [
      { key: "valor_criacao_arte", label: "Criação de arte", step: "0.01" },
      { key: "valor_vetorizacao", label: "Vetorização", step: "0.01" },
      { key: "valor_ajuste_simples", label: "Ajuste simples", step: "0.01" },
      { key: "valor_arte_pronta", label: "Arte pronta", step: "0.01" }
    ]
  },
  {
    title: "Fretes e taxas",
    description: "Padrões usados como base nos próximos cálculos do sistema.",
    fields: [
      { key: "frete_peca_padrao", label: "Frete peça padrão", step: "0.01" },
      { key: "frete_dtf_padrao", label: "Frete DTF padrão", step: "0.01" },
      { key: "frete_cliente_padrao", label: "Frete cliente padrão", step: "0.01" },
      { key: "taxa_cartao_percentual", label: "Taxa cartão", suffix: "%", step: "0.01" },
      { key: "taxa_embalagem", label: "Taxa embalagem", step: "0.01" },
      { key: "taxa_urgencia", label: "Taxa urgência", step: "0.01" }
    ]
  },
  {
    title: "Margens e descontos",
    description: "Limites comerciais que protegem a margem da SCRIATIVA.",
    fields: [
      { key: "margem_padrao", label: "Margem padrão", suffix: "%", step: "0.01" },
      { key: "margem_minima", label: "Margem mínima", suffix: "%", step: "0.01" },
      { key: "desconto_maximo_percentual", label: "Desconto máximo", suffix: "%", step: "0.01" }
    ]
  }
];

const fieldKeys = configSections.flatMap((section) =>
  section.fields.map((field) => field.key)
);

const emptyForm: Record<ConfigFieldKey, string> = {
  valor_dtf_metro: "0",
  valor_dtf_cm2: "0",
  valor_minimo_dtf: "0",
  perda_material_percentual: "0",
  valor_criacao_arte: "0",
  valor_vetorizacao: "0",
  valor_ajuste_simples: "0",
  valor_arte_pronta: "0",
  frete_peca_padrao: "0",
  frete_dtf_padrao: "0",
  frete_cliente_padrao: "0",
  margem_padrao: "100",
  margem_minima: "30",
  taxa_cartao_percentual: "0",
  taxa_embalagem: "0",
  taxa_urgencia: "0",
  desconto_maximo_percentual: "0"
};

function configToForm(config: CalculationConfig) {
  const nextForm = { ...emptyForm };

  for (const key of fieldKeys) {
    nextForm[key] = String(config[key] ?? emptyForm[key]);
  }

  return nextForm;
}

export function AdminSettingsPage() {
  const [configId, setConfigId] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadSettings() {
    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const config = await loadOrCreateCalculationConfig();
      setConfigId(config.id);
      setUpdatedAt(config.updated_at);
      setForm(configToForm(config));
    } catch {
      setErrorMessage("Não foi possível carregar as configurações de cálculo.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function updateField(key: ConfigFieldKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!configId) {
      setErrorMessage("Configuração ainda não carregada. Atualize a página e tente novamente.");
      return;
    }

    const values = fieldKeys.reduce(
      (accumulator, key) => ({ ...accumulator, [key]: toNumber(form[key]) }),
      {} as Record<ConfigFieldKey, number>
    );

    setIsSaving(true);

    try {
      await saveCalculationConfig({ id: configId, ...values });
      setMessage("Configurações salvas com sucesso.");
      await loadSettings();
    } catch {
      setErrorMessage("Não foi possível salvar as configurações.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Regras"
        title="Configurações de cálculo"
        description="Base única para DTF, arte, fretes, taxas, margens e descontos dos próximos orçamentos."
      >
        <button className="btn-secondary" type="button" onClick={loadSettings}>
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </PageIntro>

      <section className="glass-panel mt-8 p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white">
              <Settings size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white">Parâmetros ativos</h2>
              <p className="text-sm font-bold text-white/[0.52]">
                {updatedAt ? `Última atualização: ${formatDate(updatedAt)}` : "Primeira configuração"}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-5 text-sm font-bold text-white/[0.58]">Carregando configurações...</p>
        ) : (
          <form className="mt-5 grid gap-5" onSubmit={submitSettings}>
            {configSections.map((section) => (
              <section key={section.title} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div>
                  <h3 className="text-base font-black text-white">{section.title}</h3>
                  <p className="mt-1 break-words text-sm font-bold text-white/[0.52]">{section.description}</p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.fields.map((field) => (
                    <label key={field.key} className="grid gap-2 text-sm font-bold text-white/70">
                      {field.label}
                      <div className="relative">
                        {!field.suffix && (
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/[0.45]">
                            R$
                          </span>
                        )}
                        <input
                          className={field.suffix ? "field pr-11" : "field pl-11"}
                          type="number"
                          step={field.step ?? "0.01"}
                          value={form[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value)}
                        />
                        {field.suffix && (
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/[0.45]">
                            {field.suffix}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            ))}

            {message && <p className="text-sm font-bold text-mint">{message}</p>}
            {errorMessage && <p className="text-sm font-bold text-coral">{errorMessage}</p>}

            <div className="flex justify-end">
              <button className="btn-primary w-full sm:w-auto" type="submit" disabled={isSaving}>
                <Save size={18} aria-hidden="true" />
                {isSaving ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}

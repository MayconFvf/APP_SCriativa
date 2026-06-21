export type ViaCepAddress = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export function onlyCepDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value: string) {
  const digits = onlyCepDigits(value);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress | null> {
  const digits = onlyCepDigits(cep);
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (!response.ok) {
    throw new Error("ViaCEP indisponível.");
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
    return null;
  }

  return {
    rua: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    estado: data.uf ?? ""
  };
}

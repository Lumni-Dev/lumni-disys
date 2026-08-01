// Estados e municípios do Brasil via API pública do IBGE.

export type UF = { sigla: string; nome: string };

const BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function fetchCountries(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/paises`);
    if (!res.ok) return [];
    const data = (await res.json()) as { nome: string }[];
    return data
      .map((c) => c.nome)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  } catch {
    return [];
  }
}

export async function fetchStates(): Promise<UF[]> {
  try {
    const res = await fetch(`${BASE}/estados?orderBy=nome`);
    if (!res.ok) return [];
    const data = (await res.json()) as UF[];
    return data.map((s) => ({ sigla: s.sigla, nome: s.nome }));
  } catch {
    return [];
  }
}

export async function fetchCities(uf: string): Promise<string[]> {
  if (!uf) return [];
  try {
    const res = await fetch(`${BASE}/estados/${uf}/municipios`);
    if (!res.ok) return [];
    const data = (await res.json()) as { nome: string }[];
    return data.map((c) => c.nome);
  } catch {
    return [];
  }
}

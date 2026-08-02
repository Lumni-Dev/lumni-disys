// Consulta publica de CNPJ via BrasilAPI (dados da Receita Federal).
// Sem chave e com CORS liberado, entao da para chamar direto do navegador.

export type CnpjInfo = {
  name: string;
  uf: string;
  city: string;
};

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Compara nomes de municipio ignorando acentos e caixa (Receita x IBGE). */
export const sameCity = (a: string, b: string) => fold(a) === fold(b);

/** Dados do CNPJ, ou null quando invalido, nao encontrado ou offline. */
export async function fetchCnpj(cnpj: string): Promise<CnpjInfo | null> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      razao_social?: string;
      nome_fantasia?: string;
      uf?: string;
      municipio?: string;
    };
    return {
      // Nome fantasia quando existe; senao a razao social.
      name: (data.nome_fantasia || data.razao_social || "").trim(),
      uf: (data.uf || "").trim().toUpperCase(),
      city: (data.municipio || "").trim(),
    };
  } catch {
    return null;
  }
}

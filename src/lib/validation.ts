// Validações de formulário reutilizáveis (lógica real, sem depender de `required`).

const digits = (value: string) => value.replace(/\D/g, "");

export function isBlank(value: string): boolean {
  return value.trim() === "";
}

export function isEmail(value: string): boolean {
  const v = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 200;
}

export function isUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isCnpj(value: string): boolean {
  return digits(value).length === 14;
}

export function isPhone(value: string): boolean {
  // Número internacional (E.164): código do país + número, 10 a 15 dígitos.
  const n = digits(value).length;
  return n >= 10 && n <= 15;
}

// Números inteiros positivos (campos de contagem).
export function isCount(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

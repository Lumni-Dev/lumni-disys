export type ThemeKey =
  | "white"
  | "red"
  | "orange"
  | "emerald"
  | "blue"
  | "violet"
  | "pink";

export type Theme = {
  key: ThemeKey;
  label: string;
  color: string;

  fg: string;
};

export const THEMES: Theme[] = [
  { key: "white", label: "Branco", color: "#f2f2f2", fg: "#000000" },
  { key: "red", label: "Vermelho", color: "#ef4444", fg: "#ffffff" },
  { key: "orange", label: "Laranja", color: "#f97316", fg: "#ffffff" },
  { key: "emerald", label: "Esmeralda", color: "#10b981", fg: "#ffffff" },
  { key: "blue", label: "Azul", color: "#3b82f6", fg: "#ffffff" },
  { key: "violet", label: "Violeta", color: "#8b5cf6", fg: "#ffffff" },
  { key: "pink", label: "Rosa", color: "#ec4899", fg: "#ffffff" },
];

export const DEFAULT_THEME: ThemeKey = "white";

export function theme(key: string): Theme {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
}

export const ACTIVE = "bg-accent text-accent-foreground";

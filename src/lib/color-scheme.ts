"use client";

import { useSyncExternalStore } from "react";

export const COLOR_SCHEME_KEY = "disys-theme";

export type ColorScheme = "light" | "dark";

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): ColorScheme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerSnapshot(): ColorScheme {
  return "light";
}

function apply(scheme: ColorScheme): void {
  document.documentElement.setAttribute("data-theme", scheme);
  try {
    window.localStorage.setItem(COLOR_SCHEME_KEY, scheme);
  } catch {

  }

  listeners.forEach((l) => l());
}

export function useColorScheme() {
  const scheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    scheme,
    setScheme: apply,
    toggle: () => apply(scheme === "dark" ? "light" : "dark"),
  };
}

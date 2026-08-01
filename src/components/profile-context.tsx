"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api-client";
import { DEFAULT_THEME, theme as themeOf, type ThemeKey } from "@/lib/themes";

type Ctx = {
  photo: string | null;
  setPhoto: (photo: string | null) => void;
  theme: ThemeKey;
  // Aplica o tema na hora (preview), sem persistir.
  setTheme: (theme: ThemeKey) => void;
  // Persiste o tema atual no banco.
  saveTheme: (theme: ThemeKey) => Promise<void>;
};

const ProfileContext = createContext<Ctx>({
  photo: null,
  setPhoto: () => {},
  theme: DEFAULT_THEME,
  setTheme: () => {},
  saveTheme: async () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

function applyAccent(key: ThemeKey) {
  if (typeof document !== "undefined") {
    const t = themeOf(key);
    const root = document.documentElement.style;
    root.setProperty("--accent", t.color);
    root.setProperty("--accent-foreground", t.fg);
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_THEME);

  useEffect(() => {
    api
      .get<{ photo: string | null; theme: ThemeKey }>("/api/profile")
      .then((d) => {
        setPhoto(d.photo);
        if (d.theme) {
          setThemeState(d.theme);
          applyAccent(d.theme);
        }
      })
      .catch(() => {});
  }, []);

  const setTheme = (t: ThemeKey) => {
    setThemeState(t);
    applyAccent(t);
  };

  const saveTheme = async (t: ThemeKey) => {
    setTheme(t);
    await api.put("/api/profile", { theme: t });
  };

  return (
    <ProfileContext.Provider
      value={{ photo, setPhoto, theme, setTheme, saveTheme }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

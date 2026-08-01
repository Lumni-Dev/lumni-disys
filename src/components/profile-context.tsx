"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api-client";

type Ctx = {
  photo: string | null;
  setPhoto: (photo: string | null) => void;
};

const ProfileContext = createContext<Ctx>({
  photo: null,
  setPhoto: () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ photo: string | null }>("/api/profile")
      .then((d) => setPhoto(d.photo))
      .catch(() => {});
  }, []);

  return (
    <ProfileContext.Provider value={{ photo, setPhoto }}>
      {children}
    </ProfileContext.Provider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export type Access = {
  token: string;
  owner: boolean;
  modules: string[];

  noWorkspace?: boolean;
};

let cached: Promise<Access> | null = null;

export function fetchAccess(): Promise<Access> {
  cached ??= api.get<Access>("/api/account").catch((err) => {

    cached = null;
    throw err;
  });
  return cached;
}

export function useAccess(): Access | null {
  const [access, setAccess] = useState<Access | null>(null);
  useEffect(() => {
    let alive = true;
    fetchAccess()
      .then((a) => {
        if (alive) setAccess(a);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return access;
}

export type Workspace = {
  id: number;
  name: string;
  owner: boolean;
  ownerEmail: string;
  ownerName: string;
  active: boolean;
  jobCount: number;
};

let wsCached: Promise<Workspace[]> | null = null;

const wsListeners = new Set<() => void>();

export function fetchWorkspaces(): Promise<Workspace[]> {
  wsCached ??= api.get<Workspace[]>("/api/workspaces").catch((err) => {
    wsCached = null;
    throw err;
  });
  return wsCached;
}

export function invalidateWorkspaces(): Promise<Workspace[]> {
  wsCached = null;
  const p = fetchWorkspaces();
  p.then(() => wsListeners.forEach((l) => l())).catch(() => {});
  return p;
}

export function useWorkspaces(): Workspace[] | null {
  const [list, setList] = useState<Workspace[] | null>(null);
  useEffect(() => {
    let alive = true;
    const sync = () =>
      fetchWorkspaces()
        .then((w) => {
          if (alive) setList(w);
        })
        .catch(() => {});

    wsListeners.add(sync);
    sync();
    return () => {
      alive = false;
      wsListeners.delete(sync);
    };
  }, []);
  return list;
}

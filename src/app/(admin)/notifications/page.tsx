"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { api } from "@/lib/api-client";

const PAGE_SIZE = 8;

type Notification = {
  id: number;
  title: string;
  description: string;
  read: boolean;
  time: string;
};

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get<Notification[]>("/api/notifications")
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? list.filter((n) =>
        [n.title, n.description].some((v) => v.toLowerCase().includes(q)),
      )
    : list;

  const unread = list.filter((n) => !n.read).length;
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(1, pageCount));
  const start = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function search(v: string) {
    setQuery(v);
    setPage(1);
  }

  return (
    <PageShell
      searchPlaceholder="Buscar notificações..."
      searchValue={query}
      onSearchChange={search}
    >
      <Card>
        <CardHeader
          title="Todas as notificações"
          subtitle={`${unread} não lidas`}
        />
        <ul className="divide-y divide-border">
          {visible.map((n, i) => (
            <li key={start + i} className={`p-2.5 ${n.read ? "opacity-60" : ""}`}>
              <p className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <span className="min-w-0 truncate">{n.title}</span>
                {!n.read && (
                  <span className="shrink-0 rounded-lg bg-red/10 px-1.5 py-0.5 text-[11px] font-medium text-red-soft">
                    Nova
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {n.description}
              </p>
              <p className="mt-0.5 text-[11px] text-muted/70">{n.time}</p>
            </li>
          ))}
        </ul>
        {visible.length === 0 && (
          <p className="p-2.5 text-center text-sm text-muted">
            {loading ? "Carregando..." : "Nenhuma notificação encontrada."}
          </p>
        )}
        <CardFooter>
          <span className="text-xs text-muted">
            {visible.length === 0
              ? "0 resultados"
              : `${start + 1}–${start + visible.length} de ${filtered.length}`}
          </span>
          <Pagination page={current} pageCount={pageCount} onPage={setPage} />
        </CardFooter>
      </Card>
    </PageShell>
  );
}

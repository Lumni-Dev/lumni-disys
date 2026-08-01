"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { Topbar } from "@/components/ui/topbar";
import { type Candidate } from "@/lib/data";
import { api } from "@/lib/api-client";

type DashboardData = {
  stats: {
    companies: { active: number; total: number };
    jobs: { open: number; total: number };
    candidates: { total: number };
    pipeline: { total: number };
  };
  funnel: { stage: string; count: number }[];
};

const CARD_META = [
  { label: "Empresas ativas", href: "/companies", data: [12, 14, 13, 16, 18, 21, 20, 24] },
  { label: "Vagas abertas", href: "/jobs", data: [8, 10, 9, 12, 11, 14, 16, 18] },
  { label: "Candidatos", href: "/candidates", data: [12, 16, 15, 18, 22, 25, 27, 30] },
  { label: "Processos ativos", href: "/pipeline", data: [22, 25, 24, 28, 30, 33, 35, 37] },
];

const ACTIVITY_PAGE_SIZE = 20;

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get<DashboardData>("/api/dashboard").then(setData);
    api.get<Candidate[]>("/api/candidates").then(setCandidates);
  }, []);

  const cards = data
    ? [
        {
          ...CARD_META[0],
          value: String(data.stats.companies.active),
          delta: `${data.stats.companies.total} no total`,
        },
        {
          ...CARD_META[1],
          value: String(data.stats.jobs.open),
          delta: `${data.stats.jobs.total} no total`,
        },
        {
          ...CARD_META[2],
          value: String(data.stats.candidates.total),
          delta: "no banco de talentos",
        },
        {
          ...CARD_META[3],
          value: String(data.stats.pipeline.total),
          delta: "em andamento",
        },
      ]
    : [];

  const funnel = data?.funnel ?? [];
  const maxCount = Math.max(1, ...funnel.map((f) => f.count));
  const totalInProcess = funnel.reduce((a, f) => a + f.count, 0);

  const activities = candidates.map((c) => ({
    who: c.name,
    what: `movido para ${c.stage}`,
    role: c.role,
    time: c.modifiedAt,
  }));
  const pageCount = Math.ceil(activities.length / ACTIVITY_PAGE_SIZE);
  const start = (page - 1) * ACTIVITY_PAGE_SIZE;
  const visible = activities.slice(start, start + ACTIVITY_PAGE_SIZE);

  return (
    <>
      <Topbar showSearch={false} />
      <div className="flex flex-col gap-2.5 p-2.5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <Card>
          <CardHeader
            title="Funil de recrutamento"
            subtitle="Candidatos por etapa"
          />
          <CardBody className="space-y-2.5">
            {funnel.length === 0 && (
              <p className="text-sm text-muted">Carregando...</p>
            )}
            {funnel.map((f) => (
              <div key={f.stage}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-foreground">{f.stage}</span>
                  <span className="text-muted">{f.count}</span>
                </div>
                <Progress value={(f.count / maxCount) * 100} />
              </div>
            ))}
          </CardBody>
          <CardFooter>
            <span className="text-xs text-muted">Total em processo</span>
            <span className="text-xs font-medium text-foreground">
              {totalInProcess} candidatos
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader
            title="Atividade recente"
            subtitle="Últimas movimentações"
          />
          <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2">
            {visible.map((a, i) => (
              <li key={start + i} className="p-2.5">
                <p className="text-sm text-foreground">
                  <span className="font-medium text-red-soft">{a.who}</span>{" "}
                  <span className="text-muted">{a.what}</span>
                </p>
                <p className="mt-0.5 truncate text-xs text-muted">{a.role}</p>
                <p className="mt-0.5 text-[11px] text-muted/70">{a.time}</p>
              </li>
            ))}
          </ul>
          <CardFooter>
            <span className="text-xs text-muted">
              {activities.length === 0
                ? "Carregando..."
                : `${start + 1}–${start + visible.length} de ${activities.length}`}
            </span>
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Topbar } from "@/components/ui/topbar";
import { type Candidate } from "@/lib/data";
import { api } from "@/lib/api-client";

type Trend = number[];

type DashboardData = {
  stats: {
    companies: { active: number; total: number };
    jobs: { open: number; total: number };
    candidates: { total: number };
    pipeline: { total: number };
  };
  funnel: { stage: string; count: number }[];
  trends: {
    companies: Trend;
    jobs: Trend;
    candidates: Trend;
    pipeline: Trend;
  };
};

const CARD_META = [
  { label: "Empresas ativas", href: "/companies" },
  { label: "Vagas abertas", href: "/jobs" },
  { label: "Candidatos", href: "/candidates" },
  { label: "Processos ativos", href: "/pipeline" },
];

const ACTIVITY_PAGE_SIZE = 20;

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candLoaded, setCandLoaded] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get<DashboardData>("/api/dashboard")
      .then(setData)
      .catch(() => {});
    api
      .get<Candidate[]>("/api/candidates")
      .then(setCandidates)
      .catch(() => {})
      .finally(() => setCandLoaded(true));
  }, []);

  const cards = data
    ? [
        {
          ...CARD_META[0],
          value: String(data.stats.companies.active),
          delta: `${data.stats.companies.total} no total`,
          data: data.trends.companies,
        },
        {
          ...CARD_META[1],
          value: String(data.stats.jobs.open),
          delta: `${data.stats.jobs.total} no total`,
          data: data.trends.jobs,
        },
        {
          ...CARD_META[2],
          value: String(data.stats.candidates.total),
          delta: "no banco de talentos",
          data: data.trends.candidates,
        },
        {
          ...CARD_META[3],
          value: String(data.stats.pipeline.total),
          delta: "em andamento",
          data: data.trends.pipeline,
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
          {data
            ? cards.map((s) => <StatCard key={s.label} {...s} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <div className="flex flex-col gap-2.5 p-2.5">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))}
        </div>

        <Card>
          <CardHeader
            title="Funil de recrutamento"
            subtitle="Candidatos por etapa"
          />
          <CardBody className="space-y-2.5">
            {!data &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-6" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
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
          {!candLoaded ? (
            <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex flex-col gap-1.5 p-2.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2">
              {visible.map((a, i) => (
                <li key={start + i} className="p-2.5">
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-foreground">{a.who}</span>{" "}
                    <span className="text-muted">{a.what}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">{a.role}</p>
                  <p className="mt-0.5 text-[11px] text-muted/70">{a.time}</p>
                </li>
              ))}
            </ul>
          )}
          {candLoaded && visible.length === 0 && (
            <p className="p-2.5 text-center text-sm text-muted">
              Nenhuma atividade recente por enquanto.
            </p>
          )}
          <CardFooter>
            {!candLoaded ? (
              <Skeleton className="h-3 w-24" />
            ) : (
              <span className="text-xs text-muted">
                {activities.length === 0
                  ? "0 movimentações"
                  : `${start + 1}–${start + visible.length} de ${activities.length}`}
              </span>
            )}
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

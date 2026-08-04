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
import { useI18n } from "@/i18n/context";

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

const CARD_HREFS = ["/companies", "/jobs", "/candidates", "/pipeline"];

const ACTIVITY_PAGE_SIZE = 20;

export default function Home() {
  const { admin } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candLoaded, setCandLoaded] = useState(false);
  const [page, setPage] = useState(1);

  const cardMeta = [
    { label: admin.dashboard.cards.activeCompanies, href: CARD_HREFS[0] },
    { label: admin.dashboard.cards.openJobs, href: CARD_HREFS[1] },
    { label: admin.dashboard.cards.candidates, href: CARD_HREFS[2] },
    { label: admin.dashboard.cards.activePipeline, href: CARD_HREFS[3] },
  ];

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
          ...cardMeta[0],
          value: String(data.stats.companies.active),
          delta: admin.common.totalCount(data.stats.companies.total),
          data: data.trends.companies,
        },
        {
          ...cardMeta[1],
          value: String(data.stats.jobs.open),
          delta: admin.common.totalCount(data.stats.jobs.total),
          data: data.trends.jobs,
        },
        {
          ...cardMeta[2],
          value: String(data.stats.candidates.total),
          delta: admin.dashboard.deltaTalent,
          data: data.trends.candidates,
        },
        {
          ...cardMeta[3],
          value: String(data.stats.pipeline.total),
          delta: admin.dashboard.deltaInProgress,
          data: data.trends.pipeline,
        },
      ]
    : [];

  const funnel = data?.funnel ?? [];
  const maxCount = Math.max(1, ...funnel.map((f) => f.count));
  const totalInProcess = funnel.reduce((a, f) => a + f.count, 0);

  // Mais recentes primeiro (modifiedAt vem como dd/mm/aaaa).
  const dateValue = (d: string) => {
    const [dd, mm, yy] = d.split("/").map(Number);
    return new Date(yy || 0, (mm || 1) - 1, dd || 1).getTime();
  };
  const activities = [...candidates]
    .sort(
      (a, b) => dateValue(b.modifiedAt) - dateValue(a.modifiedAt) || b.id - a.id,
    )
    .map((c) => ({
      who: c.name,
      what: admin.dashboard.movedTo(admin.stages[c.stage] ?? c.stage),
      role: c.role,
      // Data e hora (hh:mm) no fuso de Sao Paulo, separados por " - ".
      time: c.modifiedAtTime
        ? `${c.modifiedAt} - ${c.modifiedAtTime}`
        : c.modifiedAt,
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
            title={admin.dashboard.funnelTitle}
            subtitle={admin.dashboard.funnelSubtitle}
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
                  <span className="text-foreground">
                    {admin.stages[f.stage] ?? f.stage}
                  </span>
                  <span className="text-muted">{f.count}</span>
                </div>
                <Progress value={(f.count / maxCount) * 100} />
              </div>
            ))}
          </CardBody>
          <CardFooter>
            <span className="text-xs text-muted">
              {admin.dashboard.totalInProcess}
            </span>
            <span className="text-xs font-medium text-foreground">
              {admin.dashboard.candidatesCount(totalInProcess)}
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader
            title={admin.dashboard.activityTitle}
            subtitle={admin.dashboard.activitySubtitle}
          />
          {!candLoaded ? (
            <ul className="grid grid-cols-1 divide-y divide-white/[0.07] sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex flex-col gap-1.5 p-2.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-1 divide-y divide-white/[0.07] sm:grid-cols-2">
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
              {admin.dashboard.noActivity}
            </p>
          )}
          <CardFooter>
            {!candLoaded ? (
              <Skeleton className="h-3 w-24" />
            ) : (
              <span className="text-xs text-muted">
                {activities.length === 0
                  ? admin.dashboard.noMovements
                  : admin.common.range(
                      start + 1,
                      start + visible.length,
                      activities.length,
                    )}
              </span>
            )}
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

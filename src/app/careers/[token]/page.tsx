"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { IconSearch } from "@/components/ui/icons";
import { ApplyModal } from "@/components/apply-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { type Job } from "@/lib/data";
import { api } from "@/lib/api-client";

export default function CareersPage() {
  const { token } = useParams<{ token: string }>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [jobType, setJobType] = useState("");
  const [applying, setApplying] = useState<Job | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<Job[]>(`/api/public/jobs?token=${encodeURIComponent(token)}`)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [token]);

  const openJobs = jobs.filter((v) => v.status === "Aberta");
  const levels = [...new Set(openJobs.map((v) => v.level))];
  const jobTypes = [...new Set(openJobs.map((v) => v.type))];

  const q = query.trim().toLowerCase();
  const filtered = openJobs.filter((v) => {
    const matchQuery =
      !q || [v.title, v.company].some((x) => x.toLowerCase().includes(q));
    return (
      matchQuery && (!level || v.level === level) && (!jobType || v.type === jobType)
    );
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground opacity-[0.06] blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-foreground opacity-[0.04] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-72 -right-24 h-80 w-80 rounded-full bg-foreground opacity-[0.04] blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-2.5 p-2.5">
        <header className="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-surface/80 p-3 backdrop-blur">
          <div className="leading-tight">
            <p className="text-lg font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
              DISYS
            </p>
            <p className="text-xs text-muted">Nossas vagas</p>
          </div>
        </header>

        <div className="rounded-lg border border-border bg-surface/80 p-2.5 backdrop-blur">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Vagas abertas
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {filtered.length}{" "}
            {filtered.length === 1 ? "oportunidade" : "oportunidades"} disponíveis
          </p>

          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-4">
            <div className="relative sm:col-span-2">
              <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por cargo ou empresa..."
                className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-8 pr-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-white/50 focus:ring-1 focus:ring-white/30"
              />
            </div>
            <Select
              value={level}
              onChange={setLevel}
              emptyLabel="Todos os níveis"
              options={levels}
            />
            <Select
              value={jobType}
              onChange={setJobType}
              emptyLabel="Todas as modalidades"
              options={jobTypes}
            />
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface/80 p-2.5 backdrop-blur"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2.5">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <Card key={v.id}>
              <CardHeader title={v.title} subtitle={v.company} />
              <CardBody className="flex flex-wrap gap-2.5">
                <Badge tone="red">{v.level}</Badge>
                <Badge>{v.type}</Badge>
              </CardBody>
              <CardFooter>
                <span className="text-xs text-muted">Publicada recentemente</span>
                <button
                  type="button"
                  onClick={() => setApplying(v)}
                  className="rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-medium text-background transition-colors hover:bg-white"
                >
                  Candidatar-se
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <Card>
            <p className="p-2.5 text-center text-sm text-muted">
              Nenhuma vaga encontrada.
            </p>
          </Card>
        )}

        <ApplyModal
          job={applying}
          token={token}
          onClose={() => setApplying(null)}
        />
      </div>
    </div>
  );
}

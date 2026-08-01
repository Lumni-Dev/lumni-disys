"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { IconSearch } from "@/components/ui/icons";
import { ApplyModal } from "@/components/apply-modal";
import { type Job } from "@/lib/data";
import { api } from "@/lib/api-client";

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [jobType, setJobType] = useState("");
  const [applying, setApplying] = useState<Job | null>(null);

  useEffect(() => {
    api.get<Job[]>("/api/public/jobs").then(setJobs);
  }, []);

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
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-2.5 p-2.5">
      <header className="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-surface p-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar tone="solid" className="shadow-lg shadow-red/30">
            DS
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide text-foreground">
              DISYS
            </p>
            <p className="text-xs text-muted">Nossas vagas</p>
          </div>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-surface p-2.5">
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
              className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-8 pr-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-red/60 focus:ring-1 focus:ring-red/40"
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
                className="rounded-lg bg-red px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-soft"
              >
                Candidatar-se
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <p className="p-2.5 text-center text-sm text-muted">
            Nenhuma vaga encontrada com esses filtros.
          </p>
        </Card>
      )}

      <ApplyModal job={applying} onClose={() => setApplying(null)} />
    </div>
  );
}

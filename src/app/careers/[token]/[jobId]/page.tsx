"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyModal } from "@/components/apply-modal";
import { type Job } from "@/lib/data";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";

export default function JobPage() {
  const { admin } = useI18n();
  const t = admin.careers;
  const { token, jobId } = useParams<{ token: string; jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<Job | null>(null);

  useEffect(() => {
    if (!token || !jobId) return;
    api
      .get<Job[]>(
        `/api/public/jobs?token=${encodeURIComponent(token)}&id=${encodeURIComponent(jobId)}`,
      )
      .then((rows) => setJob(rows[0] ?? null))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [token, jobId]);

  return (
    <div className="force-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-2.5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.07] blur-[140px]"
      />

      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface/80 shadow-2xl backdrop-blur">
        <div className="flex flex-col items-center gap-1.5 border-b border-border p-2.5 text-center">
          <p className="text-xl font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
            DISYS
          </p>
          <p className="text-xs text-muted">{t.tagline}</p>
        </div>

        <div className="flex flex-col gap-2.5 p-4">
          {loading ? (
            <>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2.5">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-9 w-full" />
            </>
          ) : !job ? (
            <>
              <p className="p-2.5 text-center text-sm text-muted">
                {t.jobNotFound}
              </p>
              <Link
                href="/"
                className="flex w-full items-center justify-center rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
              >
                {t.goHome}
              </Link>
            </>
          ) : (
            <>
              <div className="leading-tight">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {job.title}
                </h1>
                <p className="mt-0.5 text-sm text-muted">{job.company}</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Badge tone="red">{admin.levels[job.level] ?? job.level}</Badge>
                <Badge>{admin.jobTypes[job.type] ?? job.type}</Badge>
                <Badge>{admin.jobs.openingsCount(job.openings)}</Badge>
              </div>
              {job.description && (
                <p className="max-h-64 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-muted scroll-thin">
                  {job.description}
                </p>
              )}
              {job.postedAt && (
                <p className="text-xs text-muted">{t.postedAt(job.postedAt)}</p>
              )}
              <button
                type="button"
                onClick={() => setApplying(job)}
                className="mt-1.5 w-full rounded-lg bg-foreground px-2.5 py-2 text-sm font-medium text-background transition-colors hover:bg-white"
              >
                {t.apply}
              </button>
            </>
          )}
        </div>
      </div>

      <ApplyModal job={applying} token={token} onClose={() => setApplying(null)} />
    </div>
  );
}

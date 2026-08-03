"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Badge, type Tone } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { AddButton, Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { ExportButton } from "@/components/ui/export-button";
import { SelectionBar } from "@/components/ui/selection-bar";
import { FilterBar, FilterSelect } from "@/components/ui/filter-bar";
import { Tooltip } from "@/components/ui/tooltip";
import {
  IconUsers,
  IconShare,
  IconTrash,
  IconCheck,
  IconPencil,
} from "@/components/ui/icons";
import { useAccess } from "@/lib/access";
import { ShareJobs } from "@/components/share-jobs";
import { JobModal } from "@/components/entity-modals";
import { type Job } from "@/lib/data";
import { downloadExcel } from "@/lib/export";
import { useSelection } from "@/lib/use-selection";
import { Skeleton } from "@/components/ui/skeleton";
import { cx } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";

const PAGE_SIZE = 9;

const tone = (s: string): Tone =>
  s === "Aberta" ? "green" : s === "Fechada" ? "red" : "amber";

export default function JobsPage() {
  const { admin } = useI18n();
  const COLUMNS: { key: keyof Job; label: string }[] = [
    { key: "title", label: admin.jobs.cols.title },
    { key: "company", label: admin.jobs.cols.company },
    { key: "level", label: admin.jobs.cols.level },
    { key: "type", label: admin.jobs.cols.type },
    { key: "openings", label: admin.jobs.cols.openings },
    { key: "applicants", label: admin.jobs.cols.applicants },
    { key: "status", label: admin.jobs.cols.status },
    { key: "description", label: admin.jobs.cols.description },
  ];
  const [list, setList] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [fLevel, setFLevel] = useState("");
  const [fType, setFType] = useState("");
  const [fStatus, setFStatus] = useState("");
  const access = useAccess();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Copia o link publico direto desta vaga (token da conta + id).
  function shareJob(id: number) {
    if (!access?.token) return;
    const url = `${window.location.origin}/careers/${access.token}/${id}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  useEffect(() => {
    api
      .get<Job[]>("/api/jobs")
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const levels = [...new Set(list.map((v) => v.level))];
  const types = [...new Set(list.map((v) => v.type))];
  const hasFilters = !!(fLevel || fType || fStatus);

  const q = query.trim().toLowerCase();
  const filtered = list.filter((v) => {
    const matchQuery =
      !q ||
      [v.title, v.company, v.level, v.type, v.status].some((x) =>
        x.toLowerCase().includes(q),
      );
    return (
      matchQuery &&
      (!fLevel || v.level === fLevel) &&
      (!fType || v.type === fType) &&
      (!fStatus || v.status === fStatus)
    );
  });

  const sel = useSelection(filtered, (v) => v.id);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(1, pageCount));
  const start = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  async function save(v: Job) {
    if (v.id === 0) {
      const created = await api.post<Job>("/api/jobs", v);
      setList((prev) => [...prev, created]);
    } else {
      const updated = await api.put<Job>(`/api/jobs/${v.id}`, v);
      setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    }
  }

  async function remove(id: number) {
    await api.del(`/api/jobs/${id}`);
    setList((prev) => prev.filter((v) => v.id !== id));
  }

  function exportSelected() {
    downloadExcel(admin.jobs.fileName, COLUMNS, sel.selected);
    sel.cancel();
  }

  function clearFilters() {
    setFLevel("");
    setFType("");
    setFStatus("");
    setPage(1);
  }

  return (
    <PageShell
      action={
        <>
          <ShareJobs />
          <ExportButton onClick={sel.start} />
          <AddButton onClick={() => setAddOpen(true)}>{admin.jobs.add}</AddButton>
        </>
      }
      searchPlaceholder={admin.jobs.searchPlaceholder}
      searchValue={query}
      onSearchChange={(v) => {
        setQuery(v);
        setPage(1);
      }}
    >
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <FilterSelect
          value={fLevel}
          onChange={(v) => {
            setFLevel(v);
            setPage(1);
          }}
          placeholder={admin.jobs.allLevels}
          options={levels.map((v) => ({ value: v, label: admin.levels[v] ?? v }))}
        />
        <FilterSelect
          value={fType}
          onChange={(v) => {
            setFType(v);
            setPage(1);
          }}
          placeholder={admin.jobs.allTypes}
          options={types.map((v) => ({
            value: v,
            label: admin.jobTypes[v] ?? v,
          }))}
        />
        <FilterSelect
          value={fStatus}
          onChange={(v) => {
            setFStatus(v);
            setPage(1);
          }}
          placeholder={admin.jobs.allStatuses}
          options={["Aberta", "Em análise", "Fechada"].map((v) => ({
            value: v,
            label: admin.status[v] ?? v,
          }))}
        />
      </FilterBar>

      {sel.active && (
        <Card>
          <div className="flex items-center justify-between gap-2.5 p-2.5">
            <Checkbox
              checked={sel.all}
              onChange={sel.toggleAll}
              label={admin.common.selectAll}
            />
            <SelectionBar
              count={sel.count}
              onExport={exportSelected}
              onCancel={sel.cancel}
            />
          </div>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="flex flex-col gap-2.5 p-2.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2.5">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((v) => (
          <Card
            key={v.id}
            className={cx(sel.active && sel.ids.has(v.id) && "border-white")}
          >
            <button
              type="button"
              onClick={() => (sel.active ? sel.toggle(v.id) : setEditing(v))}
              className="block w-full text-left"
            >
              <CardHeader
                title={v.title}
                subtitle={v.company}
                action={
                  sel.active ? (
                    <Checkbox
                      checked={sel.ids.has(v.id)}
                      onChange={() => {}}
                      className="pointer-events-none"
                    />
                  ) : (
                    <Badge tone={tone(v.status)}>
                      {admin.status[v.status] ?? v.status}
                    </Badge>
                  )
                }
              />
              <CardBody className="flex flex-wrap gap-2.5">
                <Badge>{admin.jobTypes[v.type] ?? v.type}</Badge>
                <Badge>{admin.levels[v.level] ?? v.level}</Badge>
                <Badge>{admin.jobs.openingsCount(v.openings)}</Badge>
                {v.description && (
                  <p className="line-clamp-2 w-full text-xs text-muted">
                    {v.description}
                  </p>
                )}
              </CardBody>
            </button>
            <CardFooter>
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <IconUsers className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground">
                  {v.applicants}
                </span>
                {admin.jobs.candidatesLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <Tooltip
                  label={
                    copiedId === v.id
                      ? admin.shareJobs.copied
                      : admin.jobs.shareJob
                  }
                >
                  <Button
                    variant="outline"
                    aria-label={admin.jobs.shareJob}
                    icon={
                      copiedId === v.id ? (
                        <IconCheck className="h-4 w-4 text-accent" />
                      ) : (
                        <IconShare className="h-4 w-4" />
                      )
                    }
                    onClick={() => shareJob(v.id)}
                  />
                </Tooltip>
                <Tooltip label={admin.common.edit}>
                  <Button
                    variant="outline"
                    aria-label={admin.common.edit}
                    icon={<IconPencil className="h-4 w-4" />}
                    onClick={() => setEditing(v)}
                  />
                </Tooltip>
                <ConfirmAction
                  label={admin.common.remove}
                  icon={<IconTrash className="h-4 w-4" />}
                  onConfirm={() => remove(v.id)}
                />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!loading && visible.length === 0 && (
        <Card>
          <p className="p-2.5 text-center text-sm text-muted">
            {admin.jobs.empty}
          </p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-2.5 p-2.5">
          <span className="text-xs text-muted">
            {visible.length === 0
              ? admin.common.noResults
              : admin.jobs.range(
                  start + 1,
                  start + visible.length,
                  filtered.length,
                )}
          </span>
          <Pagination page={current} pageCount={pageCount} onPage={setPage} />
        </div>
      </Card>

      <JobModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={save}
      />
      <JobModal
        key={editing?.id ?? "edit"}
        open={!!editing}
        job={editing}
        onClose={() => setEditing(null)}
        onSave={save}
      />
    </PageShell>
  );
}

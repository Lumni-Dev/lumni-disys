"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Badge, type Tone } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { AddButton } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { ExportButton } from "@/components/ui/export-button";
import { SelectionBar } from "@/components/ui/selection-bar";
import { FilterBar, FilterSelect } from "@/components/ui/filter-bar";
import { IconUsers } from "@/components/ui/icons";
import { ShareJobs } from "@/components/share-jobs";
import { JobModal } from "@/components/entity-modals";
import { type Job } from "@/lib/data";
import { downloadExcel } from "@/lib/export";
import { useSelection } from "@/lib/use-selection";
import { cx } from "@/lib/utils";
import { api } from "@/lib/api-client";

const PAGE_SIZE = 9;

const COLUMNS = [
  { key: "title", label: "Vaga" },
  { key: "company", label: "Empresa" },
  { key: "level", label: "Nível" },
  { key: "type", label: "Modalidade" },
  { key: "applicants", label: "Candidatos" },
  { key: "status", label: "Status" },
] as const;

const tone = (s: string): Tone =>
  s === "Aberta" ? "green" : s === "Fechada" ? "red" : "amber";

export default function JobsPage() {
  const [list, setList] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [fLevel, setFLevel] = useState("");
  const [fType, setFType] = useState("");
  const [fStatus, setFStatus] = useState("");

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
    downloadExcel("vagas", [...COLUMNS], sel.selected);
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
          <AddButton onClick={() => setAddOpen(true)}>Nova vaga</AddButton>
        </>
      }
      searchPlaceholder="Buscar vagas..."
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
          placeholder="Todos os níveis"
          options={levels}
        />
        <FilterSelect
          value={fType}
          onChange={(v) => {
            setFType(v);
            setPage(1);
          }}
          placeholder="Todas as modalidades"
          options={types}
        />
        <FilterSelect
          value={fStatus}
          onChange={(v) => {
            setFStatus(v);
            setPage(1);
          }}
          placeholder="Todos os status"
          options={["Aberta", "Em análise", "Fechada"]}
        />
      </FilterBar>

      {sel.active && (
        <Card>
          <div className="flex items-center justify-between gap-2.5 p-2.5">
            <Checkbox
              checked={sel.all}
              onChange={sel.toggleAll}
              label="Selecionar tudo"
            />
            <SelectionBar
              count={sel.count}
              onExport={exportSelected}
              onCancel={sel.cancel}
            />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((v) => (
          <Card
            key={v.id}
            className={cx(sel.active && sel.ids.has(v.id) && "border-red")}
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
                    <Badge tone={tone(v.status)}>{v.status}</Badge>
                  )
                }
              />
              <CardBody className="flex flex-wrap gap-2.5">
                <Badge>{v.type}</Badge>
                <Badge>{v.level}</Badge>
              </CardBody>
            </button>
            <CardFooter>
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <IconUsers className="h-4 w-4 text-red-soft" />
                <span className="font-medium text-foreground">
                  {v.applicants}
                </span>
                candidatos
              </span>
              <ConfirmAction
                label="Remover"
                confirmLabel="Confirmar"
                onConfirm={() => remove(v.id)}
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {visible.length === 0 && (
        <Card>
          <p className="p-2.5 text-center text-sm text-muted">
            {loading ? "Carregando..." : "Nenhuma vaga encontrada."}
          </p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-2.5 p-2.5">
          <span className="text-xs text-muted">
            {visible.length === 0
              ? "0 resultados"
              : `${start + 1}–${start + visible.length} de ${filtered.length} vagas`}
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

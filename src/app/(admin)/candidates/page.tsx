"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge, type Tone } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, Thead, Tbody, Th, Tr, Td } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { AddButton, Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { ExportButton } from "@/components/ui/export-button";
import { Tooltip } from "@/components/ui/tooltip";
import { IconPencil, IconTrash } from "@/components/ui/icons";
import { SelectionBar } from "@/components/ui/selection-bar";
import { FilterBar, FilterSelect } from "@/components/ui/filter-bar";
import { initials } from "@/lib/utils";
import { CandidateModal } from "@/components/entity-modals";
import { type Candidate } from "@/lib/data";
import { downloadExcel } from "@/lib/export";
import { useSelection } from "@/lib/use-selection";
import { SkeletonRows } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";

const PAGE_SIZE = 10;

const stageTone: Record<string, Tone> = {
  Triagem: "neutral",
  "Entrevista RH": "blue",
  "Teste técnico": "amber",
  "Entrevista final": "red",
  Proposta: "green",
};

export default function CandidatesPage() {
  const { admin } = useI18n();
  const COLUMNS: { key: keyof Candidate; label: string }[] = [
    { key: "name", label: admin.candidates.cols.name },
    { key: "email", label: admin.candidates.cols.email },
    { key: "role", label: admin.candidates.cols.role },
    { key: "stage", label: admin.candidates.cols.stage },
    { key: "modifiedAt", label: admin.candidates.cols.modifiedAt },
  ];
  const [list, setList] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [fStage, setFStage] = useState("");
  const [fRole, setFRole] = useState("");

  useEffect(() => {
    api
      .get<Candidate[]>("/api/candidates")
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const roles = [...new Set(list.map((c) => c.role))].sort();
  const hasFilters = !!(fStage || fRole);

  const q = query.trim().toLowerCase();
  const filtered = list.filter((c) => {
    const matchQuery =
      !q ||
      [c.name, c.email, c.role, c.stage].some((v) =>
        v.toLowerCase().includes(q),
      );
    return matchQuery && (!fStage || c.stage === fStage) && (!fRole || c.role === fRole);
  });

  const sel = useSelection(filtered, (c) => c.id);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(1, pageCount));
  const start = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  async function save(c: Candidate) {
    if (c.id === 0) {
      const created = await api.post<Candidate>("/api/candidates", c);
      setList((prev) => [...prev, created]);
    } else {
      const updated = await api.put<Candidate>(`/api/candidates/${c.id}`, c);
      setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    }
  }

  async function remove(id: number) {
    await api.del(`/api/candidates/${id}`);
    setList((prev) => prev.filter((c) => c.id !== id));
  }

  function exportSelected() {
    downloadExcel(admin.candidates.fileName, COLUMNS, sel.selected);
    sel.cancel();
  }

  function clearFilters() {
    setFStage("");
    setFRole("");
    setPage(1);
  }

  const colSpan = 5 + (sel.active ? 1 : 0);

  return (
    <PageShell
      action={
        <>
          <ExportButton onClick={sel.start} />
          <AddButton onClick={() => setAddOpen(true)}>
            {admin.candidates.add}
          </AddButton>
        </>
      }
      searchPlaceholder={admin.candidates.searchPlaceholder}
      searchValue={query}
      onSearchChange={(v) => {
        setQuery(v);
        setPage(1);
      }}
    >
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <FilterSelect
          value={fStage}
          onChange={(v) => {
            setFStage(v);
            setPage(1);
          }}
          placeholder={admin.candidates.allStages}
          options={[
            "Triagem",
            "Entrevista RH",
            "Teste técnico",
            "Entrevista final",
            "Proposta",
          ].map((v) => ({ value: v, label: admin.stages[v] ?? v }))}
        />
        <FilterSelect
          value={fRole}
          onChange={(v) => {
            setFRole(v);
            setPage(1);
          }}
          placeholder={admin.candidates.allRoles}
          options={roles}
        />
      </FilterBar>

      <Card>
        <CardHeader
          title={
            sel.active
              ? admin.common.selectToExport
              : admin.candidates.listTitle
          }
          subtitle={
            sel.active
              ? admin.common.markToExport
              : admin.candidates.count(filtered.length)
          }
          action={
            sel.active ? (
              <SelectionBar
                count={sel.count}
                onExport={exportSelected}
                onCancel={sel.cancel}
              />
            ) : undefined
          }
        />
        <Table>
          <Thead>
            {sel.active && (
              <Th>
                <Checkbox checked={sel.all} onChange={sel.toggleAll} />
              </Th>
            )}
            <Th>{admin.candidates.cols.name}</Th>
            <Th>{admin.candidates.cols.role}</Th>
            <Th>{admin.candidates.cols.stage}</Th>
            <Th>{admin.candidates.cols.modifiedAt}</Th>
            <Th>{admin.common.actions}</Th>
          </Thead>
          <Tbody>
            {visible.map((c) => (
              <Tr key={c.id}>
                {sel.active && (
                  <Td>
                    <Checkbox
                      checked={sel.ids.has(c.id)}
                      onChange={() => sel.toggle(c.id)}
                    />
                  </Td>
                )}
                <Td>
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="flex items-center gap-2.5 text-left"
                  >
                    <Avatar tone="neutral">{initials(c.name)}</Avatar>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate font-medium text-foreground">{c.name}</p>
                      <p className="truncate text-xs text-muted">{c.email}</p>
                    </div>
                  </button>
                </Td>
                <Td className="text-muted">{c.role}</Td>
                <Td>
                  <Badge tone={stageTone[c.stage]}>
                    {admin.stages[c.stage] ?? c.stage}
                  </Badge>
                </Td>
                <Td className="text-muted">{c.modifiedAt}</Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <Tooltip label={admin.common.edit}>
                      <Button
                        variant="outline"
                        aria-label={admin.common.edit}
                        icon={<IconPencil className="h-4 w-4" />}
                        onClick={() => setEditing(c)}
                      />
                    </Tooltip>
                    <ConfirmAction
                      label={admin.common.remove}
                      icon={<IconTrash className="h-4 w-4" />}
                      onConfirm={() => remove(c.id)}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
            {loading ? (
              <SkeletonRows cols={colSpan} />
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="p-2.5 text-center text-sm text-muted">
                  {admin.candidates.empty}
                </td>
              </tr>
            ) : null}
          </Tbody>
        </Table>
        <CardFooter>
          <span className="text-xs text-muted">
            {visible.length === 0
              ? admin.common.noResults
              : admin.common.range(
                  start + 1,
                  start + visible.length,
                  filtered.length,
                )}
          </span>
          <Pagination page={current} pageCount={pageCount} onPage={setPage} />
        </CardFooter>
      </Card>

      <CandidateModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={save}
      />
      <CandidateModal
        key={editing?.id ?? "edit"}
        open={!!editing}
        candidate={editing}
        onClose={() => setEditing(null)}
        onSave={save}
      />
    </PageShell>
  );
}

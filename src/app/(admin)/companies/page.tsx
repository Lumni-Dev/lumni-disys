"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { CompanyModal } from "@/components/entity-modals";
import { Modal } from "@/components/ui/modal";
import { type Company } from "@/lib/data";
import { downloadExcel } from "@/lib/export";
import { useSelection } from "@/lib/use-selection";
import { SkeletonRows } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";

const PAGE_SIZE = 10;

export default function CompaniesPage() {
  const { admin } = useI18n();
  const COLUMNS: { key: keyof Company; label: string }[] = [
    { key: "name", label: admin.companies.cols.name },
    { key: "sector", label: admin.companies.cols.sector },
    { key: "location", label: admin.companies.cols.location },
    { key: "openings", label: admin.companies.cols.openings },
    { key: "status", label: admin.companies.cols.status },
  ];
  const [list, setList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [fSector, setFSector] = useState("");
  const [fStatus, setFStatus] = useState("");
  // Quantidade de vagas que impede a exclusao da empresa (null = modal fechado).
  const [blockedJobs, setBlockedJobs] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<Company[]>("/api/companies")
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const sectors = [...new Set(list.map((e) => e.sector))].sort();
  const hasFilters = !!(fSector || fStatus);

  const q = query.trim().toLowerCase();
  const filtered = list.filter((e) => {
    const matchQuery =
      !q ||
      [e.name, e.sector, e.location, e.status].some((v) =>
        v.toLowerCase().includes(q),
      );
    return (
      matchQuery && (!fSector || e.sector === fSector) && (!fStatus || e.status === fStatus)
    );
  });

  const sel = useSelection(filtered, (e) => e.id);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(1, pageCount));
  const start = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  async function save(e: Company) {
    if (e.id === 0) {
      const created = await api.post<Company>("/api/companies", e);
      setList((prev) => [...prev, created]);
    } else {
      const updated = await api.put<Company>(`/api/companies/${e.id}`, e);
      setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    }
  }

  async function remove(id: number) {
    try {
      await api.del(`/api/companies/${id}`);
      setList((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      // Exclusao bloqueada por dependencias (vagas): avisa em modal.
      if (err instanceof ApiError && err.status === 409) {
        const data = err.data as { count?: number } | null;
        setBlockedJobs(data?.count ?? 0);
      }
    }
  }

  function exportSelected() {
    downloadExcel(admin.companies.fileName, COLUMNS, sel.selected);
    sel.cancel();
  }

  function clearFilters() {
    setFSector("");
    setFStatus("");
    setPage(1);
  }

  const colSpan = 6 + (sel.active ? 1 : 0);

  return (
    <PageShell
      action={
        <>
          <ExportButton onClick={sel.start} />
          <AddButton onClick={() => setAddOpen(true)}>
            {admin.companies.add}
          </AddButton>
        </>
      }
      searchPlaceholder={admin.companies.searchPlaceholder}
      searchValue={query}
      onSearchChange={(v) => {
        setQuery(v);
        setPage(1);
      }}
    >
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <FilterSelect
          value={fSector}
          onChange={(v) => {
            setFSector(v);
            setPage(1);
          }}
          placeholder={admin.companies.allSectors}
          options={sectors}
        />
        <FilterSelect
          value={fStatus}
          onChange={(v) => {
            setFStatus(v);
            setPage(1);
          }}
          placeholder={admin.companies.allStatuses}
          options={[
            { value: "Ativa", label: admin.status["Ativa"] },
            { value: "Pausada", label: admin.status["Pausada"] },
          ]}
        />
      </FilterBar>

      <Card>
        <CardHeader
          title={
            sel.active
              ? admin.common.selectToExport
              : admin.companies.listTitle
          }
          subtitle={
            sel.active
              ? admin.common.markToExport
              : admin.common.totalCount(filtered.length)
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
            <Th>{admin.companies.cols.name}</Th>
            <Th>{admin.companies.cols.sector}</Th>
            <Th>{admin.companies.cols.location}</Th>
            <Th>{admin.companies.cols.openings}</Th>
            <Th>{admin.companies.cols.status}</Th>
            <Th>{admin.common.actions}</Th>
          </Thead>
          <Tbody>
            {visible.map((e) => (
              <Tr key={e.id}>
                {sel.active && (
                  <Td>
                    <Checkbox
                      checked={sel.ids.has(e.id)}
                      onChange={() => sel.toggle(e.id)}
                    />
                  </Td>
                )}
                <Td>
                  <button
                    type="button"
                    onClick={() => setEditing(e)}
                    className="flex items-center gap-2.5 text-left"
                  >
                    <Avatar>{e.name.charAt(0)}</Avatar>
                    <span className="min-w-0 truncate font-medium text-foreground">{e.name}</span>
                  </button>
                </Td>
                <Td className="text-muted">{e.sector}</Td>
                <Td className="text-muted">{e.location}</Td>
                <Td className="text-foreground">{e.openings}</Td>
                <Td>
                  <Badge tone={e.status === "Ativa" ? "green" : "amber"}>
                    {admin.status[e.status] ?? e.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <Tooltip label={admin.common.edit}>
                      <Button
                        variant="outline"
                        aria-label={admin.common.edit}
                        icon={<IconPencil className="h-4 w-4" />}
                        onClick={() => setEditing(e)}
                      />
                    </Tooltip>
                    <ConfirmAction
                      label={admin.common.remove}
                      icon={<IconTrash className="h-4 w-4" />}
                      onConfirm={() => remove(e.id)}
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
                  {admin.companies.empty}
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

      <CompanyModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={save}
      />
      <CompanyModal
        key={editing?.id ?? "edit"}
        open={!!editing}
        company={editing}
        onClose={() => setEditing(null)}
        onSave={save}
      />

      <Modal
        open={blockedJobs !== null}
        onClose={() => setBlockedJobs(null)}
        title={admin.deleteBlocked?.title ?? "Não é possível excluir"}
        subtitle={
          admin.deleteBlocked?.companyHasJobs(blockedJobs ?? 0) ??
          `Esta empresa tem ${blockedJobs ?? 0} vaga(s) cadastrada(s). Exclua ou desvincule as vagas antes.`
        }
      >
        <div className="flex justify-end p-2.5">
          <button
            type="button"
            onClick={() => setBlockedJobs(null)}
            className="rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-medium text-background shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6)] transition-all duration-200 hover:bg-white active:scale-[0.98]"
          >
            {admin.common.close}
          </button>
        </div>
      </Modal>
    </PageShell>
  );
}

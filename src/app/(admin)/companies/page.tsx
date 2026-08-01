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
import { type Company } from "@/lib/data";
import { downloadExcel } from "@/lib/export";
import { useSelection } from "@/lib/use-selection";
import { api } from "@/lib/api-client";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "name", label: "Empresa" },
  { key: "sector", label: "Setor" },
  { key: "location", label: "Localização" },
  { key: "openings", label: "Vagas" },
  { key: "status", label: "Status" },
] as const;

export default function CompaniesPage() {
  const [list, setList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [fSector, setFSector] = useState("");
  const [fStatus, setFStatus] = useState("");

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
    await api.del(`/api/companies/${id}`);
    setList((prev) => prev.filter((e) => e.id !== id));
  }

  function exportSelected() {
    downloadExcel("empresas", [...COLUMNS], sel.selected);
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
          <AddButton onClick={() => setAddOpen(true)}>Nova empresa</AddButton>
        </>
      }
      searchPlaceholder="Buscar empresas..."
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
          placeholder="Todos os setores"
          options={sectors}
        />
        <FilterSelect
          value={fStatus}
          onChange={(v) => {
            setFStatus(v);
            setPage(1);
          }}
          placeholder="Todos os status"
          options={["Ativa", "Pausada"]}
        />
      </FilterBar>

      <Card>
        <CardHeader
          title={sel.active ? "Selecione para exportar" : "Empresas cadastradas"}
          subtitle={
            sel.active
              ? "Marque os itens e clique em Exportar"
              : `${filtered.length} no total`
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
            <Th>Empresa</Th>
            <Th>Setor</Th>
            <Th>Localização</Th>
            <Th>Vagas</Th>
            <Th>Status</Th>
            <Th>Ações</Th>
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
                    {e.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <Tooltip label="Editar">
                      <Button
                        variant="outline"
                        aria-label="Editar"
                        icon={<IconPencil className="h-4 w-4" />}
                        onClick={() => setEditing(e)}
                      />
                    </Tooltip>
                    <ConfirmAction
                      label="Remover"
                      icon={<IconTrash className="h-4 w-4" />}
                      confirmLabel="Confirmar"
                      onConfirm={() => remove(e.id)}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="p-2.5 text-center text-sm text-muted">
                  {loading ? "Carregando..." : "Nenhuma empresa encontrada."}
                </td>
              </tr>
            )}
          </Tbody>
        </Table>
        <CardFooter>
          <span className="text-xs text-muted">
            {visible.length === 0
              ? "0 resultados"
              : `${start + 1}–${start + visible.length} de ${filtered.length}`}
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
    </PageShell>
  );
}

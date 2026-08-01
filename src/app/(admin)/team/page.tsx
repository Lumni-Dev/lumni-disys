"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, Thead, Tbody, Th, Tr, Td } from "@/components/ui/table";
import { AddButton, Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { ExportButton } from "@/components/ui/export-button";
import { Tooltip } from "@/components/ui/tooltip";
import { IconPencil, IconTrash } from "@/components/ui/icons";
import { SelectionBar } from "@/components/ui/selection-bar";
import { FilterBar, FilterSelect } from "@/components/ui/filter-bar";
import { initials } from "@/lib/utils";
import { MemberModal } from "@/components/member-modal";
import { downloadExcel } from "@/lib/export";
import { useSelection } from "@/lib/use-selection";
import { api } from "@/lib/api-client";
import {
  countPermissions,
  pagesWithAccess,
  type Member,
} from "@/lib/permissions";

type MemberRow = Member & { id: number };

export default function TeamPage() {
  const [list, setList] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [fRole, setFRole] = useState("");

  useEffect(() => {
    api
      .get<MemberRow[]>("/api/team")
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const roles = [...new Set(list.map((c) => c.role).filter(Boolean))].sort();

  const q = query.trim().toLowerCase();
  const filtered = list.filter((c) => {
    const matchQuery =
      !q || [c.name, c.email, c.role].some((v) => v.toLowerCase().includes(q));
    return matchQuery && (!fRole || c.role === fRole);
  });

  const sel = useSelection(filtered, (c) => c.email);

  async function save(c: Member) {
    const existing = list.find((m) => m.email === c.email);
    if (existing) {
      const updated = await api.put<MemberRow>(`/api/team/${existing.id}`, c);
      setList((prev) =>
        prev.map((m) => (m.email === updated.email ? updated : m)),
      );
    } else {
      const created = await api.post<MemberRow>("/api/team", c);
      setList((prev) => [...prev, created]);
    }
  }

  async function remove(email: string) {
    const member = list.find((x) => x.email === email);
    if (!member) return;
    await api.del(`/api/team/${member.id}`);
    setList((prev) => prev.filter((x) => x.email !== email));
  }

  function exportSelected() {
    downloadExcel(
      "colaboradores",
      [
        { key: "name", label: "Nome" },
        { key: "email", label: "E-mail" },
        { key: "role", label: "Cargo" },
        { key: "pages", label: "Páginas com acesso" },
        { key: "permissions", label: "Total de permissões" },
      ],
      sel.selected.map((c) => ({
        name: c.name,
        email: c.email,
        role: c.role,
        pages: pagesWithAccess(c.permissions).join(", "),
        permissions: countPermissions(c.permissions).total,
      })),
    );
    sel.cancel();
  }

  const colSpan = 4 + (sel.active ? 1 : 0);

  return (
    <PageShell
      action={
        <>
          <ExportButton onClick={sel.start} />
          <AddButton onClick={() => setAddOpen(true)}>
            Convidar colaborador
          </AddButton>
        </>
      }
      searchPlaceholder="Buscar colaboradores..."
      searchValue={query}
      onSearchChange={setQuery}
    >
      <FilterBar hasFilters={!!fRole} onClear={() => setFRole("")}>
        <FilterSelect
          value={fRole}
          onChange={setFRole}
          placeholder="Todos os cargos"
          options={roles}
        />
      </FilterBar>

      <Card>
        <CardHeader
          title={sel.active ? "Selecione para exportar" : "Colaboradores"}
          subtitle={
            sel.active
              ? "Marque os itens e clique em Exportar"
              : `${list.length} com acesso ao sistema`
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
            <Th>Colaborador</Th>
            <Th>Cargo</Th>
            <Th>Acesso às páginas</Th>
            <Th>Ações</Th>
          </Thead>
          <Tbody>
            {filtered.map((c) => {
              const { pages, total } = countPermissions(c.permissions);
              const names = pagesWithAccess(c.permissions);
              return (
                <Tr key={c.email}>
                  {sel.active && (
                    <Td>
                      <Checkbox
                        checked={sel.ids.has(c.email)}
                        onChange={() => sel.toggle(c.email)}
                      />
                    </Td>
                  )}
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar tone="neutral">{initials(c.name)}</Avatar>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate font-medium text-foreground">{c.name}</p>
                        <p className="truncate text-xs text-muted">{c.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{c.role || "—"}</Td>
                  <Td>
                    {pages === 0 ? (
                      <span className="text-xs text-muted">Sem acesso</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {names.slice(0, 3).map((n) => (
                          <Badge key={n} tone="red">
                            {n}
                          </Badge>
                        ))}
                        {names.length > 3 && <Badge>+{names.length - 3}</Badge>}
                        <span className="text-xs text-muted">
                          · {total} permissões
                        </span>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Tooltip label="Editar">
                        <Button
                          variant="outline"
                          aria-label="Editar"
                          icon={<IconPencil className="h-4 w-4" />}
                          onClick={() => setEditing(c)}
                        />
                      </Tooltip>
                      <ConfirmAction
                        label="Remover"
                        icon={<IconTrash className="h-4 w-4" />}
                        confirmLabel="Confirmar"
                        onConfirm={() => remove(c.email)}
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="p-2.5 text-center text-sm text-muted">
                  {loading ? "Carregando..." : "Nenhum colaborador encontrado."}
                </td>
              </tr>
            )}
          </Tbody>
        </Table>
        <CardFooter>
          <span className="text-xs text-muted">
            {filtered.length} de {list.length}
          </span>
        </CardFooter>
      </Card>

      <MemberModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={save}
      />
      <MemberModal
        key={editing?.email ?? "edit"}
        open={!!editing}
        member={editing}
        onClose={() => setEditing(null)}
        onSave={save}
      />
    </PageShell>
  );
}

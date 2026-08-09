"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, Thead, Tbody, Th, Tr, Td } from "@/components/ui/table";
import { AddButton, IconButton } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { ExportButton } from "@/components/ui/export-button";
import { IconPencil, IconTrash } from "@/components/ui/icons";
import { SelectionBar } from "@/components/ui/selection-bar";
import { FilterBar, FilterSelect } from "@/components/ui/filter-bar";
import { initials } from "@/lib/utils";
import { MemberModal } from "@/components/member-modal";
import { downloadExcel } from "@/lib/export";
import { useSelection } from "@/lib/use-selection";
import { SkeletonRows } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api-client";
import { PlanLimitModal } from "@/components/plan-limit-modal";
import { useI18n } from "@/i18n/context";
import type { Admin } from "@/i18n/types";
import {
  countPermissions,
  MODULES,
  ACTIONS,
  type Member,
} from "@/lib/permissions";

type MemberRow = Member & { id: number };

export default function TeamPage() {
  const { admin } = useI18n();
  const [list, setList] = useState<MemberRow[]>([]);
  const [limitHit, setLimitHit] = useState(false);
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


  function accessNames(permissions: Member["permissions"]): string[] {
    return MODULES.filter((m) =>
      ACTIONS.some((a) => permissions[m.key]?.[a.key]),
    ).map((m) => admin.nav[m.key as keyof Admin["nav"]] ?? m.label);
  }

  async function save(c: Member) {
    const existing = list.find((m) => m.email === c.email);
    if (existing) {
      const updated = await api.put<MemberRow>(`/api/team/${existing.id}`, c);
      setList((prev) =>
        prev.map((m) => (m.email === updated.email ? updated : m)),
      );
    } else {
      try {
        const created = await api.post<MemberRow>("/api/team", c);
        setList((prev) => [...prev, created]);
      } catch (err) {

        if (err instanceof ApiError && err.status === 402) {
          setLimitHit(true);
          return;
        }
        throw err;
      }
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
      admin.team.fileName,
      [
        { key: "name", label: admin.team.exportCols.name },
        { key: "email", label: admin.team.exportCols.email },
        { key: "role", label: admin.team.exportCols.role },
        { key: "pages", label: admin.team.exportCols.pages },
        { key: "permissions", label: admin.team.exportCols.permissionsTotal },
      ],
      sel.selected.map((c) => ({
        name: c.name,
        email: c.email,
        role: c.role,
        pages: accessNames(c.permissions).join(", "),
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
            {admin.team.add}
          </AddButton>
        </>
      }
      searchPlaceholder={admin.team.searchPlaceholder}
      searchValue={query}
      onSearchChange={setQuery}
    >
      <FilterBar hasFilters={!!fRole} onClear={() => setFRole("")}>
        <FilterSelect
          value={fRole}
          onChange={setFRole}
          placeholder={admin.team.allRoles}
          options={roles}
        />
      </FilterBar>

      <Card>
        <CardHeader
          title={
            sel.active ? admin.common.selectToExport : admin.team.listTitle
          }
          subtitle={
            sel.active
              ? admin.common.markToExport
              : admin.team.withAccess(list.length)
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
            <Th>{admin.team.cols.member}</Th>
            <Th>{admin.team.cols.role}</Th>
            <Th>{admin.team.cols.pageAccess}</Th>
            <Th>{admin.common.actions}</Th>
          </Thead>
          <Tbody>
            {filtered.map((c) => {
              const { pages, total } = countPermissions(c.permissions);
              const names = accessNames(c.permissions);
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
                        <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
                          {c.name}
                          {c.status === "pending" && (
                            <Badge tone="amber">{admin.team.pending}</Badge>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted">{c.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{c.role || "-"}</Td>
                  <Td>
                    {pages === 0 ? (
                      <span className="text-xs text-muted">
                        {admin.team.noAccess}
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {names.slice(0, 3).map((n) => (
                          <Badge key={n} tone="red">
                            {n}
                          </Badge>
                        ))}
                        {names.length > 3 && <Badge>+{names.length - 3}</Badge>}
                        <span className="text-xs text-muted">
                          · {admin.team.permissions(total)}
                        </span>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <IconButton
                        label={admin.common.edit}
                        icon={<IconPencil className="h-4 w-4" />}
                        onClick={() => setEditing(c)}
                      />
                      <ConfirmAction
                        label={admin.common.remove}
                        icon={<IconTrash className="h-4 w-4" />}
                        onConfirm={() => remove(c.email)}
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })}
            {loading ? (
              <SkeletonRows cols={colSpan} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="p-2.5 text-center text-sm text-muted">
                  {admin.team.empty}
                </td>
              </tr>
            ) : null}
          </Tbody>
        </Table>
        <CardFooter>
          <span className="text-xs text-muted">
            {admin.team.footerRange(filtered.length, list.length)}
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
      <PlanLimitModal
        resource="members"
        open={limitHit}
        onClose={() => setLimitHit(false)}
      />
    </PageShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddButton, Button, IconButton } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconPencil,
  IconBriefcase,
  IconCheck,
  IconTrash,
} from "@/components/ui/icons";
import { WorkspaceModal } from "@/components/workspace-modal";
import { invalidateWorkspaces, type Workspace } from "@/lib/access";
import { api, ApiError } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";

export default function WorkspacesPage() {
  const { admin } = useI18n();
  const t = admin.workspace;
  const [list, setList] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Workspace | null>(null);

  const [blockedJobs, setBlockedJobs] = useState<number | null>(null);

  function load() {

    invalidateWorkspaces()
      .then((all) => setList(all.filter((w) => w.owner)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function activate(id: number) {
    void api
      .put("/api/workspaces", { id })
      .then(() => window.location.assign("/dashboard"))
      .catch(() => {});
  }

  async function remove(w: Workspace) {
    try {
      await api.del(`/api/workspaces/${w.id}`);

      if (w.active) {
        invalidateWorkspaces();
        window.location.assign("/dashboard");
        return;
      }
      load();
    } catch (err) {

      if (err instanceof ApiError && err.status === 409) {
        const data = err.data as { count?: number } | null;
        setBlockedJobs(data?.count ?? 0);
      }
    }
  }

  const q = query.trim().toLowerCase();
  const visible = list.filter(
    (w) => !q || (w.name || "").toLowerCase().includes(q),
  );

  return (
    <PageShell
      action={<AddButton onClick={() => setAddOpen(true)}>{t.create}</AddButton>}
      searchPlaceholder={t.searchPlaceholder}
      searchValue={query}
      onSearchChange={setQuery}
    >
      {loading && (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="flex flex-col gap-2.5 p-2.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((w) => (
          <Card key={w.id}>
            <CardHeader
              title={w.name || admin.sidebar.myWorkspace}
              action={w.active ? <Badge tone="green">{t.active}</Badge> : undefined}
            />
            <CardBody className="flex flex-wrap gap-2.5">
              <Badge>
                <IconBriefcase className="mr-1 h-3.5 w-3.5" />
                {t.jobsCount(w.jobCount)}
              </Badge>
            </CardBody>
            <CardFooter>
              {w.active ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <IconCheck className="h-4 w-4 text-accent" />
                  {t.active}
                </span>
              ) : (
                <Button variant="outline" onClick={() => activate(w.id)}>
                  {t.activate}
                </Button>
              )}
              <div className="flex items-center gap-1.5">
                <IconButton
                  label={admin.common.edit}
                  icon={<IconPencil className="h-4 w-4" />}
                  onClick={() => setEditing(w)}
                />
                <ConfirmAction
                  label={admin.common.remove}
                  message={t.deleteMessage}
                  icon={<IconTrash className="h-4 w-4" />}
                  onConfirm={() => remove(w)}
                />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!loading && visible.length === 0 && (
        <Card>
          <p className="p-2.5 text-center text-sm text-muted">{t.empty}</p>
        </Card>
      )}

      <WorkspaceModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={load}
      />
      <WorkspaceModal
        key={editing?.id ?? "edit"}
        open={!!editing}
        workspace={editing ? { id: editing.id, name: editing.name } : null}
        onClose={() => setEditing(null)}
        onSaved={load}
      />

      <Modal
        open={blockedJobs !== null}
        onClose={() => setBlockedJobs(null)}
        title={admin.common.remove}
        subtitle={t.deleteBlocked(blockedJobs ?? 0)}
      >
        <div className="flex justify-end p-2.5">
          <Button onClick={() => setBlockedJobs(null)}>
            {admin.common.close}
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}

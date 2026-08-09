"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { PlanLimitModal } from "@/components/plan-limit-modal";
import { api, ApiError } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";

export function WorkspaceModal({
  open,
  onClose,
  dismissable = true,
  workspace = null,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;

  dismissable?: boolean;

  workspace?: { id: number; name: string } | null;

  onSaved?: () => void;
}) {
  const { admin } = useI18n();
  const editing = !!workspace;
  const [name, setName] = useState(workspace?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(0);
  const [error, setError] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  useEffect(() => {
    if (open) setName(workspace?.name ?? "");
  }, [open, workspace?.id, workspace?.name]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      setInvalid((n) => n + 1);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      if (editing) {
        await api.patch(`/api/workspaces/${workspace!.id}`, {
          name: name.trim(),
        });
        onSaved?.();
        onClose();
      } else {
        await api.post("/api/workspaces", { name: name.trim() });
        if (onSaved) {
          onSaved();
          onClose();
        } else {
          window.location.assign("/dashboard");
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setLimitHit(true);
      } else {
        setError(true);
      }
      setBusy(false);
    }
  }

  return (
    <>
      <Modal
        open={open && !limitHit}
        onClose={dismissable ? onClose : () => {}}
        title={editing ? admin.workspace.editTitle : admin.workspace.createTitle}
        subtitle={
          editing ? admin.workspace.editSubtitle : admin.workspace.createSubtitle
        }
      >
        <form onSubmit={submit} noValidate>
          <div className="p-2.5">
            <Field label={admin.workspace.nameLabel} req>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={admin.workspace.namePlaceholder}
                invalid={invalid}
                autoFocus
              />
            </Field>
            {!editing && (
              <p className="mt-1.5 text-xs text-muted">{admin.workspace.hint}</p>
            )}
            {error && (
              <p className="mt-1.5 text-xs text-red-400">
                {admin.common.saveError}
              </p>
            )}
          </div>
          <ModalFooter
            loading={busy}
            submitLabel={editing ? admin.common.save : admin.workspace.create}
          />
        </form>
      </Modal>

      <PlanLimitModal
        resource="workspaces"
        open={limitHit}
        onClose={() => {
          setLimitHit(false);
          onClose();
        }}
      />
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { PlanLimitModal } from "@/components/plan-limit-modal";
import { api, ApiError } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";

// Modal de criacao de workspace (onboarding e botao "+" do menu). O nome
// sugerido e o da empresa. Ao criar, recarrega no dashboard do novo
// workspace. Se o plano Free ja atingiu o limite, abre o aviso de upgrade.
export function WorkspaceModal({
  open,
  onClose,
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  /** Onboarding (primeiro workspace) nao permite fechar sem criar. */
  dismissable?: boolean;
}) {
  const { admin } = useI18n();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(0);
  const [error, setError] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

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
      await api.post("/api/workspaces", { name: name.trim() });
      window.location.assign("/dashboard");
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
        title={admin.workspace.createTitle}
        subtitle={admin.workspace.createSubtitle}
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
            <p className="mt-1.5 text-xs text-muted">{admin.workspace.hint}</p>
            {error && (
              <p className="mt-1.5 text-xs text-red-400">
                {admin.common.saveError}
              </p>
            )}
          </div>
          <ModalFooter submitLabel={admin.workspace.create} />
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

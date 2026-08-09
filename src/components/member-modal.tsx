"use client";

import { useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { isEmail } from "@/lib/validation";
import { useI18n } from "@/i18n/context";
import type { Admin } from "@/i18n/types";
import {
  MODULES,
  ACTIONS,
  emptyPermissions,
  type Member,
  type Permissions,
} from "@/lib/permissions";

function PermissionsMatrix({
  value,
  onChange,
}: {
  value: Permissions;
  onChange: (v: Permissions) => void;
}) {
  const { admin } = useI18n();

  function toggle(module: string, action: string, checked: boolean) {
    onChange({
      ...value,
      [module]: { ...value[module], [action]: checked },
    });
  }

  function toggleRow(module: string, checked: boolean) {
    const row = Object.fromEntries(ACTIONS.map((a) => [a.key, checked]));
    onChange({ ...value, [module]: row });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
            <th className="p-2.5 font-medium">{admin.modals.page}</th>
            {ACTIONS.map((a) => (
              <th key={a.key} className="p-2.5 text-center font-medium">
                {admin.permissionActions[a.key] ?? a.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {MODULES.map((m) => {
            const row = value[m.key];
            const allChecked = ACTIONS.every((a) => row?.[a.key]);
            return (
              <tr key={m.key}>
                <td className="p-2.5">
                  <Checkbox
                    checked={allChecked}
                    onChange={(c) => toggleRow(m.key, c)}
                    label={admin.nav[m.key as keyof Admin["nav"]] ?? m.label}
                  />
                </td>
                {ACTIONS.map((a) => (
                  <td key={a.key} className="p-2.5 text-center">
                    <Checkbox
                      checked={!!row?.[a.key]}
                      onChange={(c) => toggle(m.key, a.key, c)}
                      className="justify-center"
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MemberModal({
  open,
  onClose,
  onSave,
  member,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (m: Member) => void;
  member?: Member | null;
}) {
  const { admin } = useI18n();
  const t = admin.modals.member;
  const editing = !!member;
  const [email, setEmail] = useState(member?.email ?? "");
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [permissions, setPermissions] = useState<Permissions>(
    member?.permissions ?? emptyPermissions(),
  );
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);
  const invalid = (k: string) => (errs[k] ? attempt : 0);

  const hasPermission = MODULES.some((m) =>
    ACTIONS.some((a) => permissions[m.key]?.[a.key]),
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const errors = {
      email: !isEmail(email),
      name: !name.trim(),
      role: !role.trim(),
      permissions: !hasPermission,
    };
    setErrs(errors);
    if (Object.values(errors).some(Boolean)) {
      setAttempt((a) => a + 1);
      return;
    }
    setSaveError(false);
    setBusy(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        permissions,
      });
      onClose();
    } catch {
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? t.editTitle : t.inviteTitle}
      subtitle={editing ? t.editSubtitle : t.inviteSubtitle}
    >
      <form onSubmit={submit}>
        <div className="flex flex-col gap-2.5 p-2.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Field label={t.email} full req>
              <Input
                type="email"
                invalid={invalid("email")}
                maxLength={200}
                readOnly={editing}
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={t.name} req>
              <Input
                invalid={invalid("name")}
                maxLength={160}
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={t.role} req>
              <Input
                invalid={invalid("role")}
                maxLength={120}
                placeholder={t.rolePlaceholder}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">
              {admin.modals.permissionsByPage}{" "}
              <span className="text-accent">*</span>
            </p>
            <PermissionsMatrix value={permissions} onChange={setPermissions} />
            {errs.permissions && (
              <p className="mt-1.5 text-xs text-accent">
                {admin.modals.selectOnePermission}
              </p>
            )}
          </div>
        </div>
        {saveError && (
          <p className="px-2.5 pb-1 text-xs text-red-400">
            {admin.common.saveError}
          </p>
        )}
        <ModalFooter onCancel={onClose} loading={busy} />
      </form>
    </Modal>
  );
}

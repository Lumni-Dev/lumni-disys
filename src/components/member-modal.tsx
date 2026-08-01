"use client";

import { useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
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
            <th className="p-2.5 font-medium">Página</th>
            {ACTIONS.map((a) => (
              <th key={a.key} className="p-2.5 text-center font-medium">
                {a.label}
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
                    label={m.label}
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
  const editing = !!member;
  const [email, setEmail] = useState(member?.email ?? "");
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [permissions, setPermissions] = useState<Permissions>(
    member?.permissions ?? emptyPermissions(),
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      permissions,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Editar colaborador" : "Convidar colaborador"}
      subtitle={
        editing
          ? "Ajuste os dados e as permissões de acesso"
          : "Adicione uma pessoa por e-mail e defina o que ela pode fazer"
      }
    >
      <form onSubmit={submit}>
        <div className="flex flex-col gap-2.5 p-2.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Field label="E-mail" full>
              <Input
                type="email"
                required
                readOnly={editing}
                placeholder="pessoa@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Nome">
              <Input
                required
                placeholder="Ex.: Ana Ribeiro"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Cargo">
              <Input
                required
                placeholder="Ex.: Recrutadora"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">
              Permissões por página
            </p>
            <PermissionsMatrix value={permissions} onChange={setPermissions} />
          </div>
        </div>
        <ModalFooter onCancel={onClose} />
      </form>
    </Modal>
  );
}

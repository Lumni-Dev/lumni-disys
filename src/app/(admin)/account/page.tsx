"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useProfile } from "@/components/profile-context";
import { api } from "@/lib/api-client";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Tooltip } from "@/components/ui/tooltip";
import { Avatar } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  IconLogout,
  IconCamera,
  IconGoogle,
  IconLinkedin,
  IconTrash,
} from "@/components/ui/icons";
import { initials, cx } from "@/lib/utils";
import { THEMES } from "@/lib/themes";
import { isPhone } from "@/lib/validation";
import { useAccess, useWorkspaces } from "@/lib/access";
import { useI18n } from "@/i18n/context";

export default function AccountPage() {
  const { admin } = useI18n();
  const { data: session } = useSession();
  const { photo, setPhoto, theme, setTheme, saveTheme } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);
  // So o dono do workspace ve a zona de perigo (excluir a conta inteira);
  // colaborador ve a opcao de sair do workspace ativo.
  const access = useAccess();
  const isOwner = !!access?.owner;
  const isMember = !!access && !access.owner;
  // Convidado sem workspace proprio pode criar o seu.
  const workspaces = useWorkspaces();
  const hasOwn = workspaces ? workspaces.some((w) => w.owner) : true;

  async function onSaveTheme() {
    setSavingTheme(true);
    await saveTheme(theme);
    setSavingTheme(false);
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2000);
  }

  const name = session?.user?.name ?? admin.sidebar.userFallback;
  const email = session?.user?.email ?? "";
  const image = photo ?? session?.user?.image ?? null;

  const [nameEdit, setNameEdit] = useState<string | null>(null);
  const [cargo, setCargo] = useState("Administrador");
  const [phone, setPhone] = useState("");
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const invalid = (k: string) => (errs[k] ? attempt : 0);
  const fullName = nameEdit ?? name;

  // Carrega os dados salvos do perfil (nome/telefone/cargo).
  useEffect(() => {
    api
      .get<{ name: string; phone: string; role: string }>("/api/profile")
      .then((d) => {
        if (d.name) setNameEdit(d.name);
        if (d.phone) setPhone(d.phone);
        if (d.role) setCargo(d.role);
      })
      .catch(() => {});
  }, []);

  async function submitProfile(e: FormEvent) {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedCargo = cargo.trim();
    const errors = {
      name: !trimmedName,
      phone: !isPhone(phone),
      cargo: !trimmedCargo,
    };
    setErrs(errors);
    if (Object.values(errors).some(Boolean)) {
      setAttempt((a) => a + 1);
      return;
    }
    setSavingProfile(true);
    try {
      await api.put("/api/profile", {
        name: trimmedName,
        phone,
        role: trimmedCargo,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Redimensiona no navegador (max 256px, JPEG) para nao guardar
      // megabytes de base64 no banco.
      const img = document.createElement("img");
      img.onload = async () => {
        const max = 256;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        setPhoto(base64);
        await api.put("/api/profile", { photo: base64 });
      };
      img.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  }

  return (
    <PageShell showSearch={false}>
      <Card>
        <form onSubmit={submitProfile} noValidate>
          <CardBody className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 sm:col-span-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
                aria-label={admin.account.changePhoto}
              >
                {image ? (
                  <img
                    src={image}
                    alt={admin.account.photoAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Avatar tone="solid" className="h-12 w-12 text-base">
                    {initials(name)}
                  </Avatar>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <IconCamera className="h-4 w-4 text-white" />
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPhoto}
                className="hidden"
              />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted">
                  {admin.account.clickPhoto}
                </p>
              </div>
            </div>
            <Field label={admin.account.fieldName} req>
              <Input
                value={fullName}
                onChange={(e) => setNameEdit(e.target.value)}
                invalid={invalid("name")}
                maxLength={160}
              />
            </Field>
            <Field label={admin.account.fieldPhone} req>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                invalid={invalid("phone")}
                placeholder="+55 11 99999-9999"
              />
            </Field>
            <Field label={admin.account.fieldRole} req>
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                invalid={invalid("cargo")}
                maxLength={120}
              />
            </Field>
          </CardBody>
          <CardFooter>
            <span className="text-xs text-muted">
              {admin.account.keepUpdated}
            </span>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile
                ? admin.common.saving
                : profileSaved
                  ? admin.common.saved
                  : admin.account.saveChanges}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader
          title={admin.account.themeTitle}
          subtitle={admin.account.themeSubtitle}
        />
        <CardBody className="flex flex-wrap items-center gap-2.5">
          {THEMES.map((t) => (
            <Tooltip key={t.key} label={t.label}>
              <button
                type="button"
                onClick={() => setTheme(t.key)}
                aria-label={t.label}
                aria-pressed={theme === t.key}
                className={cx(
                  "h-9 w-9 rounded-lg ring-2 ring-offset-2 ring-offset-surface transition",
                  theme === t.key
                    ? "ring-white"
                    : "ring-transparent hover:ring-white/30",
                )}
                style={{ backgroundColor: t.color }}
              />
            </Tooltip>
          ))}
        </CardBody>
        <CardFooter>
          <span className="text-xs text-muted">
            {admin.account.currentColor(
              THEMES.find((t) => t.key === theme)?.label ?? "",
            )}
          </span>
          <Button onClick={onSaveTheme} disabled={savingTheme}>
            {savingTheme
              ? admin.common.saving
              : themeSaved
                ? admin.common.saved
                : admin.account.saveTheme}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          title={admin.account.languageTitle}
          subtitle={admin.account.languageSubtitle}
        />
        <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-sm text-muted">
            {admin.account.languageLabel}
          </span>
          <LanguageSwitcher variant="card" />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2">
              {session?.provider === "linkedin" ? (
                <IconLinkedin className="h-5 w-5" />
              ) : (
                <IconGoogle className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-medium text-foreground">
                {admin.account.connectedAccount}
              </p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {isOwner && (
        <Card className="border-white/30">
          <CardHeader
            title={admin.account.dangerTitle}
            subtitle={admin.account.dangerSubtitle}
          />
          <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">
                {admin.account.deleteAccount}
              </p>
              <p className="text-xs text-muted">
                {admin.account.deleteAccountDesc}
              </p>
            </div>
            <ConfirmAction
              label={admin.account.deleteAccount}
              icon={<IconTrash className="h-4 w-4" />}
              confirmLabel={admin.account.confirmDelete}
              onConfirm={() => {
                void api
                  .del("/api/account")
                  .then(() => signOut({ redirectTo: "/" }))
                  .catch(() => {});
              }}
            />
          </CardBody>
        </Card>
      )}

      {!hasOwn && (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">
                {admin.account.createWorkspace}
              </p>
              <p className="text-xs text-muted">
                {admin.account.noOwnWorkspace}
              </p>
            </div>
            <Button
              onClick={() => {
                void api
                  .post("/api/workspaces", {})
                  .then(() => window.location.assign("/dashboard"))
                  .catch(() => {});
              }}
            >
              {admin.account.createWorkspace}
            </Button>
          </CardBody>
        </Card>
      )}

      {isMember && (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">
                {admin.account.leaveTitle}
              </p>
              <p className="text-xs text-muted">{admin.account.leaveDesc}</p>
            </div>
            <ConfirmAction
              label={admin.account.leaveTitle}
              onConfirm={() => {
                void api
                  .del("/api/workspaces")
                  .then(() => window.location.assign("/dashboard"))
                  .catch(() => {});
              }}
            />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">
              {admin.account.signOutTitle}
            </p>
            <p className="text-xs text-muted">
              {admin.account.signOutDesc}
            </p>
          </div>
          <Tooltip label={admin.account.signOutTitle}>
            <Button
              variant="outline"
              aria-label={admin.account.signOutTitle}
              icon={<IconLogout className="h-4 w-4" />}
              onClick={() => signOut({ redirectTo: "/login" })}
            />
          </Tooltip>
        </CardBody>
      </Card>
    </PageShell>
  );
}

"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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
import { WorkspaceModal } from "@/components/workspace-modal";
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


  const access = useAccess();
  const isOwner = !!access?.owner;
  const isMember = !!access && !access.owner;

  const workspaces = useWorkspaces();
  const hasOwn = workspaces ? workspaces.some((w) => w.owner) : true;
  const [wsModalOpen, setWsModalOpen] = useState(false);

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
  const [cargo, setCargo] = useState("");
  const [phone, setPhone] = useState("");
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const invalid = (k: string) => (errs[k] ? attempt : 0);
  const fullName = nameEdit ?? name;


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


  const tiles: {
    key: string;
    icon?: ReactNode;
    title: string;
    desc?: string;
    action?: ReactNode;
  }[] = [
    {
      key: "language",
      title: admin.account.languageTitle,
      desc: admin.account.languageSubtitle,
      action: <LanguageSwitcher variant="card" />,
    },
    {
      key: "connected",
      icon: (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2">
          {session?.provider === "linkedin" ? (
            <IconLinkedin className="h-5 w-5" />
          ) : (
            <IconGoogle className="h-5 w-5" />
          )}
        </div>
      ),
      title: admin.account.connectedAccount,
      desc: email,
    },
    {
      key: "signout",
      title: admin.account.signOutTitle,
      desc: admin.account.signOutDesc,
      action: (
        <Tooltip label={admin.account.signOutTitle}>
          <Button
            variant="outline"
            aria-label={admin.account.signOutTitle}
            icon={<IconLogout className="h-4 w-4" />}
            onClick={() => signOut({ redirectTo: "/login" })}
          />
        </Tooltip>
      ),
    },
  ];
  if (!hasOwn) {
    tiles.push({
      key: "create",
      title: admin.account.createWorkspace,
      desc: admin.account.noOwnWorkspace,
      action: (
        <Button onClick={() => setWsModalOpen(true)}>
          {admin.account.createWorkspace}
        </Button>
      ),
    });
  }
  if (isMember) {
    tiles.push({
      key: "leave",
      title: admin.account.leaveTitle,
      desc: admin.account.leaveDesc,
      action: (
        <ConfirmAction
          label={admin.account.leaveTitle}
          onConfirm={() => {
            void api
              .del("/api/workspaces")
              .then(() => window.location.assign("/dashboard"))
              .catch(() => {});
          }}
        />
      ),
    });
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
                    ? "ring-foreground"
                    : "ring-transparent hover:ring-hairline-strong",
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


      <div className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2">
        {tiles.map((t, i) => (
          <Card
            key={t.key}
            className={cx(
              "flex h-full flex-col",
              tiles.length % 2 === 1 &&
                i === tiles.length - 1 &&
                "sm:col-span-2",
            )}
          >
            <CardBody className="flex h-full flex-1 items-center justify-between gap-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                {t.icon}
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    {t.title}
                  </p>
                  {t.desc && (
                    <p className="truncate text-xs text-muted">{t.desc}</p>
                  )}
                </div>
              </div>
              {t.action && <div className="shrink-0">{t.action}</div>}
            </CardBody>
          </Card>
        ))}
      </div>

      {isOwner && (
        <Card className="border-hairline-strong">
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

      <WorkspaceModal
        open={wsModalOpen}
        onClose={() => setWsModalOpen(false)}
      />
    </PageShell>
  );
}

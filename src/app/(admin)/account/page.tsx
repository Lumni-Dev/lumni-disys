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
  IconTrash,
} from "@/components/ui/icons";
import { initials, cx } from "@/lib/utils";
import { THEMES } from "@/lib/themes";
import { isPhone } from "@/lib/validation";

export default function AccountPage() {
  const { data: session } = useSession();
  const { photo, setPhoto, theme, setTheme, saveTheme } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);

  async function onSaveTheme() {
    setSavingTheme(true);
    await saveTheme(theme);
    setSavingTheme(false);
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2000);
  }

  const name = session?.user?.name ?? "Usuário";
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
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhoto(base64);
      await api.put("/api/profile", { photo: base64 });
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
                aria-label="Trocar foto de perfil"
              >
                {image ? (
                  <img
                    src={image}
                    alt="Foto de perfil"
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
                <p className="text-xs text-muted">Clique na foto para alterar</p>
              </div>
            </div>
            <Field label="Nome completo" req>
              <Input
                value={fullName}
                onChange={(e) => setNameEdit(e.target.value)}
                invalid={invalid("name")}
                maxLength={160}
              />
            </Field>
            <Field label="Telefone" req>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                invalid={invalid("phone")}
                placeholder="+55 11 99999-9999"
              />
            </Field>
            <Field label="Cargo" req>
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
              Mantenha seus dados atualizados
            </span>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile
                ? "Gravando..."
                : profileSaved
                  ? "Gravado!"
                  : "Gravar alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Tema"
          subtitle="Escolha a cor de destaque do sistema"
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
            Cor atual: {THEMES.find((t) => t.key === theme)?.label}
          </span>
          <Button onClick={onSaveTheme} disabled={savingTheme}>
            {savingTheme ? "Gravando..." : themeSaved ? "Gravado!" : "Gravar tema"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          title="Idioma"
          subtitle="Escolha o idioma do site (salvo neste navegador)"
        />
        <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-sm text-muted">Idioma do site</span>
          <LanguageSwitcher variant="card" />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2">
              <IconGoogle className="h-5 w-5" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-medium text-foreground">
                Conta conectada
              </p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border-white/30">
        <CardHeader title="Zona de perigo" subtitle="Ações irreversíveis" />
        <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">Excluir conta</p>
            <p className="text-xs text-muted">
              Remove permanentemente sua conta e todos os dados associados.
            </p>
          </div>
          <ConfirmAction
            label="Excluir conta"
            icon={<IconTrash className="h-4 w-4" />}
            confirmLabel="Confirmar exclusão"
            onConfirm={() => {}}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">Sair da conta</p>
            <p className="text-xs text-muted">
              Encerrar sua sessão neste dispositivo.
            </p>
          </div>
          <Tooltip label="Sair da conta">
            <Button
              variant="outline"
              aria-label="Sair da conta"
              icon={<IconLogout className="h-4 w-4" />}
              onClick={() => signOut({ redirectTo: "/login" })}
            />
          </Tooltip>
        </CardBody>
      </Card>
    </PageShell>
  );
}

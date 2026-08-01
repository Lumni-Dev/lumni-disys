"use client";

import { useRef, type FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useProfile } from "@/components/profile-context";
import { api } from "@/lib/api-client";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Avatar } from "@/components/ui/avatar";
import { IconLogout, IconCamera, IconGoogle } from "@/components/ui/icons";
import { initials } from "@/lib/utils";

export default function AccountPage() {
  const { data: session } = useSession();
  const { photo, setPhoto } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const name = session?.user?.name ?? "Usuário";
  const email = session?.user?.email ?? "";
  const image = photo ?? session?.user?.image ?? null;

  const noop = (e: FormEvent) => e.preventDefault();

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
        <form onSubmit={noop}>
          <CardBody className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 sm:col-span-2">
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
            <Field label="Nome completo">
              <Input defaultValue={name} />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={email}
                readOnly
                className="cursor-not-allowed text-muted"
              />
            </Field>
            <Field label="Telefone">
              <PhoneInput placeholder="(11) 90000-0000" />
            </Field>
            <Field label="Cargo">
              <Input defaultValue="Administrador" />
            </Field>
          </CardBody>
          <CardFooter>
            <span className="text-xs text-muted">
              Mantenha seus dados atualizados
            </span>
            <Button type="submit">Salvar alterações</Button>
          </CardFooter>
        </form>
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

      <Card className="border-red/40">
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
          <Button
            variant="outline"
            icon={<IconLogout className="h-4 w-4" />}
            onClick={() => signOut({ redirectTo: "/login" })}
          >
            Sair
          </Button>
        </CardBody>
      </Card>
    </PageShell>
  );
}

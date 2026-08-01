import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { IconGoogle, IconLinkedin } from "@/components/ui/icons";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center p-2.5">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface">
        <div className="flex flex-col items-center gap-2.5 border-b border-border p-2.5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red shadow-lg shadow-red/30">
            <Image
              src="/logo-disys-white.png"
              alt="DISYS"
              width={48}
              height={48}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              DISYS
            </p>
            <p className="text-xs text-muted">Entre para acessar o sistema</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 p-2.5">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-red hover:bg-red/10"
            >
              <IconGoogle className="h-5 w-5" />
              Continuar com Google
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("linkedin", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-red hover:bg-red/10"
            >
              <IconLinkedin className="h-5 w-5" />
              Continuar com LinkedIn
            </button>
          </form>

          <p className="pt-1.5 text-center text-[11px] text-muted">
            Ao entrar você concorda com os termos de uso.
          </p>
        </div>
      </div>
    </div>
  );
}

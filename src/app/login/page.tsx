import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { IconGoogle, IconLinkedin } from "@/components/ui/icons";

function IconArrowLeft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-2.5">
      {/* Fundo decorativo, espelhado da home. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground opacity-[0.07] blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-foreground opacity-[0.05] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-foreground opacity-[0.05] blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface/80 shadow-2xl backdrop-blur">
        <div className="flex flex-col items-center gap-2.5 border-b border-border p-2.5 text-center">
          <p className="text-3xl font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
            DISYS
          </p>
          <p className="text-xs text-muted">Entre para acessar o sistema</p>
        </div>

        <div className="flex flex-col gap-2.5 p-2.5">
          {error && (
            <p className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-2 text-xs text-foreground">
              Não foi possível entrar. Verifique se o seu e-mail está visível no
              provedor (o LinkedIn pode ocultá-lo) e tente novamente, ou use o
              Google.
            </p>
          )}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
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
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
            >
              <IconLinkedin className="h-5 w-5" />
              Continuar com LinkedIn
            </button>
          </form>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <IconArrowLeft className="h-4 w-4" />
            Voltar para a home
          </Link>

          <p className="pt-1.5 text-center text-[11px] text-muted">
            Ao entrar você concorda com os termos de uso.
          </p>
        </div>
      </div>
    </div>
  );
}

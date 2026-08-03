import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginCard } from "@/components/login-card";

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
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.07] blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-lg bg-foreground opacity-[0.05] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-lg bg-foreground opacity-[0.05] blur-[120px]"
      />

      <LoginCard error={Boolean(error)} />
    </div>
  );
}

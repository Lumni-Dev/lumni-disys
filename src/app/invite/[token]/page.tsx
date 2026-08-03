import { auth } from "@/auth";
import { InviteCard } from "@/components/invite-card";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await auth();
  const { token } = await params;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-2.5">
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

      <InviteCard token={token} sessionEmail={session?.user?.email ?? null} />
    </div>
  );
}

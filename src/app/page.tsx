import { auth } from "@/auth";
import { LandingContent } from "@/components/landing-content";

export default async function LandingPage() {
  const session = await auth();
  return <LandingContent authed={Boolean(session)} />;
}

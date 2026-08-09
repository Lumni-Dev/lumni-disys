import { auth } from "@/auth";
import { LandingContent } from "@/components/landing-content";
import { priceCents } from "@/lib/stripe";

export default async function LandingPage() {
  const session = await auth();
  const prices = { plus: priceCents("plus"), max: priceCents("max") };
  return <LandingContent authed={Boolean(session)} prices={prices} />;
}

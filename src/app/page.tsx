import { auth } from "@/auth";
import { LandingContent } from "@/components/landing-content";
import { priceCents } from "@/lib/stripe";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export default async function LandingPage() {
  const session = await auth();
  const prices = { plus: priceCents("plus"), max: priceCents("max") };

  const brl = (cents: number) => (cents / 100).toFixed(2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: "Lumni",
        url: "https://lumni.dev.br",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#org` },
        offers: [
          { "@type": "Offer", name: "Free", price: "0", priceCurrency: "BRL" },
          {
            "@type": "Offer",
            name: "Plus",
            price: brl(prices.plus),
            priceCurrency: "BRL",
          },
          {
            "@type": "Offer",
            name: "Max",
            price: brl(prices.max),
            priceCurrency: "BRL",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingContent authed={Boolean(session)} prices={prices} />
    </>
  );
}

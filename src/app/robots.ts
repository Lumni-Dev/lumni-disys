import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Bloqueia o app autenticado, APIs e paginas utilitarias/privadas.
        disallow: [
          "/api/",
          "/dashboard",
          "/jobs",
          "/candidates",
          "/pipeline",
          "/team",
          "/account",
          "/plan",
          "/workspaces",
          "/careers/",
          "/invite/",
          "/login",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Nao adivinhar content-type de respostas.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // O app nao deve ser embutido em iframes (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Referrer minimo para fora do site.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Recursos sensiveis do navegador que o app nao usa.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

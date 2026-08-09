import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cartao OG/Twitter gerado dinamicamente (compartilhamento e Google Ads).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0b",
          color: "#f2f2f2",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: 400,
            width: 700,
            height: 500,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0))",
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 30,
            color: "#8a8a8a",
          }}
        >
          <div
            style={{ width: 14, height: 14, borderRadius: 7, background: "#f2f2f2", display: "flex" }}
          />
          <div style={{ display: "flex" }}>ATS · Recrutamento com IA</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: 18,
            marginTop: 28,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 42,
            color: "#cccccc",
            marginTop: 20,
            maxWidth: 960,
            lineHeight: 1.3,
          }}
        >
          Análise de currículos por IA. Vagas, candidatos e processos em um só
          fluxo.
        </div>
        <div
          style={{ display: "flex", marginTop: 44, fontSize: 28, color: "#8a8a8a" }}
        >
          disys.lumni.dev.br
        </div>
      </div>
    ),
    { ...size },
  );
}

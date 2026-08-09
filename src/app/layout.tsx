import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { AppGuards } from "@/components/app-guards";
import { LanguageProvider } from "@/i18n/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DISYS · ATS de Recursos Humanos",
  description:
    "ATS de Recursos Humanos: recrutamento e selecao com Empresas, Vagas, Candidatos e Processos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <head>

        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.setAttribute('data-theme',localStorage.getItem('disys-theme')==='dark'?'dark':'light')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full">
        <AppGuards />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

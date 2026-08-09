"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/context";

const YEAR = new Date().getFullYear();

const SERVICES_HREF = "https://lumni.dev.br/#servicos";

function IconMail({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm.5-.6 8.5 5.6 8.5-5.6" />
    </svg>
  );
}


export function SiteFooter() {
  const { dict } = useI18n();
  const f = dict.footer;
  const copyright = `© 2024 - ${YEAR} Lumni. ${f.rights}`;

  return (
    <footer className="relative z-10 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <a
              href="https://lumni.dev.br"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center"
            >
              <Image
                src="/images/logo-inverse.png"
                alt="Lumni"
                width={1200}
                height={600}
                className="h-9 w-auto"
                priority
              />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {f.description}
            </p>
          </div>

          <nav aria-label={f.servicesHeading}>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {f.servicesHeading}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {f.services.map((service) => (
                <li key={service}>
                  <a
                    href={SERVICES_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={f.contactHeading}>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {f.contactHeading}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <a
                  href="mailto:contact@lumni.dev.br"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <IconMail className="h-4 w-4 text-foreground" />
                  <span dir="ltr">contact@lumni.dev.br</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <div className="text-xs text-muted">
            <p>Lumni · Serviços Digitais · CNPJ 65.613.389/0001-96</p>
            <p className="mt-1">{copyright}</p>
          </div>
          <nav className="flex items-center gap-5 text-xs text-muted">
            <a
              href="https://lumni.dev.br/privacy"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {f.privacy}
            </a>
            <a
              href="https://lumni.dev.br/terms"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {f.terms}
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="transition-colors hover:text-foreground"
            >
              {f.backToTop}
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

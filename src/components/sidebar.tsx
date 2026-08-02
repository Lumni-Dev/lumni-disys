"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cx, initials, ACTIVE } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useSidebar } from "./sidebar-context";
import { useProfile } from "./profile-context";
import {
  IconDashboard,
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconFile,
  IconShield,
  IconChevronLeft,
  IconClose,
} from "@/components/ui/icons";

const nav = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/companies", label: "Empresas", Icon: IconBuilding },
  { href: "/jobs", label: "Vagas", Icon: IconBriefcase },
  { href: "/candidates", label: "Candidatos", Icon: IconUsers },
  { href: "/pipeline", label: "Processos", Icon: IconFile },
  { href: "/team", label: "Colaboradores", Icon: IconShield },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { photo } = useProfile();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } =
    useSidebar();
  const accountActive = pathname.startsWith("/account");
  const userName = session?.user?.name ?? "Usuário";
  const userEmail = session?.user?.email ?? "";
  const userImage = photo ?? session?.user?.image ?? null;
  const hide = collapsed ? "lg:hidden" : "";
  const close = () => setMobileOpen(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-56 shrink-0 flex-col border-r border-white/[0.05] bg-surface/70 shadow-[8px_0_24px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-56",
        )}
      >
        <div
          className={cx(
            "flex shrink-0 items-center gap-2.5 border-b border-white/[0.05] p-2.5",
            collapsed && "lg:justify-center",
          )}
        >
          {collapsed && (
            <span className="hidden rounded-lg bg-accent text-lg font-bold text-accent-foreground [font-family:var(--font-orbitron)] lg:mx-auto lg:flex lg:h-10 lg:w-10 lg:items-center lg:justify-center">
              D
            </span>
          )}
          <div className={cx("min-w-0 leading-tight", hide)}>
            <p className="truncate text-base font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
              DISYS
            </p>
            <p className="truncate text-xs text-muted">Recursos Humanos</p>
          </div>
          <button
            onClick={close}
            aria-label="Fechar menu"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:hidden"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="scroll-thin flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
          {nav.map(({ href, label, Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                title={collapsed ? label : undefined}
                className={cx(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  collapsed && "lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:p-0",
                  active
                    ? ACTIVE
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <Icon
                  className={cx("h-5 w-5 shrink-0", !active && "text-muted")}
                />
                <span className={hide}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleCollapsed}
          className={cx(
            "hidden shrink-0 items-center gap-2.5 border-t border-white/[0.05] px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:flex",
            collapsed && "lg:justify-center",
          )}
        >
          <IconChevronLeft
            className={cx(
              "h-5 w-5 shrink-0 transition-transform",
              collapsed && "rotate-180",
            )}
          />
          <span className={hide}>Recolher</span>
        </button>

        <div className="shrink-0 border-t border-white/[0.05] p-2.5">
          <Link
            href="/account"
            onClick={close}
            title={collapsed ? "Minha conta" : undefined}
            className={cx(
              "flex items-center gap-2.5 rounded-lg p-2 transition-colors",
              collapsed && "lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:p-0",
              accountActive
                ? "bg-surface-2 ring-1 ring-white/15"
                : "hover:bg-surface-2",
            )}
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt=""
                className="h-8 w-8 min-w-8 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <Avatar tone="neutral">{initials(userName)}</Avatar>
            )}
            <div className={cx("min-w-0 leading-tight", hide)}>
              <p className="truncate text-sm font-medium text-foreground">
                {userName}
              </p>
              <p className="truncate text-xs text-muted">{userEmail}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

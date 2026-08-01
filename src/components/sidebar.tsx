"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cx, initials, ACTIVE } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useSidebar } from "./sidebar-context";
import { useProfile } from "./profile-context";
import {
  IconDashboard,
  IconBell,
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconFile,
  IconShield,
  IconChevronLeft,
  IconClose,
} from "@/components/ui/icons";

const nav = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard, badge: 0 },
  { href: "/notifications", label: "Notificações", Icon: IconBell, badge: 3 },
  { href: "/companies", label: "Empresas", Icon: IconBuilding, badge: 0 },
  { href: "/jobs", label: "Vagas", Icon: IconBriefcase, badge: 0 },
  { href: "/candidates", label: "Candidatos", Icon: IconUsers, badge: 0 },
  { href: "/pipeline", label: "Processos", Icon: IconFile, badge: 0 },
  { href: "/team", label: "Colaboradores", Icon: IconShield, badge: 0 },
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
          "fixed inset-y-0 left-0 z-50 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-surface transition-all duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-56",
        )}
      >
        <div
          className={cx(
            "flex shrink-0 items-center gap-2.5 border-b border-border p-2.5",
            collapsed && "lg:justify-center",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red shadow-lg shadow-red/30">
            <Image
              src="/logo-disys-white.png"
              alt="DISYS"
              width={28}
              height={28}
              className="h-6 w-6 object-contain"
              priority
            />
          </div>
          <div className={cx("min-w-0 leading-tight", hide)}>
            <p className="truncate text-sm font-semibold tracking-wide text-foreground">
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
          {nav.map(({ href, label, Icon, badge }) => {
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
                  collapsed && "lg:justify-center",
                  active
                    ? ACTIVE
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <Icon
                  className={cx("h-5 w-5 shrink-0", !active && "text-muted")}
                />
                <span className={hide}>{label}</span>
                {badge > 0 && (
                  <span
                    className={cx(
                      "ml-auto flex h-5 min-w-5 items-center justify-center rounded-lg px-1.5 text-xs font-semibold",
                      active ? "bg-white/20 text-white" : "bg-red text-white",
                      hide,
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleCollapsed}
          className={cx(
            "hidden shrink-0 items-center gap-2.5 border-t border-border px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:flex",
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

        <div className="shrink-0 border-t border-border p-2.5">
          <Link
            href="/account"
            onClick={close}
            title={collapsed ? "Minha conta" : undefined}
            className={cx(
              "flex items-center gap-2.5 rounded-lg p-2 transition-colors",
              collapsed && "lg:justify-center",
              accountActive ? ACTIVE : "hover:bg-surface-2",
            )}
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt=""
                className="h-8 w-8 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <Avatar tone="neutral">{initials(userName)}</Avatar>
            )}
            <div className={cx("min-w-0 leading-tight", hide)}>
              <p
                className={cx(
                  "truncate text-sm font-medium",
                  accountActive ? "text-white" : "text-foreground",
                )}
              >
                {userName}
              </p>
              <p
                className={cx(
                  "truncate text-xs",
                  accountActive ? "text-white/70" : "text-muted",
                )}
              >
                {userEmail}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

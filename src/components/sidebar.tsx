"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cx, initials, ACTIVE } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { useColorScheme } from "@/lib/color-scheme";
import { useAccess, useWorkspaces } from "@/lib/access";
import { api } from "@/lib/api-client";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { useSidebar } from "./sidebar-context";
import { useProfile } from "./profile-context";
import {
  IconDashboard,
  IconBriefcase,
  IconUsers,
  IconFile,
  IconShield,
  IconChevronLeft,
  IconClose,
  IconCreditCard,
  IconBuilding,
  IconSun,
  IconMoon,
} from "@/components/ui/icons";
import type { Admin } from "@/i18n/types";

const nav: {
  href: string;
  key: keyof Admin["nav"];
  Icon: typeof IconDashboard;
}[] = [
  { href: "/dashboard", key: "dashboard", Icon: IconDashboard },
  { href: "/jobs", key: "jobs", Icon: IconBriefcase },
  { href: "/candidates", key: "candidates", Icon: IconUsers },
  { href: "/pipeline", key: "pipeline", Icon: IconFile },
  { href: "/team", key: "team", Icon: IconShield },
];

export function Sidebar() {
  const pathname = usePathname();
  const { admin } = useI18n();
  const { data: session } = useSession();
  const { photo } = useProfile();
  const access = useAccess();


  const items = access ? nav.filter((n) => access.modules.includes(n.key)) : nav;
  const workspaces = useWorkspaces();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } =
    useSidebar();
  const { scheme, toggle: toggleScheme } = useColorScheme();


  function switchWorkspace(v: string) {
    void api
      .put("/api/workspaces", { id: Number(v) })
      .then(() => window.location.assign("/dashboard"))
      .catch(() => {});
  }
  const accountActive = pathname.startsWith("/account");
  const planActive = pathname.startsWith("/plan");




  const [plan, setPlan] = useState<"free" | "plus" | "max" | null>(null);
  useEffect(() => {
    api
      .get<{ plan: "free" | "plus" | "max" }>("/api/plan")
      .then((d) => setPlan(d.plan))
      .catch(() => {});
    const onPlan = (e: Event) =>
      setPlan((e as CustomEvent<"free" | "plus" | "max">).detail);
    window.addEventListener("plan-updated", onPlan);
    return () => window.removeEventListener("plan-updated", onPlan);
  }, []);
  const userName = session?.user?.name ?? admin.sidebar.userFallback;
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


          "fixed inset-y-0 left-0 z-50 flex h-dvh w-56 shrink-0 flex-col border-r border-hairline bg-surface transition-all duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-56",
        )}
      >
        <div
          className={cx(
            "flex shrink-0 items-center gap-2.5 border-b border-hairline p-2.5",
            collapsed && "lg:justify-center",
          )}
        >
          {collapsed && (
            <span className="hidden rounded-lg bg-accent text-lg font-bold text-accent-foreground [font-family:var(--font-orbitron)] lg:mx-auto lg:flex lg:h-10 lg:w-10 lg:items-center lg:justify-center">
              D
            </span>
          )}
          <div className={cx("min-w-0 leading-tight", hide)}>
            <p className="truncate text-base font-semibold tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
              DISYS
            </p>
            <p className="truncate text-xs text-muted">
              {admin.sidebar.subtitle}
            </p>
          </div>
          <button
            onClick={close}
            aria-label={admin.sidebar.closeMenu}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:hidden"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {workspaces && workspaces.length > 0 && (
          <div
            className={cx(
              "flex shrink-0 flex-col gap-2 border-b border-hairline p-2.5",
              collapsed && "lg:hidden",
            )}
          >
            <Select
              value={String(workspaces.find((w) => w.active)?.id ?? "")}
              onChange={switchWorkspace}
              options={workspaces.map((w) => ({
                value: String(w.id),
                label:
                  w.name ||
                  (w.owner
                    ? admin.sidebar.myWorkspace
                    : w.ownerName || w.ownerEmail),
              }))}
            />
            <Link
              href="/workspaces"
              onClick={close}
              className={cx(
                "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                pathname.startsWith("/workspaces")
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <IconBuilding className="h-3.5 w-3.5 shrink-0" />
              {admin.workspace.title}
            </Link>
          </div>
        )}

        <nav className="scroll-thin flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
          {items.map(({ href, key, Icon }) => {
            const label = admin.nav[key];
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

        <div
          className={cx(
            "shrink-0 border-t border-hairline p-2.5",
            collapsed
              ? "flex flex-col items-center gap-1.5"
              : "flex items-center gap-1.5",
          )}
        >
          <button
            onClick={toggleCollapsed}
            className={cx(
              "hidden shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:flex",
              collapsed
                ? "lg:h-10 lg:w-10 lg:justify-center lg:p-0"
                : "flex-1",
            )}
          >
            <IconChevronLeft
              className={cx(
                "h-5 w-5 shrink-0 transition-transform",
                collapsed && "rotate-180",
              )}
            />
            <span className={hide}>{admin.sidebar.collapse}</span>
          </button>
          <button
            onClick={toggleScheme}
            aria-label={
              scheme === "dark"
                ? admin.sidebar.lightMode
                : admin.sidebar.darkMode
            }
            title={
              scheme === "dark"
                ? admin.sidebar.lightMode
                : admin.sidebar.darkMode
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:h-8 lg:w-8"
          >
            {scheme === "dark" ? (
              <IconSun className="h-4 w-4" />
            ) : (
              <IconMoon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="shrink-0 border-t border-hairline p-2.5">
          <Link
            href="/plan"
            onClick={close}
            title={collapsed ? admin.sidebar.plan : undefined}
            className={cx(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              collapsed &&
                "lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:p-0",
              planActive
                ? ACTIVE
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <IconCreditCard
              className={cx("h-5 w-5 shrink-0", !planActive && "text-muted")}
            />
            <span className={cx("flex-1", hide)}>{admin.sidebar.plan}</span>
            {plan && (
              <span
                className={cx(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  plan === "free"
                    ? "bg-surface-2 text-muted ring-1 ring-hairline"
                    : "bg-accent text-accent-foreground",
                  hide,
                )}
              >
                {plan === "max" ? "Max" : plan === "plus" ? "Plus" : "Free"}
              </span>
            )}
          </Link>
        </div>

        <div className="shrink-0 border-t border-hairline p-2.5">
          <Link
            href="/account"
            onClick={close}
            title={collapsed ? admin.sidebar.account : undefined}
            className={cx(
              "flex items-center gap-2.5 rounded-lg p-2 transition-colors",
              collapsed && "lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:p-0",
              accountActive
                ? "bg-surface-2 ring-1 ring-hairline-strong"
                : "hover:bg-surface-2",
            )}
          >
            {userImage ? (

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

"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ProfileProvider } from "./profile-context";
import { SidebarProvider } from "./sidebar-context";
import { Sidebar } from "./sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ProfileProvider>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
          </div>
        </SidebarProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}

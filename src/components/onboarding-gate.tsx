"use client";

import { useAccess } from "@/lib/access";
import { WorkspaceModal } from "@/components/workspace-modal";

export function OnboardingGate() {
  const access = useAccess();
  const needsWorkspace = !!access?.noWorkspace;
  return (
    <WorkspaceModal open={needsWorkspace} onClose={() => {}} dismissable={false} />
  );
}

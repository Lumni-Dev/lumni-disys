"use client";

import { useAccess } from "@/lib/access";
import { WorkspaceModal } from "@/components/workspace-modal";

// Ao entrar sem nenhum workspace, o usuario precisa criar o primeiro antes de
// usar o sistema (modal obrigatorio, sem como fechar).
export function OnboardingGate() {
  const access = useAccess();
  const needsWorkspace = !!access?.noWorkspace;
  return (
    <WorkspaceModal open={needsWorkspace} onClose={() => {}} dismissable={false} />
  );
}

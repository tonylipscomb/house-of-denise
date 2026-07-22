import type { WorkspaceRole } from "../supabase/types";

export function hasWorkspaceRole(actualRole: WorkspaceRole, allowedRoles: readonly WorkspaceRole[]) {
  return allowedRoles.includes(actualRole);
}

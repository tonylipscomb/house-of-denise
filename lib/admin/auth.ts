import "server-only";

import { NextResponse } from "next/server";
import {
  AuthorizationError,
  requireAdmin,
  requireAuthenticatedUser,
  requireOwner,
  requireWorkspaceRole,
  type AuthorizedWorkspace
} from "@/lib/launchpoint/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, Workspace, WorkspaceMembership, WorkspaceRole } from "@/lib/supabase/types";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { hasWorkspaceRole } from "@/lib/launchpoint/permissions";
import { ADMIN_DASHBOARD_ROLES, hasAdminPermission, type AdminPermission } from "./permissions";

export {
  AuthorizationError,
  requireAdmin,
  requireAuthenticatedUser,
  requireOwner,
  requireWorkspaceRole,
  type AuthorizedWorkspace
};

export async function requireDashboardAccess(returnTo = "/admin") {
  return requireWorkspaceRole(ADMIN_DASHBOARD_ROLES, HOUSE_OF_DENISE_WORKSPACE_ID, returnTo);
}

export async function requireAdminPermission(
  permission: AdminPermission,
  returnTo = "/admin"
) {
  const context = await requireDashboardAccess(returnTo);
  if (!hasAdminPermission(context.membership.role, permission)) {
    throw new AuthorizationError(
      `Your role "${context.membership.role}" cannot perform "${permission}".`
    );
  }
  return context;
}

type ApiAuthSuccess = { context: AuthorizedWorkspace; error: null };
type ApiAuthFailure = { context: null; error: NextResponse };

/**
 * Session + workspace role check for Route Handlers.
 * Never redirects — always returns JSON errors.
 * Uses the service-role client only on the server.
 */
export async function requireAdminApi(
  permission?: AdminPermission
): Promise<ApiAuthSuccess | ApiAuthFailure> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      context: null,
      error: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 }
      )
    };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return {
      context: null,
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 })
    };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return {
      context: null,
      error: NextResponse.json(
        { error: "Supabase admin client is not configured." },
        { status: 503 }
      )
    };
  }

  const [profileResult, workspaceResult, membershipResult] = await Promise.all([
    admin.from("profiles").select("*").eq("id", data.user.id).maybeSingle(),
    admin
      .from("workspaces")
      .select("*")
      .eq("id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .eq("status", "active")
      .maybeSingle(),
    admin
      .from("workspace_memberships")
      .select("*")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .eq("user_id", data.user.id)
      .eq("status", "active")
      .maybeSingle()
  ]);

  if (profileResult.error || workspaceResult.error || membershipResult.error) {
    return {
      context: null,
      error: NextResponse.json({ error: "Unable to verify admin session." }, { status: 500 })
    };
  }

  if (!workspaceResult.data || !membershipResult.data) {
    return {
      context: null,
      error: NextResponse.json({ error: "Admin access required." }, { status: 403 })
    };
  }

  const role = membershipResult.data.role as WorkspaceRole;
  if (!hasWorkspaceRole(role, ADMIN_DASHBOARD_ROLES)) {
    return {
      context: null,
      error: NextResponse.json({ error: "Admin access required." }, { status: 403 })
    };
  }

  if (permission && !hasAdminPermission(role, permission)) {
    return {
      context: null,
      error: NextResponse.json(
        { error: `Missing permission: ${permission}` },
        { status: 403 }
      )
    };
  }

  return {
    context: {
      userId: data.user.id,
      email: data.user.email ?? null,
      profile: profileResult.data as Profile | null,
      workspace: workspaceResult.data as Workspace,
      membership: membershipResult.data as WorkspaceMembership
    },
    error: null
  };
}

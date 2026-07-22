import "server-only";

import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, Workspace, WorkspaceMembership, WorkspaceRole } from "@/lib/supabase/types";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "./constants";
import { hasWorkspaceRole } from "./permissions";

export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to access this resource.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type AuthorizedWorkspace = {
  userId: string;
  email: string | null;
  profile: Profile | null;
  workspace: Workspace;
  membership: WorkspaceMembership;
};

function safeNext(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export function loginRedirectFor(pathname: string) {
  return `/login?next=${encodeURIComponent(safeNext(pathname))}`;
}

export async function requireAuthenticatedUser(returnTo = "/account") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(loginRedirectFor(returnTo));

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(loginRedirectFor(returnTo));

  return data.user;
}

export async function ensureHouseOfDeniseCustomer(userId: string, email: string | null, fullName?: string | null) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName ?? null
    },
    { onConflict: "id" }
  );

  await admin.from("workspace_memberships").upsert(
    {
      workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
      user_id: userId,
      role: "customer",
      status: "active"
    },
    { onConflict: "workspace_id,user_id", ignoreDuplicates: true }
  );
}

export async function requireWorkspaceMembership(workspaceId = HOUSE_OF_DENISE_WORKSPACE_ID, returnTo = "/account") {
  const user = await requireAuthenticatedUser(returnTo);
  const admin = getSupabaseAdminClient();
  if (!admin) throw new AuthorizationError("Supabase admin client is not configured.");

  const [{ data: profile }, { data: workspace }, { data: membership }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    admin.from("workspaces").select("*").eq("id", workspaceId).eq("status", "active").maybeSingle(),
    admin
      .from("workspace_memberships")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()
  ]);

  if (!workspace || !membership) throw new AuthorizationError();

  return {
    userId: user.id,
    email: user.email ?? null,
    profile,
    workspace,
    membership
  } satisfies AuthorizedWorkspace;
}

export async function requireWorkspaceRole(roles: readonly WorkspaceRole[], workspaceId = HOUSE_OF_DENISE_WORKSPACE_ID, returnTo = "/account") {
  const context = await requireWorkspaceMembership(workspaceId, returnTo);
  if (!hasWorkspaceRole(context.membership.role, roles)) throw new AuthorizationError();
  return context;
}

export async function requireAdmin() {
  return requireWorkspaceRole(["admin", "owner"], HOUSE_OF_DENISE_WORKSPACE_ID, "/admin");
}

export async function requireOwner() {
  return requireWorkspaceRole(["owner"], HOUSE_OF_DENISE_WORKSPACE_ID, "/admin");
}

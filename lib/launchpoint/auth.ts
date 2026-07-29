import "server-only";

import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Profile,
  Workspace,
  WorkspaceMembership,
  WorkspaceRole,
} from "@/lib/supabase/types";
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

function normalizeRole(value: unknown): WorkspaceRole {
  const role =
    typeof value === "string" ? value.trim().toLowerCase() : "customer";

  if (role === "owner" || role === "admin" || role === "staff") {
    return role;
  }

  return "customer";
}

export function loginRedirectFor(pathname: string) {
  const next = safeNext(pathname);
  if (next.startsWith("/admin")) {
    const destination = next === "/admin/login" ? "/admin" : next;
    return `/admin/login?next=${encodeURIComponent(destination)}`;
  }
  return `/login?next=${encodeURIComponent(next)}`;
}

export async function requireAuthenticatedUser(returnTo = "/account") {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error(
      "Supabase browser/server client is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect(loginRedirectFor(returnTo));
  }

  return data.user;
}

async function upsertHouseOfDeniseMembership(params: {
  userId: string;
  email: string | null;
  fullName?: string | null;
  role?: WorkspaceRole;
}) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    throw new Error(
      "Supabase admin client is not configured. Check SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const profileResult = await admin.from("profiles").upsert(
    {
      id: params.userId,
      email: params.email,
      full_name: params.fullName ?? null,
    },
    { onConflict: "id" },
  );

  if (profileResult.error) {
    throw new Error(
      `Unable to create the signed-in user's profile: ${profileResult.error.message}`,
    );
  }

  const existingResult = await admin
    .from("workspace_memberships")
    .select("id, role")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (existingResult.error) {
    throw new Error(
      `Unable to look up the signed-in user's workspace membership: ${existingResult.error.message}`,
    );
  }

  const requestedRole = params.role ?? "customer";
  const elevatedRoles = new Set<WorkspaceRole>(["staff", "admin", "owner"]);

  if (existingResult.data) {
    // Login/register flows call this with role=customer. Never downgrade staff/admin/owner.
    const nextRole =
      elevatedRoles.has(existingResult.data.role) && requestedRole === "customer"
        ? existingResult.data.role
        : requestedRole;

    const membershipResult = await admin
      .from("workspace_memberships")
      .update({
        role: nextRole,
        status: "active",
      })
      .eq("id", existingResult.data.id);

    if (membershipResult.error) {
      throw new Error(
        `Unable to update the signed-in user's workspace membership: ${membershipResult.error.message}`,
      );
    }

    return;
  }

  const membershipResult = await admin.from("workspace_memberships").insert({
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    user_id: params.userId,
    role: requestedRole,
    status: "active",
  });

  if (membershipResult.error) {
    throw new Error(
      `Unable to create the signed-in user's workspace membership: ${membershipResult.error.message}`,
    );
  }
}

export async function ensureHouseOfDeniseCustomer(
  userId: string,
  email: string | null,
  fullName?: string | null,
) {
  await upsertHouseOfDeniseMembership({
    userId,
    email,
    fullName,
    role: "customer",
  });
}

export async function requireWorkspaceMembership(
  workspaceId = HOUSE_OF_DENISE_WORKSPACE_ID,
  returnTo = "/account",
) {
  const user = await requireAuthenticatedUser(returnTo);
  const admin = getSupabaseAdminClient();

  if (!admin) {
    throw new Error(
      "Supabase admin client is not configured. Check SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const wait = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  const runWithRetry = async <T>(
    label: string,
    operation: () => PromiseLike<T>,
  ): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`[House of Denise] ${label} attempt ${attempt} failed`, {
          message: error instanceof Error ? error.message : String(error),
          cause:
            error instanceof Error && "cause" in error
              ? String(error.cause)
              : undefined,
          stack: error instanceof Error ? error.stack : undefined,
          node: process.version,
          supabaseUrl:
            process.env.NEXT_PUBLIC_SUPABASE_URL ??
            process.env.SUPABASE_URL ??
            "missing",
        });

        if (attempt < 3) await wait(attempt * 300);
      }
    }

    throw lastError;
  };

  const loadContext = async () => {
    const profileResult = await runWithRetry("profile lookup", () =>
      admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    );

    if (profileResult.error) {
      throw new Error(
        `Profile lookup failed: ${profileResult.error.message}` +
          (profileResult.error.details ? ` \u2014 ${profileResult.error.details}` : ""),
      );
    }

    const workspaceResult = await runWithRetry("workspace lookup", () =>
      admin
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .eq("status", "active")
        .maybeSingle(),
    );

    if (workspaceResult.error) {
      throw new Error(
        `Workspace lookup failed: ${workspaceResult.error.message}` +
          (workspaceResult.error.details ? ` \u2014 ${workspaceResult.error.details}` : ""),
      );
    }

    const membershipResult = await runWithRetry(
      "workspace membership lookup",
      () =>
        admin
          .from("workspace_memberships")
          .select("*")
          .eq("workspace_id", workspaceId)
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle(),
    );

    if (membershipResult.error) {
      throw new Error(
        `Workspace membership lookup failed: ${membershipResult.error.message}` +
          (membershipResult.error.details ? ` \u2014 ${membershipResult.error.details}` : ""),
      );
    }

    return {
      profile: profileResult.data,
      workspace: workspaceResult.data,
      membership: membershipResult.data,
    };
  };
  let context = await loadContext();

  /*
   * A verified user who reaches the House of Denise account area should have
   * a workspace membership. Repair missing rows automatically instead of
   * crashing the whole page with a generic AuthorizationError.
   */
  if (context.workspace && !context.membership) {
    await upsertHouseOfDeniseMembership({
      userId: user.id,
      email: user.email ?? null,
      fullName:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null,
      role: normalizeRole(user.app_metadata?.role),
    });

    context = await loadContext();
  }

  if (!context.workspace) {
    throw new Error(
      `The House of Denise workspace ${workspaceId} is missing or inactive in the configured Supabase project.`,
    );
  }

  if (!context.membership) {
    throw new AuthorizationError(
      `No active workspace membership exists for signed-in user ${user.email ?? user.id}.`,
    );
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: context.profile,
    workspace: context.workspace,
    membership: context.membership,
  } satisfies AuthorizedWorkspace;
}

export async function requireWorkspaceRole(
  roles: readonly WorkspaceRole[],
  workspaceId = HOUSE_OF_DENISE_WORKSPACE_ID,
  returnTo = "/account",
) {
  const context = await requireWorkspaceMembership(workspaceId, returnTo);

  if (!hasWorkspaceRole(context.membership.role, roles)) {
    throw new AuthorizationError(
      `Your workspace role "${context.membership.role}" cannot access this page.`,
    );
  }

  return context;
}

export async function requireAdmin() {
  return requireWorkspaceRole(
    ["admin", "owner"],
    HOUSE_OF_DENISE_WORKSPACE_ID,
    "/admin/login",
  );
}

export async function requireOwner() {
  return requireWorkspaceRole(
    ["owner"],
    HOUSE_OF_DENISE_WORKSPACE_ID,
    "/admin/login",
  );
}


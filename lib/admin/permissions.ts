import type { WorkspaceRole } from "@/lib/supabase/types";
import { hasWorkspaceRole } from "@/lib/launchpoint/permissions";

export const ADMIN_DASHBOARD_ROLES = ["admin", "owner"] as const satisfies readonly WorkspaceRole[];
export const STAFF_DASHBOARD_ROLES = ["staff", "admin", "owner"] as const satisfies readonly WorkspaceRole[];
export const OWNER_ONLY_ROLES = ["owner"] as const satisfies readonly WorkspaceRole[];

export type AdminPermission =
  | "dashboard:view"
  | "bookings:view"
  | "bookings:update"
  | "inquiries:view"
  | "inquiries:update"
  | "customers:view"
  | "payments:view"
  | "experiences:manage"
  | "packages:manage"
  | "products:manage"
  | "coupons:manage"
  | "newsletter:view"
  | "calendar:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly AdminPermission[]> = {
  customer: [],
  staff: [
    "dashboard:view",
    "bookings:view",
    "bookings:update",
    "inquiries:view",
    "inquiries:update",
    "customers:view",
    "payments:view",
    "calendar:manage",
    "newsletter:view"
  ],
  admin: [
    "dashboard:view",
    "bookings:view",
    "bookings:update",
    "inquiries:view",
    "inquiries:update",
    "customers:view",
    "payments:view",
    "experiences:manage",
    "packages:manage",
    "products:manage",
    "coupons:manage",
    "newsletter:view",
    "calendar:manage",
    "settings:manage"
  ],
  owner: [
    "dashboard:view",
    "bookings:view",
    "bookings:update",
    "inquiries:view",
    "inquiries:update",
    "customers:view",
    "payments:view",
    "experiences:manage",
    "packages:manage",
    "products:manage",
    "coupons:manage",
    "newsletter:view",
    "calendar:manage",
    "settings:manage"
  ]
};

export function canAccessAdminDashboard(role: WorkspaceRole) {
  return hasWorkspaceRole(role, ADMIN_DASHBOARD_ROLES);
}

export function hasAdminPermission(role: WorkspaceRole, permission: AdminPermission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export { hasWorkspaceRole };

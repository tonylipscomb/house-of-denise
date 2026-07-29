import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { AuthorizationError, requireAdmin } from "@/lib/admin/auth";

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let context;
  try {
    context = await requireAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/admin/login?status=admin-required");
    }
    throw error;
  }

  return (
    <DashboardShell
      workspaceName={context.workspace.name}
      userLabel={context.profile?.full_name || context.email || "Admin"}
      role={context.membership.role}
    >
      {children}
    </DashboardShell>
  );
}

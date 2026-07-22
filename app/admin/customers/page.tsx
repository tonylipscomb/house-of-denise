import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/launchpoint/auth";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({ title: "Admin Customers", description: "View workspace customers.", path: "/admin/customers" });

export default async function AdminCustomersPage() {
  const context = await requireAdmin();
  const admin = getSupabaseAdminClient();
  const { data: customers } = admin
    ? await admin.from("workspace_memberships").select("user_id, role, status, profiles(full_name,email,phone)").eq("workspace_id", context.workspace.id).eq("role", "customer")
    : { data: [] };

  return (
    <>
      <header className="admin-page-header"><div><p className="eyebrow">Customers</p><h1>Customer accounts</h1></div></header>
      {customers?.length ? <pre>{JSON.stringify(customers, null, 2)}</pre> : <div className="empty-state"><h2 className="empty-state__title">No customers yet</h2><p className="empty-state__description">New registrations are assigned customer membership in this workspace.</p></div>}
    </>
  );
}

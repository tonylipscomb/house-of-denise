import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/launchpoint/auth";
import { deactivateServiceAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Services",
  description: "Manage House Of Denise services.",
  path: "/admin/services"
});

export default async function AdminServicesPage() {
  const context = await requireAdmin();
  const admin = getSupabaseAdminClient();
  const { data: services } = admin
    ? await admin.from("services").select("*").eq("workspace_id", context.workspace.id).order("sort_order").order("name")
    : { data: [] };

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Services</p>
          <h1>Configure booking services</h1>
        </div>
        <Button href="/admin/services/new">New service</Button>
      </header>
      {services?.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Mode</th><th>Status</th><th>Setup</th><th>Actions</th></tr></thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td><Link href={`/admin/services/${service.id}`}>{service.name}</Link></td>
                  <td>{service.booking_mode}</td>
                  <td>{service.active ? "Active" : "Inactive"}</td>
                  <td>{service.booking_mode === "direct" ? "Availability and payment required" : "Inquiry workflow"}</td>
                  <td>
                    <form action={deactivateServiceAction}>
                      <input type="hidden" name="id" value={service.id} />
                      <Button type="submit" variant="text">Deactivate</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h2 className="empty-state__title">No services configured</h2>
          <p className="empty-state__description">Create services before direct booking can be enabled.</p>
          <Button href="/admin/services/new">Create first service</Button>
        </div>
      )}
    </>
  );
}

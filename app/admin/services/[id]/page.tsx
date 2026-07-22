import { notFound } from "next/navigation";
import { ServiceForm, VariantForm } from "@/components/admin/ServiceForm";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/launchpoint/auth";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Edit Service",
  description: "Edit a House Of Denise booking service.",
  path: "/admin/services"
});

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireAdmin();
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();

  const [{ data: service }, { data: variants }] = await Promise.all([
    admin.from("services").select("*").eq("workspace_id", context.workspace.id).eq("id", id).maybeSingle(),
    admin.from("service_variants").select("*").eq("workspace_id", context.workspace.id).eq("service_id", id).order("sort_order")
  ]);

  if (!service) notFound();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Services</p>
          <h1>{service.name}</h1>
        </div>
      </header>
      <section className="admin-panel">
        <h2>Service details</h2>
        <ServiceForm service={service} />
      </section>
      <section className="admin-panel">
        <h2>Variants</h2>
        {variants?.length ? (
          <div className="variant-stack">
            {variants.map((variant) => (
              <details key={variant.id} className="variant-card">
                <summary>{variant.name}</summary>
                <VariantForm serviceId={service.id} variant={variant} />
              </details>
            ))}
          </div>
        ) : (
          <p className="admin-muted">No variants configured yet. Direct booking remains disabled until duration, pricing, payment, and availability are complete.</p>
        )}
        <h3>Add variant</h3>
        <VariantForm serviceId={service.id} />
      </section>
    </>
  );
}

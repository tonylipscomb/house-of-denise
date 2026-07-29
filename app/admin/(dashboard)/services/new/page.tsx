import { ServiceForm } from "@/components/admin/ServiceForm";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "New Service",
  description: "Create a House Of Denise booking service.",
  path: "/admin/services/new"
});

export default function NewServicePage() {
  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Services</p>
          <h1>New service</h1>
        </div>
      </header>
      <section className="admin-panel">
        <ServiceForm />
      </section>
    </>
  );
}

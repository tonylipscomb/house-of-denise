import { requireAdmin } from "@/lib/admin/auth";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "Admin Newsletter",
  description: "Newsletter subscribers.",
  path: "/admin/newsletter"
});

export default async function AdminNewsletterPage() {
  await requireAdmin();
  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Phase 3</p>
          <h1>Newsletter</h1>
          <p>Subscriber list, sources, and active/unsubscribed status.</p>
        </div>
      </header>
      <p className="lp-phase-note">
        Newsletter signups are not persisted server-side yet (footer/shop notify
        currently use client storage). Subscriber admin arrives in Phase 3 after
        a durable table and API exist.
      </p>
    </>
  );
}

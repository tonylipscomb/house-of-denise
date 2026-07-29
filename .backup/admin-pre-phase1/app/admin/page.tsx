import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/launchpoint/auth";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "House Of Denise admin dashboard.",
  path: "/admin"
});

export default async function AdminDashboardPage() {
  const context = await requireAdmin();
  const admin = getSupabaseAdminClient();

  const [services, directServices, inquiryServices, customers, bookings, inquiries] = admin
    ? await Promise.all([
        admin.from("services").select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).eq("active", true),
        admin.from("services").select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).eq("booking_mode", "direct").eq("active", true),
        admin.from("services").select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).eq("booking_mode", "inquiry").eq("active", true),
        admin.from("workspace_memberships").select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).eq("role", "customer").eq("status", "active"),
        admin.from("bookings").select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id),
        admin.from("booking_inquiries").select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).eq("inquiry_status", "new")
      ])
    : [];

  const stats = [
    ["Active services", services?.count ?? 0],
    ["Direct-booking services", directServices?.count ?? 0],
    ["Inquiry-only services", inquiryServices?.count ?? 0],
    ["Active customers", customers?.count ?? 0],
    ["Total bookings", bookings?.count ?? 0],
    ["Pending inquiries", inquiries?.count ?? 0]
  ] as const;

  const checklist = [
    { label: "Complete Business Profile", done: Boolean(context.workspace.email && context.workspace.phone) },
    { label: "Configure Services", done: (services?.count ?? 0) > 0 },
    { label: "Add Service Durations", done: false },
    { label: "Configure Pricing and Deposits", done: false },
    { label: "Add Staff", done: false },
    { label: "Set Availability", done: false },
    { label: "Add Cancellation Policy", done: false },
    { label: "Connect Square", done: false },
    { label: "Verify Booking Email", done: Boolean(process.env.BOOKING_NOTIFICATION_EMAIL) },
    { label: "Enable Direct Booking", done: false }
  ];

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Booking foundation</h1>
        </div>
      </header>
      <div className="admin-stats">
        {stats.map(([label, value]) => (
          <article className="admin-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="admin-panel" aria-labelledby="setup-title">
        <h2 id="setup-title">Owner setup checklist</h2>
        <ul className="checklist">
          {checklist.map((item) => (
            <li key={item.label}>
              <span className={item.done ? "status-dot status-dot--done" : "status-dot"} aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{item.done ? "Ready" : "Needed"}</strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireWorkspaceMembership } from "@/lib/launchpoint/auth";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Account Bookings",
  description: "View your House Of Denise bookings.",
  path: "/account/bookings"
});

export default async function AccountBookingsPage() {
  const context = await requireWorkspaceMembership(undefined, "/account/bookings");
  const admin = getSupabaseAdminClient();
  const { data: bookings } = admin
    ? await admin.from("bookings").select("*").eq("workspace_id", context.workspace.id).eq("customer_id", context.userId).order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="account-page" aria-labelledby="bookings-title">
      <p className="eyebrow">Bookings</p>
      <h1 id="bookings-title">Your bookings</h1>
      {bookings?.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Reference</th><th>Status</th><th>Payment</th><th>Start</th></tr></thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.reference_number}</td>
                  <td>{booking.status}</td>
                  <td>{booking.payment_status}</td>
                  <td>{booking.start_at ? new Date(booking.start_at).toLocaleString() : "Not scheduled"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h2 className="empty-state__title">No bookings yet</h2>
          <p className="empty-state__description">Direct booking will appear here after availability, staff schedules, and payment handling are configured.</p>
        </div>
      )}
    </section>
  );
}

import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { requireAdmin } from "@/lib/launchpoint/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { formatUsdFromCents } from "@/data/booking-catalog";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Bookings",
  description: "Manage House of Denise experience bookings.",
  path: "/admin/bookings"
});

export default async function AdminBookingsPage() {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const { data: bookings } = admin
    ? await admin
        .from("bookings")
        .select(
          "id, reference_number, guest_name, guest_email, guest_phone, experience_slug, package_slug, start_at, venue_name, guest_count, status, payment_status, subtotal_cents, deposit_amount_cents, remaining_balance_cents, square_checkout_id, created_at"
        )
        .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <section className="admin-page" aria-labelledby="admin-bookings-title">
      <p className="eyebrow">Operations</p>
      <h1 id="admin-bookings-title">Bookings</h1>
      <p>Website booking wizard reservations and payment status.</p>

      {!bookings?.length ? (
        <div className="empty-state">
          <h2 className="empty-state__title">No bookings yet</h2>
          <p className="empty-state__description">
            New bookings from `/booking` will appear here after checkout is started.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Experience</th>
                <th>When</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Subtotal</th>
                <th>Remaining</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.reference_number}</td>
                  <td>
                    <div>{booking.guest_name}</div>
                    <small>{booking.guest_email}</small>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {String(booking.experience_slug ?? "—").replaceAll("-", " ")}
                    <div>
                      <small>{booking.package_slug}</small>
                    </div>
                  </td>
                  <td>
                    {booking.start_at
                      ? new Date(booking.start_at).toLocaleString()
                      : "Unscheduled"}
                  </td>
                  <td>{booking.status}</td>
                  <td>{booking.payment_status}</td>
                  <td>{formatUsdFromCents(booking.subtotal_cents ?? 0)}</td>
                  <td>{formatUsdFromCents(booking.remaining_balance_cents ?? 0)}</td>
                  <td>
                    <Link href={`/admin/bookings/${booking.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

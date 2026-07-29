import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import { requireAdmin } from "@/lib/launchpoint/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { formatUsdFromCents } from "@/data/booking-catalog";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Booking Detail",
  description: "Admin booking detail.",
  path: "/admin/bookings"
});

export default async function AdminBookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();

  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("id", id)
    .maybeSingle();

  if (!booking) notFound();

  const { data: upgrades } = await admin
    .from("booking_upgrades")
    .select("*")
    .eq("booking_id", booking.id);

  const { data: history } = await admin
    .from("booking_status_history")
    .select("*")
    .eq("booking_id", booking.id)
    .order("created_at", { ascending: false });

  return (
    <section className="admin-page">
      <p className="eyebrow">Booking</p>
      <h1>{booking.reference_number}</h1>
      <p>
        {booking.guest_name} · {booking.guest_email} · {booking.guest_phone}
      </p>

      <div className="table-wrap" style={{ marginTop: "1.5rem" }}>
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Experience</th>
              <td>{booking.experience_slug}</td>
            </tr>
            <tr>
              <th>Package</th>
              <td>{booking.package_slug}</td>
            </tr>
            <tr>
              <th>Schedule</th>
              <td>
                {booking.start_at
                  ? `${new Date(booking.start_at).toLocaleString()} – ${
                      booking.end_at ? new Date(booking.end_at).toLocaleString() : ""
                    }`
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>Venue</th>
              <td>
                {booking.venue_name}
                <br />
                {booking.event_address}
              </td>
            </tr>
            <tr>
              <th>Guests</th>
              <td>{booking.guest_count}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                {booking.status} / {booking.payment_status}
              </td>
            </tr>
            <tr>
              <th>Totals</th>
              <td>
                Package {formatUsdFromCents(booking.package_price_cents ?? 0)} · Upgrades{" "}
                {formatUsdFromCents(booking.upgrade_total_cents ?? 0)} · Fee{" "}
                {formatUsdFromCents(booking.service_fee_cents ?? 0)} · Subtotal{" "}
                {formatUsdFromCents(booking.subtotal_cents ?? 0)}
              </td>
            </tr>
            <tr>
              <th>Deposit / Remaining</th>
              <td>
                {formatUsdFromCents(booking.deposit_amount_cents ?? 0)} /{" "}
                {formatUsdFromCents(booking.remaining_balance_cents ?? 0)}
              </td>
            </tr>
            <tr>
              <th>Square</th>
              <td>{booking.square_checkout_id || "—"}</td>
            </tr>
            <tr>
              <th>Notes</th>
              <td>
                {booking.special_requests || "—"}
                <br />
                {booking.accessibility_needs}
                <br />
                {booking.additional_notes}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Upgrades</h2>
      {!upgrades?.length ? (
        <p>No upgrades selected.</p>
      ) : (
        <ul>
          {upgrades.map((upgrade) => (
            <li key={upgrade.id}>
              {upgrade.name} × {upgrade.quantity}
              {upgrade.quoted_separately
                ? " (quoted separately)"
                : ` — ${formatUsdFromCents(upgrade.line_total_cents ?? 0)}`}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "2rem" }}>Activity</h2>
      {!history?.length ? (
        <p>No status history yet.</p>
      ) : (
        <ul>
          {history.map((item) => (
            <li key={item.id}>
              {item.old_status ?? "—"} → {item.new_status} ·{" "}
              {new Date(item.created_at).toLocaleString()}
              {item.reason ? ` · ${item.reason}` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireWorkspaceMembership } from "@/lib/launchpoint/auth";
import { formatUsdFromCents } from "@/data/booking-catalog";
import { Button } from "@/components/ui/Button";

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
    ? await admin
        .from("bookings")
        .select(
          "id, reference_number, status, payment_status, start_at, experience_slug, package_slug, guest_count, venue_name, amount_paid_cents, remaining_balance_cents, subtotal_cents, deposit_amount_cents, payment_option"
        )
        .eq("workspace_id", context.workspace.id)
        .eq("customer_id", context.userId)
        .order("created_at", { ascending: false })
    : { data: [] };

  const nowMs = Date.parse(new Date().toISOString());
  const upcoming =
    bookings?.filter(
      (booking) =>
        booking.start_at &&
        new Date(booking.start_at).getTime() >= nowMs &&
        !["cancelled", "declined", "completed"].includes(booking.status)
    ) ?? [];
  const past =
    bookings?.filter(
      (booking) =>
        !booking.start_at ||
        new Date(booking.start_at).getTime() < nowMs ||
        ["cancelled", "declined", "completed"].includes(booking.status)
    ) ?? [];

  return (
    <section className="account-page" aria-labelledby="bookings-title">
      <p className="eyebrow">Bookings</p>
      <h1 id="bookings-title">Your bookings</h1>
      <p>
        <Button href="/booking" variant="outline" size="sm">
          Book another experience
        </Button>
      </p>

      {!bookings?.length ? (
        <div className="empty-state">
          <h2 className="empty-state__title">No bookings yet</h2>
          <p className="empty-state__description">
            When you reserve a fragrance experience, it will appear here with payment and event
            details.
          </p>
          <Button href="/booking" variant="primary">
            Start booking
          </Button>
        </div>
      ) : (
        <>
          <BookingGroup title="Upcoming" items={upcoming} />
          <BookingGroup title="Past & other" items={past} />
        </>
      )}
    </section>
  );
}

function BookingGroup({
  title,
  items
}: {
  title: string;
  items: Array<Record<string, unknown>>;
}) {
  if (!items.length) return null;
  return (
    <div className="table-wrap" style={{ marginTop: "1.5rem" }}>
      <h2>{title}</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Experience</th>
            <th>Status</th>
            <th>Payment</th>
            <th>When</th>
            <th>Balance</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((booking) => (
            <tr key={String(booking.id)}>
              <td>{String(booking.reference_number)}</td>
              <td style={{ textTransform: "capitalize" }}>
                {String(booking.experience_slug ?? "—").replaceAll("-", " ")}
              </td>
              <td>{String(booking.status)}</td>
              <td>{String(booking.payment_status)}</td>
              <td>
                {booking.start_at
                  ? new Date(String(booking.start_at)).toLocaleString()
                  : "Not scheduled"}
              </td>
              <td>{formatUsdFromCents(Number(booking.remaining_balance_cents ?? 0))}</td>
              <td>
                <Link href="/contact">Contact</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import Link from "next/link";
import type { AdminBookingListRow } from "@/lib/admin/dashboard-types";
import {
  bookingStatusLabel,
  bookingStatusTone,
  paymentStatusLabel,
  paymentStatusTone
} from "@/lib/admin/booking-status";
import {
  formatDateTime,
  formatUsdFromCents,
  humanizeSlug
} from "@/lib/admin/dashboard-utils";
import { StatusBadge } from "./StatusBadge";

type Props = {
  rows: AdminBookingListRow[];
};

export function BookingTable({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="lp-empty-state">
        <h3>No bookings found</h3>
        <p>Try adjusting filters, or create a booking from the public wizard.</p>
      </div>
    );
  }

  return (
    <>
      <div className="lp-table-wrap lp-table-wrap--desktop">
        <table className="lp-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Experience</th>
              <th>Package</th>
              <th>Event date</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Deposit</th>
              <th>Total</th>
              <th>Remaining</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <code className="lp-code">{row.referenceNumber}</code>
                </td>
                <td>
                  <div className="lp-stack-tight">
                    <strong>{row.customerName}</strong>
                    <span>{row.customerEmail}</span>
                  </div>
                </td>
                <td>{humanizeSlug(row.experienceSlug)}</td>
                <td>{humanizeSlug(row.packageSlug)}</td>
                <td>{formatDateTime(row.eventDate)}</td>
                <td>{row.guestCount ?? "—"}</td>
                <td>
                  <StatusBadge
                    label={bookingStatusLabel(row.status, row.paymentStatus)}
                    tone={bookingStatusTone(row.status)}
                  />
                </td>
                <td>
                  <StatusBadge
                    label={paymentStatusLabel(row.paymentStatus)}
                    tone={paymentStatusTone(row.paymentStatus)}
                  />
                </td>
                <td>{formatUsdFromCents(row.totalCents)}</td>
                <td>{formatUsdFromCents(row.remainingCents)}</td>
                <td>{formatDateTime(row.updatedAt)}</td>
                <td>
                  <Link href={`/admin/bookings/${row.id}`} className="lp-table__link">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="lp-card-list lp-card-list--mobile">
        {rows.map((row) => (
          <li key={row.id} className="lp-mobile-card">
            <div className="lp-mobile-card__top">
              <code className="lp-code">{row.referenceNumber}</code>
              <StatusBadge
                label={bookingStatusLabel(row.status, row.paymentStatus)}
                tone={bookingStatusTone(row.status)}
              />
            </div>
            <strong>{row.customerName}</strong>
            <p>
              {humanizeSlug(row.experienceSlug)} · {formatDateTime(row.eventDate)}
            </p>
            <p>
              Total {formatUsdFromCents(row.totalCents)} · Remaining{" "}
              {formatUsdFromCents(row.remainingCents)}
            </p>
            <Link href={`/admin/bookings/${row.id}`} className="lp-table__link">
              Open booking
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

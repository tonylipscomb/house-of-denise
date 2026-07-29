import Link from "next/link";
import type { AdminInquiryListRow } from "@/lib/admin/dashboard-types";
import {
  inquiryStatusLabel,
  inquiryStatusTone
} from "@/lib/admin/inquiry-status";
import { formatShortDate, humanizeSlug } from "@/lib/admin/dashboard-utils";
import { StatusBadge } from "./StatusBadge";

type Props = {
  rows: AdminInquiryListRow[];
  focusId?: string;
};

export function InquiryTable({ rows, focusId }: Props) {
  if (!rows.length) {
    return (
      <div className="lp-empty-state">
        <h3>No inquiries found</h3>
        <p>New submissions from the booking inquiry form will appear here.</p>
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
              <th>Event</th>
              <th>Experience</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Submitted</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={focusId === row.id ? "is-focused" : undefined}
                id={`inquiry-${row.id}`}
              >
                <td>
                  <code className="lp-code">{row.referenceNumber}</code>
                </td>
                <td>
                  <div className="lp-stack-tight">
                    <strong>{row.fullName}</strong>
                    <span>{row.email}</span>
                    <span>{row.phone}</span>
                  </div>
                </td>
                <td>
                  <div className="lp-stack-tight">
                    <span>{row.eventType}</span>
                    <span>{formatShortDate(row.eventDate)}</span>
                  </div>
                </td>
                <td>{humanizeSlug(row.experienceFormat)}</td>
                <td>{row.guestCount}</td>
                <td>
                  <StatusBadge
                    label={inquiryStatusLabel(
                      row.inquiryStatus,
                      row.convertedBookingId
                    )}
                    tone={inquiryStatusTone(
                      row.inquiryStatus,
                      row.convertedBookingId
                    )}
                  />
                </td>
                <td>{formatShortDate(row.createdAt)}</td>
                <td>
                  <Link
                    href={`/admin/inquiries/${row.id}`}
                    className="lp-table__link"
                  >
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
          <li
            key={row.id}
            className={`lp-mobile-card${focusId === row.id ? " is-focused" : ""}`}
          >
            <div className="lp-mobile-card__top">
              <code className="lp-code">{row.referenceNumber}</code>
              <StatusBadge
                label={inquiryStatusLabel(
                  row.inquiryStatus,
                  row.convertedBookingId
                )}
                tone={inquiryStatusTone(row.inquiryStatus, row.convertedBookingId)}
              />
            </div>
            <strong>{row.fullName}</strong>
            <p>
              {row.eventType} · {formatShortDate(row.eventDate)}
            </p>
            <Link href={`/admin/inquiries/${row.id}`} className="lp-table__link">
              Open inquiry
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

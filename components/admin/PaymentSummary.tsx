import Link from "next/link";
import type { AdminPaymentListRow } from "@/lib/admin/dashboard-types";
import { paymentStatusLabel, paymentStatusTone } from "@/lib/admin/booking-status";
import { formatDateTime, formatUsdFromCents } from "@/lib/admin/dashboard-utils";
import { StatusBadge } from "./StatusBadge";

type Props = {
  rows: AdminPaymentListRow[];
  totals: {
    collectedCents: number;
    pendingCents: number;
    remainingCents: number;
  };
};

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  remaining_balance: "Remaining balance",
  full_payment: "Full payment",
  refund: "Refund"
};

export function PaymentSummary({ rows, totals }: Props) {
  return (
    <div className="lp-stack">
      <div className="lp-kpi-grid lp-kpi-grid--3">
        <article className="lp-kpi lp-kpi--gold">
          <span className="lp-kpi__label">Collected</span>
          <strong className="lp-kpi__value">
            {formatUsdFromCents(totals.collectedCents)}
          </strong>
        </article>
        <article className="lp-kpi lp-kpi--warning">
          <span className="lp-kpi__label">Pending</span>
          <strong className="lp-kpi__value">
            {formatUsdFromCents(totals.pendingCents)}
          </strong>
        </article>
        <article className="lp-kpi">
          <span className="lp-kpi__label">Remaining balances</span>
          <strong className="lp-kpi__value">
            {formatUsdFromCents(totals.remainingCents)}
          </strong>
        </article>
      </div>

      {!rows.length ? (
        <div className="lp-empty-state">
          <h3>No payment records yet</h3>
          <p>
            Booking deposits and commerce orders appear here from verified
            Square-linked records.
          </p>
        </div>
      ) : (
        <>
          <div className="lp-table-wrap lp-table-wrap--desktop">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Provider ID</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="lp-stack-tight">
                        <strong>{row.customerName}</strong>
                        <span>{row.customerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <code className="lp-code">{row.reference}</code>
                      <div className="lp-muted">{row.source}</div>
                    </td>
                    <td>{TYPE_LABELS[row.paymentType] ?? row.paymentType}</td>
                    <td>{formatUsdFromCents(row.amountCents)}</td>
                    <td>
                      <StatusBadge
                        label={paymentStatusLabel(row.status)}
                        tone={paymentStatusTone(row.status)}
                      />
                    </td>
                    <td>
                      <code className="lp-code">{row.providerId || "—"}</code>
                    </td>
                    <td>{formatDateTime(row.date)}</td>
                    <td>
                      {row.href ? (
                        <Link href={row.href} className="lp-table__link">
                          Open
                        </Link>
                      ) : (
                        "—"
                      )}
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
                  <strong>{formatUsdFromCents(row.amountCents)}</strong>
                  <StatusBadge
                    label={paymentStatusLabel(row.status)}
                    tone={paymentStatusTone(row.status)}
                  />
                </div>
                <p>
                  {row.customerName} · {row.reference}
                </p>
                <p>
                  {TYPE_LABELS[row.paymentType] ?? row.paymentType} ·{" "}
                  {formatDateTime(row.date)}
                </p>
                {row.href ? (
                  <Link href={row.href} className="lp-table__link">
                    Open record
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

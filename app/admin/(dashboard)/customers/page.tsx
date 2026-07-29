import Link from "next/link";
import {
  customerActivityLabel,
  customerSpendLabel,
  listCustomers
} from "@/lib/admin/customers";
import { safeSearchParam } from "@/lib/admin/dashboard-utils";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Customers",
  description: "House of Denise customer CRM.",
  path: "/admin/customers"
});

export default async function AdminCustomersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = safeSearchParam(params.q);
  const rows = await listCustomers(q);

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">CRM</p>
          <h1>Customers</h1>
          <p>
            Deduplicated by email across bookings and inquiries. Open a profile for
            history, payments, and internal notes.
          </p>
        </div>
      </header>

      <form className="lp-filter-bar" method="get">
        <label>
          Search
          <input name="q" defaultValue={q} placeholder="Name, email, phone" />
        </label>
        <button type="submit" className="lp-btn lp-btn--primary">
          Search
        </button>
        <Link href="/admin/customers" className="lp-btn">
          Reset
        </Link>
      </form>

      {!rows.length ? (
        <div className="lp-empty-state">
          <h3>No customers found</h3>
          <p>Customers appear after bookings or inquiries are submitted.</p>
        </div>
      ) : (
        <>
          <div className="lp-table-wrap lp-table-wrap--desktop">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Bookings</th>
                  <th>Inquiries</th>
                  <th>Spend</th>
                  <th>Upcoming</th>
                  <th>Last activity</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.email}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>{row.email}</td>
                    <td>{row.phone || "—"}</td>
                    <td>{row.bookingCount}</td>
                    <td>{row.inquiryCount}</td>
                    <td>{customerSpendLabel(row.spendCents)}</td>
                    <td>{row.upcomingCount}</td>
                    <td>{customerActivityLabel(row.lastActivity)}</td>
                    <td>
                      <Link
                        href={`/admin/customers/${encodeURIComponent(row.email)}`}
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
              <li key={row.email} className="lp-mobile-card">
                <strong>{row.name}</strong>
                <p>{row.email}</p>
                <p>
                  {row.bookingCount} bookings · {customerSpendLabel(row.spendCents)}
                </p>
                <Link
                  href={`/admin/customers/${encodeURIComponent(row.email)}`}
                  className="lp-table__link"
                >
                  Open profile
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

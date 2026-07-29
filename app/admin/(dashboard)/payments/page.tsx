import Link from "next/link";
import { PaymentSummary } from "@/components/admin/PaymentSummary";
import { requireAdmin } from "@/lib/admin/auth";
import { safeSearchParam } from "@/lib/admin/dashboard-utils";
import { listAdminPayments } from "@/lib/admin/payments";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Payments",
  description: "House of Denise payment records.",
  path: "/admin/payments"
});

export default async function AdminPaymentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = safeSearchParam(params.q);
  const page = Number(safeSearchParam(params.page, "1")) || 1;
  const result = await listAdminPayments({ q, page });

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Finance</p>
          <h1>Payments</h1>
          <p>
            Verified booking payment fields and commerce order records. House of
            Denise currently processes checkout through Square; Stripe env vars
            remain reserved for a future provider switch.
          </p>
        </div>
      </header>

      <form className="lp-filter-bar" method="get">
        <label>
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Reference, customer, provider id"
          />
        </label>
        <button type="submit" className="lp-btn lp-btn--primary">
          Search
        </button>
        <Link href="/admin/payments" className="lp-btn">
          Reset
        </Link>
      </form>

      <PaymentSummary rows={result.rows} totals={result.totals} />

      <div className="lp-pagination">
        <span>
          Page {result.page} · {result.total} record
          {result.total === 1 ? "" : "s"}
        </span>
      </div>
    </>
  );
}

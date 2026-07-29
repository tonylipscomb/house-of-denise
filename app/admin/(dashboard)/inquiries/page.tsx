import Link from "next/link";
import { InquiryTable } from "@/components/admin/InquiryTable";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminInquiries } from "@/lib/admin/inquiries";
import { INQUIRY_WORKFLOW_STATUSES } from "@/lib/admin/inquiry-status";
import { safeSearchParam } from "@/lib/admin/dashboard-utils";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Inquiries",
  description: "Review House of Denise booking inquiries.",
  path: "/admin/inquiries"
});

export default async function AdminInquiriesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = safeSearchParam(params.q);
  const status = safeSearchParam(params.status);
  const focus = safeSearchParam(params.focus);
  const page = Number(safeSearchParam(params.page, "1")) || 1;

  const result = await listAdminInquiries({
    q,
    status: status || undefined,
    page
  });

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Pipeline</p>
          <h1>Inquiries</h1>
          <p>
            Connected to the existing booking inquiry system. Existing records are
            not rewritten; legacy statuses map safely for display.
          </p>
        </div>
      </header>

      <form className="lp-filter-bar" method="get">
        <label>
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Reference, name, email, phone"
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {INQUIRY_WORKFLOW_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="lp-btn lp-btn--primary">
          Apply filters
        </button>
        <Link href="/admin/inquiries" className="lp-btn">
          Reset
        </Link>
      </form>

      <InquiryTable rows={result.rows} focusId={focus || undefined} />

      <div className="lp-pagination">
        <span>
          Page {result.page} · {result.total} inquir
          {result.total === 1 ? "y" : "ies"}
        </span>
        <div className="lp-tabs">
          <Link
            href={`/admin/inquiries?${new URLSearchParams({
              ...(q ? { q } : {}),
              ...(status ? { status } : {}),
              page: String(Math.max(1, result.page - 1))
            }).toString()}`}
          >
            Previous
          </Link>
          <Link
            href={`/admin/inquiries?${new URLSearchParams({
              ...(q ? { q } : {}),
              ...(status ? { status } : {}),
              page: String(
                result.page * result.pageSize < result.total
                  ? result.page + 1
                  : result.page
              )
            }).toString()}`}
          >
            Next
          </Link>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { BookingTable } from "@/components/admin/BookingTable";
import { listAdminBookings } from "@/lib/admin/bookings";
import { BOOKING_ADMIN_WRITABLE_STATUSES, BOOKING_PAYMENT_STATUSES } from "@/lib/admin/booking-status";
import { safeSearchParam } from "@/lib/admin/dashboard-utils";
import { createPageMetadata } from "@/lib/metadata";
import { bookingExperiences } from "@/data/booking-catalog";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Bookings",
  description: "Manage House of Denise experience bookings.",
  path: "/admin/bookings"
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const q = safeSearchParam(params.q);
  const status = safeSearchParam(params.status);
  const paymentStatus = safeSearchParam(params.paymentStatus);
  const experience = safeSearchParam(params.experience);
  const tab = (safeSearchParam(params.tab, "all") || "all") as
    | "all"
    | "upcoming"
    | "past";
  const from = safeSearchParam(params.from);
  const to = safeSearchParam(params.to);
  const page = Number(safeSearchParam(params.page, "1")) || 1;

  const result = await listAdminBookings({
    q,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    experience: experience || undefined,
    tab,
    from: from || undefined,
    to: to || undefined,
    page
  });

  const buildHref = (overrides: Record<string, string>) => {
    const next = new URLSearchParams();
    const merged = {
      q,
      status,
      paymentStatus,
      experience,
      tab,
      from,
      to,
      page: String(page),
      ...overrides
    };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    const qs = next.toString();
    return qs ? `/admin/bookings?${qs}` : "/admin/bookings";
  };

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Operations</p>
          <h1>Bookings</h1>
          <p>
            Searchable bookings from the experience wizard. References keep the
            HOD-BKG-YYYYMMDD-XXXXXX format when present.
          </p>
        </div>
        <Link href="/booking" className="lp-btn lp-btn--primary">
          Create booking
        </Link>
      </header>

      <div className="lp-tabs" role="tablist" aria-label="Booking timeframe">
        {(
          [
            ["all", "All"],
            ["upcoming", "Upcoming"],
            ["past", "Past"]
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={buildHref({ tab: value, page: "1" })}
            className={tab === value ? "is-active" : undefined}
          >
            {label}
          </Link>
        ))}
      </div>

      <form className="lp-filter-bar" method="get">
        <input type="hidden" name="tab" value={tab} />
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
            {BOOKING_ADMIN_WRITABLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Payment
          <select name="paymentStatus" defaultValue={paymentStatus}>
            <option value="">All payments</option>
            {BOOKING_PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Experience
          <select name="experience" defaultValue={experience}>
            <option value="">All experiences</option>
            {bookingExperiences.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input type="date" name="from" defaultValue={from} />
        </label>
        <label>
          To
          <input type="date" name="to" defaultValue={to} />
        </label>
        <button type="submit" className="lp-btn lp-btn--primary">
          Apply filters
        </button>
        <Link href="/admin/bookings" className="lp-btn">
          Reset
        </Link>
      </form>

      <BookingTable rows={result.rows} />

      <div className="lp-pagination">
        <span>
          Page {result.page} · {result.total} booking
          {result.total === 1 ? "" : "s"}
        </span>
        <div className="lp-tabs">
          <Link
            href={buildHref({ page: String(Math.max(1, result.page - 1)) })}
            aria-disabled={result.page <= 1}
            className={result.page <= 1 ? "is-disabled" : undefined}
          >
            Previous
          </Link>
          <Link
            href={buildHref({
              page: String(
                result.page * result.pageSize < result.total
                  ? result.page + 1
                  : result.page
              )
            })}
          >
            Next
          </Link>
        </div>
      </div>
    </>
  );
}

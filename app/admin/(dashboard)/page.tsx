import { KpiCard } from "@/components/admin/KpiCard";
import { RankedList, StatusOverview } from "@/components/admin/OverviewLists";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { getDashboardOverview } from "@/lib/admin/dashboard";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Overview",
  description: "House of Denise operations dashboard.",
  path: "/admin"
});

export default async function AdminDashboardPage() {
  const overview = await getDashboardOverview(30);

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Overview</p>
          <h1>Operations dashboard</h1>
          <p>
            Live booking, inquiry, and payment signals from the House of Denise
            workspace. Payment amounts come from verified booking records.
          </p>
        </div>
      </header>

      <div className="lp-kpi-grid">
        {overview.kpis.map((kpi) => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
          />
        ))}
      </div>

      <div className="lp-grid-2">
        <RevenueChart series={overview.revenueSeries} title="Revenue (30 days)" />
        <QuickActions />
      </div>

      <div className="lp-grid-2">
        <StatusOverview
          title="Booking status overview"
          items={overview.bookingStatusOverview}
        />
        <RecentActivity
          title="Upcoming experiences"
          items={overview.upcomingEvents}
          emptyMessage="No upcoming scheduled experiences."
          viewAllHref="/admin/bookings?tab=upcoming"
        />
      </div>

      <div className="lp-grid-3">
        <RecentActivity
          title="Recent inquiries"
          items={overview.recentInquiries}
          emptyMessage="No inquiries yet."
          viewAllHref="/admin/inquiries"
        />
        <RecentActivity
          title="Recent payments"
          items={overview.recentPayments}
          emptyMessage="No payment activity yet."
          viewAllHref="/admin/payments"
        />
        <RecentActivity
          title="Recent customer activity"
          items={overview.recentCustomers}
          emptyMessage="No customer booking activity yet."
          viewAllHref="/admin/customers"
        />
      </div>

      <div className="lp-grid-3">
        <RankedList
          title="Most-selected experiences"
          items={overview.topExperiences}
          emptyMessage="No experience selections yet."
        />
        <RankedList
          title="Most-selected packages"
          items={overview.topPackages}
          emptyMessage="No package selections yet."
        />
        <RankedList
          title="Most-selected upgrades"
          items={overview.topUpgrades}
          emptyMessage="No upgrades selected yet."
        />
      </div>
    </>
  );
}

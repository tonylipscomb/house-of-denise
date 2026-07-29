import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  LogOut,
  Package,
  Shield,
  Sparkles,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/auth/actions";
import { getCustomerPortalData } from "@/lib/account/portal";
import { requireWorkspaceMembership } from "@/lib/launchpoint/auth";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "My Account",
  description: "Manage your House Of Denise bookings, orders, and profile.",
  path: "/account"
});

export default async function AccountPage() {
  const context = await requireWorkspaceMembership(undefined, "/account");
  const portal = await getCustomerPortalData({
    userId: context.userId,
    email: context.email,
    fullName: context.profile?.full_name,
    phone: context.profile?.phone,
    role: context.membership.role
  });

  return (
    <section className="account-page" aria-labelledby="account-title">
      {portal.isStaff ? (
        <aside className="account-staff-banner" role="note">
          <Shield size={18} aria-hidden="true" />
          <div>
            <strong>Staff account</strong>
            <p>
              You{"\u2019"}re signed in with workspace access. This page is your
              personal customer portal. Business operations live in the admin
              dashboard.
            </p>
          </div>
          <Button href="/admin" variant="gold" size="sm">
            Open admin dashboard
          </Button>
        </aside>
      ) : null}

      <header className="account-hero">
        <div>
          <p className="eyebrow">My account</p>
          <h1 id="account-title">Welcome back, {portal.displayName}</h1>
          <p>
            Track your fragrance experiences, remaining balances, and profile
            details in one place.
            {portal.email ? (
              <>
                {" "}
                Signed in as <strong>{portal.email}</strong>.
              </>
            ) : null}
          </p>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            leftIcon={<LogOut size={18} aria-hidden="true" />}
          >
            Log out
          </Button>
        </form>
      </header>

      <div className="account-kpis" aria-label="Account overview">
        <article className="account-kpi">
          <span>Upcoming experiences</span>
          <strong>{portal.upcomingCount}</strong>
        </article>
        <article className="account-kpi">
          <span>Balance due</span>
          <strong>{portal.balanceDueLabel}</strong>
        </article>
        <article className="account-kpi">
          <span>Shop orders</span>
          <strong>{portal.orders.length}</strong>
        </article>
        <article className="account-kpi">
          <span>Profile</span>
          <strong>{portal.profileComplete ? "Complete" : "Needs info"}</strong>
        </article>
      </div>

      <div className="account-actions">
        <Button
          href="/booking"
          variant="primary"
          leftIcon={<Sparkles size={17} aria-hidden="true" />}
        >
          Book an experience
        </Button>
        <Button href="/account/bookings" variant="outline">
          View all bookings
        </Button>
        <Button href="/account/profile" variant="outline">
          Manage profile
        </Button>
        <Button href="/contact" variant="text">
          Contact House of Denise
        </Button>
      </div>

      <div className="account-grid">
        <article className="portal-card portal-card--bookings">
          <div className="portal-card__head">
            <CalendarDays size={22} aria-hidden="true" />
            <div>
              <h2>Your experiences</h2>
              <p>Upcoming and recent bookings linked to this account.</p>
            </div>
          </div>

          {portal.recentBookings.length ? (
            <ul className="account-booking-list">
              {portal.recentBookings.map((booking) => (
                <li key={booking.id}>
                  <div>
                    <Link href={booking.href} className="account-booking-list__title">
                      {booking.experience}
                    </Link>
                    <p>
                      {booking.reference}
                      {" \u00B7 "}
                      {booking.packageLabel}
                    </p>
                    <p>{booking.whenLabel}</p>
                  </div>
                  <div className="account-booking-list__meta">
                    <span className="account-status">{booking.statusLabel}</span>
                    <span>{booking.paymentLabel}</span>
                    <strong>{booking.balanceLabel}</strong>
                    <Link href={booking.href}>
                      Details
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="account-empty">
              <p>No bookings on this account yet.</p>
              <Button href="/booking" variant="secondary" size="sm">
                Start a booking
              </Button>
            </div>
          )}
        </article>

        <article className="portal-card">
          <div className="portal-card__head">
            <UserRound size={22} aria-hidden="true" />
            <div>
              <h2>Profile</h2>
              <p>
                {portal.profileComplete
                  ? "Your contact details are ready for booking follow-up."
                  : "Add your name and phone so we can reach you about your events."}
              </p>
            </div>
          </div>
          <Button href="/account/profile" variant="secondary">
            Manage profile
          </Button>
        </article>

        <article className="portal-card">
          <div className="portal-card__head">
            <Package size={22} aria-hidden="true" />
            <div>
              <h2>Shop orders</h2>
              <p>
                {portal.orders.length
                  ? "Recent shop purchases tied to your email."
                  : "Shop orders will appear here when the storefront is live and you check out."}
              </p>
            </div>
          </div>
          {portal.orders.length ? (
            <ul className="portal-list">
              {portal.orders.map((order) => (
                <li key={order.id}>
                  <div>
                    <strong>{order.reference}</strong>
                    <span className="account-muted">{order.createdLabel}</span>
                  </div>
                  <div className="account-booking-list__meta">
                    <span className="account-status">{order.statusLabel}</span>
                    <strong>{order.totalLabel}</strong>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Button href="/shop" variant="outline" size="sm">
              Visit the shop
            </Button>
          )}
        </article>

        <article className="portal-card portal-card--wide">
          <div className="portal-card__head">
            <ClipboardList size={22} aria-hidden="true" />
            <div>
              <h2>Inquiries</h2>
              <p>
                {portal.inquiryCount > 0
                  ? `You have ${portal.inquiryCount} inquiry record${
                      portal.inquiryCount === 1 ? "" : "s"
                    } linked to this account.`
                  : "Custom-event inquiries submitted while signed in will be saved here."}
              </p>
            </div>
          </div>
          <Button href="/booking/inquiry" variant="outline" size="sm">
            Start an inquiry
          </Button>
        </article>
      </div>
    </section>
  );
}

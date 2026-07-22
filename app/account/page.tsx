import { CalendarDays, ClipboardList, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireWorkspaceMembership } from "@/lib/launchpoint/auth";
import { logoutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Account",
  description: "Manage your House Of Denise account.",
  path: "/account"
});

export default async function AccountPage() {
  const context = await requireWorkspaceMembership(undefined, "/account");
  const admin = getSupabaseAdminClient();

  const [{ data: bookings }, { data: inquiries }] = admin
    ? await Promise.all([
        admin
          .from("bookings")
          .select("id, reference_number, start_at, status, payment_status, service_id")
          .eq("workspace_id", context.workspace.id)
          .eq("customer_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(5),
        admin
          .from("booking_inquiries")
          .select("reference_number, event_date, inquiry_status, created_at")
          .eq("workspace_id", context.workspace.id)
          .eq("customer_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(5)
      ])
    : [{ data: [] }, { data: [] }];

  const displayName = context.profile?.full_name || context.email || "friend";
  const profileComplete = Boolean(context.profile?.full_name && context.profile?.phone);

  return (
    <section className="account-page" aria-labelledby="account-title">
      <div className="account-hero">
        <div>
          <p className="eyebrow">Customer portal</p>
          <h1 id="account-title">Welcome, {displayName}</h1>
          <p>Your account keeps profile details, inquiry history, and future confirmed bookings tied to your verified login.</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" leftIcon={<LogOut size={18} />}>Log out</Button>
        </form>
      </div>

      <div className="account-grid">
        <article className="portal-card">
          <UserRound size={22} aria-hidden="true" />
          <h2>Profile</h2>
          <p>{profileComplete ? "Your profile is ready for future booking features." : "Add your phone and name before direct booking opens."}</p>
          <Button href="/account/profile" variant="secondary">Manage profile</Button>
        </article>

        <article className="portal-card">
          <CalendarDays size={22} aria-hidden="true" />
          <h2>Upcoming bookings</h2>
          {bookings?.length ? (
            <ul className="portal-list">
              {bookings.map((booking) => (
                <li key={String(booking.id)}>
                  <strong>{String(booking.reference_number)}</strong>
                  <span>{String(booking.status)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No confirmed bookings yet. Direct scheduling stays disabled until availability and payments are configured.</p>
          )}
          <Button href="/account/bookings" variant="outline">View bookings</Button>
        </article>

        <article className="portal-card portal-card--wide">
          <ClipboardList size={22} aria-hidden="true" />
          <h2>Inquiry history</h2>
          {inquiries?.length ? (
            <ul className="portal-list">
              {inquiries.map((inquiry) => (
                <li key={String(inquiry.reference_number)}>
                  <strong>{String(inquiry.reference_number)}</strong>
                  <span>{String(inquiry.inquiry_status)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Historical inquiry claiming is deferred until email ownership can be verified safely. New signed-in inquiries can be attached to this account.</p>
          )}
        </article>
      </div>
    </section>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/auth/actions";
import { AuthorizationError, requireAdmin } from "@/lib/launchpoint/auth";

const nav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Calendar" },
  { label: "Inquiries" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Services", href: "/admin/services" },
  { label: "Availability" },
  { label: "Staff" },
  { label: "Payments" },
  { label: "Settings", href: "/admin/settings" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let context;
  try {
    context = await requireAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) redirect("/account?status=admin-required");
    throw error;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div>
          <p className="eyebrow">LaunchPoint</p>
          <h2>{context.workspace.name}</h2>
          <p>{context.profile?.full_name || context.email}</p>
          <span className="status-pill">{context.membership.role}</span>
        </div>
        <nav className="admin-nav">
          {nav.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href}>{item.label}</Link>
            ) : (
              <span key={item.label} aria-disabled="true">{item.label}</span>
            )
          )}
        </nav>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" fullWidth leftIcon={<LogOut size={17} />}>Log out</Button>
        </form>
      </aside>
      <section className="admin-content">{children}</section>
    </div>
  );
}

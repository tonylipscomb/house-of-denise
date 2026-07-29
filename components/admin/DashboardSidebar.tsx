"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Mail,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  Users,
  ClipboardList,
  MessageSquareText,
  ExternalLink,
  X
} from "lucide-react";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "./nav";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  overview: LayoutDashboard,
  bookings: ClipboardList,
  inquiries: MessageSquareText,
  calendar: CalendarDays,
  customers: Users,
  experiences: Sparkles,
  packages: Package,
  payments: CreditCard,
  products: ShoppingBag,
  coupons: TicketPercent,
  newsletter: Mail,
  settings: Settings
};

type Props = {
  workspaceName: string;
  userLabel: string;
  role: string;
  open: boolean;
  onClose: () => void;
};

export function DashboardSidebar({
  workspaceName,
  userLabel,
  role,
  open,
  onClose
}: Props) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`lp-admin__backdrop${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`lp-admin__sidebar${open ? " is-open" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="lp-admin__brand">
          <div className="lp-admin__brand-top">
            <p className="lp-admin__eyebrow">LaunchPoint Digital</p>
            <button
              type="button"
              className="lp-admin__icon-btn lp-admin__sidebar-close"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>
          <h1 className="lp-admin__workspace">{workspaceName}</h1>
          <p className="lp-admin__user">{userLabel}</p>
          <span className="lp-admin__role">{role}</span>
        </div>

        <nav className="lp-admin__nav">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.id] ?? LayoutDashboard;
            const active = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`lp-admin__nav-link${active ? " is-active" : ""}`}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.label}</span>
                {item.phase > 1 ? (
                  <span className="lp-admin__nav-phase">P{item.phase}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="lp-admin__sidebar-foot">
          <Link href="/" className="lp-admin__site-link">
            <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
            View public website
          </Link>
        </div>
      </aside>
    </>
  );
}

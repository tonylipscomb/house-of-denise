import Link from "next/link";
import {
  CalendarOff,
  ClipboardPlus,
  MessageSquare,
  PackagePlus,
  TicketPercent,
  UserPlus,
  BellRing,
  Sparkles
} from "lucide-react";

type Action = {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
  reason?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const ACTIONS: Action[] = [
  {
    id: "create-booking",
    label: "Create booking",
    href: "/booking",
    icon: ClipboardPlus
  },
  {
    id: "add-customer",
    label: "Add customer",
    href: "/admin/customers",
    icon: UserPlus
  },
  {
    id: "review-inquiries",
    label: "Review inquiries",
    href: "/admin/inquiries",
    icon: MessageSquare
  },
  {
    id: "block-date",
    label: "Block calendar date",
    href: "/admin/calendar",
    icon: CalendarOff
  },
  {
    id: "add-experience",
    label: "Add experience",
    href: "/admin/experiences",
    icon: Sparkles
  },
  {
    id: "add-product",
    label: "Add product",
    href: "/admin/commerce",
    icon: PackagePlus
  },
  {
    id: "create-coupon",
    label: "Create coupon",
    disabled: true,
    reason: "Coupon manager arrives in Phase 3",
    icon: TicketPercent
  },
  {
    id: "payment-reminder",
    label: "Send payment reminder",
    disabled: true,
    reason: "Reminder emails are not wired yet",
    icon: BellRing
  }
];

export function QuickActions() {
  return (
    <section className="lp-panel" aria-labelledby="lp-quick-actions-title">
      <header className="lp-panel__header">
        <h2 id="lp-quick-actions-title">Quick actions</h2>
      </header>
      <div className="lp-quick">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          if (action.disabled || !action.href) {
            return (
              <button
                key={action.id}
                type="button"
                className="lp-quick__btn is-disabled"
                disabled
                title={action.reason}
              >
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {action.label}
              </button>
            );
          }
          return (
            <Link key={action.id} href={action.href} className="lp-quick__btn">
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

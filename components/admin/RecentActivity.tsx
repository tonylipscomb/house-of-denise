import Link from "next/link";
import type { DashboardListItem } from "@/lib/admin/dashboard-types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  title: string;
  items: DashboardListItem[];
  emptyMessage: string;
  viewAllHref?: string;
};

export function RecentActivity({ title, items, emptyMessage, viewAllHref }: Props) {
  return (
    <section className="lp-panel">
      <header className="lp-panel__header">
        <h2>{title}</h2>
        {viewAllHref ? (
          <Link href={viewAllHref} className="lp-panel__link">
            View all
          </Link>
        ) : null}
      </header>
      {!items.length ? (
        <p className="lp-empty">{emptyMessage}</p>
      ) : (
        <ul className="lp-activity">
          {items.map((item) => (
            <li key={item.id}>
              <div className="lp-activity__main">
                {item.href ? (
                  <Link href={item.href} className="lp-activity__title">
                    {item.title}
                  </Link>
                ) : (
                  <span className="lp-activity__title">{item.title}</span>
                )}
                <span className="lp-activity__subtitle">{item.subtitle}</span>
              </div>
              <div className="lp-activity__meta">
                {item.status ? <StatusBadge label={item.status} /> : null}
                <span>{item.meta}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

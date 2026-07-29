import type { ExperienceCount, StatusCount } from "@/lib/admin/dashboard-types";

export function RankedList({
  title,
  items,
  emptyMessage
}: {
  title: string;
  items: ExperienceCount[];
  emptyMessage: string;
}) {
  return (
    <section className="lp-panel">
      <header className="lp-panel__header">
        <h2>{title}</h2>
      </header>
      {!items.length ? (
        <p className="lp-empty">{emptyMessage}</p>
      ) : (
        <ol className="lp-rank">
          {items.map((item) => (
            <li key={item.slug}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function StatusOverview({
  title,
  items
}: {
  title: string;
  items: StatusCount[];
}) {
  return (
    <section className="lp-panel">
      <header className="lp-panel__header">
        <h2>{title}</h2>
      </header>
      {!items.length ? (
        <p className="lp-empty">No booking status data yet.</p>
      ) : (
        <ul className="lp-status-overview">
          {items.map((item) => (
            <li key={item.status}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

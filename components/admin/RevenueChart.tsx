import type { RevenuePoint } from "@/lib/admin/dashboard-types";
import { formatUsdFromCents } from "@/lib/admin/dashboard-utils";

type Props = {
  series: RevenuePoint[];
  title?: string;
};

export function RevenueChart({ series, title = "Revenue" }: Props) {
  const max = Math.max(...series.map((p) => p.amountCents), 1);
  const total = series.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <section className="lp-panel lp-chart" aria-labelledby="lp-revenue-title">
      <header className="lp-panel__header">
        <div>
          <h2 id="lp-revenue-title">{title}</h2>
          <p className="lp-panel__meta">Last {series.length} days · {formatUsdFromCents(total)}</p>
        </div>
      </header>
      <div className="lp-chart__bars" role="img" aria-label={`Revenue chart totaling ${formatUsdFromCents(total)}`}>
        {series.map((point) => {
          const height = Math.max(4, Math.round((point.amountCents / max) * 100));
          return (
            <div key={point.date} className="lp-chart__col" title={`${point.label}: ${formatUsdFromCents(point.amountCents)}`}>
              <div className="lp-chart__bar" style={{ height: `${height}%` }} />
              <span className="lp-chart__label">{point.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

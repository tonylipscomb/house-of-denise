type Props = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "gold" | "success" | "warning" | "danger";
};

export function KpiCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <article className={`lp-kpi lp-kpi--${tone}`}>
      <span className="lp-kpi__label">{label}</span>
      <strong className="lp-kpi__value">{value}</strong>
      {hint ? <span className="lp-kpi__hint">{hint}</span> : null}
    </article>
  );
}

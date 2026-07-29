export function formatUsdFromCents(cents: number | null | undefined) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value * 10) / 10}%`;
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function humanizeSlug(slug: string | null | undefined) {
  if (!slug) return "—";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function startOfDayIso(daysAgo = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export function buildLastNDayBuckets(days: number) {
  const buckets: { key: string; label: string; amountCents: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    buckets.push({
      key,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amountCents: 0
    });
  }
  return buckets;
}

export function countBy<T>(items: T[], keyFn: (item: T) => string) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item) || "unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export function safeSearchParam(
  value: string | string[] | undefined,
  fallback = ""
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function clampPage(page: number, pageSize: number, total: number) {
  const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1);
  return Math.min(Math.max(1, page), maxPage);
}

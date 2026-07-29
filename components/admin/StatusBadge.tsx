import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/admin/booking-status";

type Props = {
  label: string;
  tone?: StatusTone | "neutral" | "info" | "success" | "warning" | "danger";
  className?: string;
};

export function StatusBadge({ label, tone = "neutral", className }: Props) {
  return (
    <span className={cn("lp-badge", `lp-badge--${tone}`, className)}>{label}</span>
  );
}

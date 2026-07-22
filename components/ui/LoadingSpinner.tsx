import { cn } from "@/lib/cn";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function LoadingSpinner({ label = "Loading", className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={cn("spinner", `spinner--${size}`, className)} role="status" aria-live="polite">
      <span className="spinner__ring" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

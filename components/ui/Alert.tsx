import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "error";

type AlertProps = {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
};

const variantClass: Record<AlertVariant, string> = {
  info: "alert--info",
  success: "alert--success",
  warning: "alert--warning",
  error: "alert--error"
};

export function Alert({ title, children, variant = "info", className }: AlertProps) {
  return (
    <div className={cn("alert", variantClass[variant], className)} role="status">
      {title ? <p className="alert__title">{title}</p> : null}
      <div className="alert__body">{children}</div>
    </div>
  );
}

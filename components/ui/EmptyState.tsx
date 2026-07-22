import { cn } from "@/lib/cn";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("empty-state", className)}>
      <h2 className="empty-state__title">{title}</h2>
      {description ? <p className="empty-state__description">{description}</p> : null}
      {action ? (
        <Button href={action.href} variant="primary">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

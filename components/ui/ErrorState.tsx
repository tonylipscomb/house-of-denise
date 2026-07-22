import { cn } from "@/lib/cn";
import { Button } from "./Button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  retryLabel = "Try again",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn("error-state", className)} role="alert">
      <h2 className="error-state__title">{title}</h2>
      <p className="error-state__description">{description}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

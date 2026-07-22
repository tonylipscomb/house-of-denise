import { cn } from "@/lib/cn";

type FieldErrorProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export function FieldError({ id, children, className }: FieldErrorProps) {
  return (
    <p id={id} className={cn("field-error", className)} role="alert">
      {children}
    </p>
  );
}

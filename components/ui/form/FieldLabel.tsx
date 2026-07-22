import { cn } from "@/lib/cn";

type FieldLabelProps = {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function FieldLabel({ htmlFor, children, required, className }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn("field-label", className)}>
      {children}
      {required ? (
        <span className="field-label__required" aria-hidden="true">
          *
        </span>
      ) : null}
      {required ? <span className="visually-hidden"> (required)</span> : null}
    </label>
  );
}

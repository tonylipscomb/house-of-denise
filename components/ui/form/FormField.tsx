import { cn } from "@/lib/cn";
import { FieldError } from "./FieldError";
import { FieldHint } from "./FieldHint";
import { FieldLabel } from "./FieldLabel";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({ id, label, required, hint, error, children, className }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("form-field", error && "form-field--error", className)}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      {children}
      {hint ? <FieldHint id={hintId!}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
      {describedBy ? (
        <span className="visually-hidden" data-field-describedby={describedBy} />
      ) : null}
    </div>
  );
}

export function getFieldDescribedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

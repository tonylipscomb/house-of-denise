import { cn } from "@/lib/cn";

type FieldHintProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export function FieldHint({ id, children, className }: FieldHintProps) {
  return (
    <p id={id} className={cn("field-hint", className)}>
      {children}
    </p>
  );
}

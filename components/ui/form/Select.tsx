import { cn } from "@/lib/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export function Select({ className, hasError, children, ...props }: SelectProps) {
  return (
    <select className={cn("field-control field-control--select", hasError && "field-control--error", className)} {...props}>
      {children}
    </select>
  );
}

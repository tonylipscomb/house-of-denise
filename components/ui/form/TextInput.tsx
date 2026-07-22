import { cn } from "@/lib/cn";

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function TextInput({ className, hasError, ...props }: TextInputProps) {
  return (
    <input
      className={cn("field-control", hasError && "field-control--error", className)}
      {...props}
    />
  );
}

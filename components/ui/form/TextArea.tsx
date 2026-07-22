import { cn } from "@/lib/cn";

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export function TextArea({ className, hasError, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn("field-control field-control--textarea", hasError && "field-control--error", className)}
      {...props}
    />
  );
}

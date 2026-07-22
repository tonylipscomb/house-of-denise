import { cn } from "@/lib/cn";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ id, label, className, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn("checkbox-field", className)}>
      <input id={id} type="checkbox" className="checkbox-field__input" {...props} />
      <span className="checkbox-field__label">{label}</span>
    </label>
  );
}

import { cn } from "@/lib/cn";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  spacing?: "compact" | "standard" | "spacious";
  background?: "default" | "cream" | "ivory" | "espresso";
  id?: string;
  ariaLabelledby?: string;
};

const spacingClass = {
  compact: "section--compact",
  standard: "section--standard",
  spacious: "section--spacious"
} as const;

const backgroundClass = {
  default: "",
  cream: "section--cream",
  ivory: "section--ivory",
  espresso: "section--espresso"
} as const;

export function Section({
  children,
  className,
  spacing = "standard",
  background = "default",
  id,
  ariaLabelledby
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn("section", spacingClass[spacing], backgroundClass[background], className)}
    >
      {children}
    </section>
  );
}

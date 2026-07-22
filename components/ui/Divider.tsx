import { cn } from "@/lib/cn";

type DividerProps = {
  className?: string;
  spacing?: "sm" | "md" | "lg";
};

export function Divider({ className, spacing = "md" }: DividerProps) {
  return <hr className={cn("divider", `divider--${spacing}`, className)} aria-hidden="true" />;
}

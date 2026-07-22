import { cn } from "@/lib/cn";

type StackProps = {
  children: React.ReactNode;
  className?: string;
  gap?: "1" | "2" | "3" | "4" | "5" | "6" | "8";
  align?: "start" | "center" | "end" | "stretch";
};

const gapClass = {
  "1": "stack--gap-1",
  "2": "stack--gap-2",
  "3": "stack--gap-3",
  "4": "stack--gap-4",
  "5": "stack--gap-5",
  "6": "stack--gap-6",
  "8": "stack--gap-8"
} as const;

export function Stack({ children, className, gap = "4", align = "stretch" }: StackProps) {
  return (
    <div className={cn("stack", gapClass[gap], `stack--align-${align}`, className)}>{children}</div>
  );
}

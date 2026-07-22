import { cn } from "@/lib/cn";

type GridProps = {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "3" | "4" | "5" | "6";
};

const columnsClass = {
  1: "grid--1",
  2: "grid--2",
  3: "grid--3",
  4: "grid--4"
} as const;

const gapClass = {
  "3": "grid--gap-3",
  "4": "grid--gap-4",
  "5": "grid--gap-5",
  "6": "grid--gap-6"
} as const;

export function Grid({ children, className, columns = 2, gap = "4" }: GridProps) {
  return (
    <div className={cn("grid", columnsClass[columns], gapClass[gap], className)}>{children}</div>
  );
}

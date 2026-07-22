import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
};

export function Skeleton({ className, width, height = "1rem", rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", rounded && "skeleton--rounded", className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

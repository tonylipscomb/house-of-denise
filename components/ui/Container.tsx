import { cn } from "@/lib/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  fullWidth?: boolean;
  as?: "div" | "section" | "header" | "footer" | "main" | "article";
};

export function Container({
  children,
  className,
  narrow = false,
  fullWidth = false,
  as: Tag = "div"
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "container",
        narrow && "container--narrow",
        fullWidth && "container--full",
        className
      )}
    >
      {children}
    </Tag>
  );
}

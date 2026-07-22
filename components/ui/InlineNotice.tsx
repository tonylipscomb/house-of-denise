import { cn } from "@/lib/cn";

type InlineNoticeProps = {
  children: React.ReactNode;
  className?: string;
};

export function InlineNotice({ children, className }: InlineNoticeProps) {
  return (
    <p className={cn("inline-notice", className)} role="note">
      {children}
    </p>
  );
}

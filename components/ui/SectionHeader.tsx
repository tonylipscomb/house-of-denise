import Link from "next/link";
import { cn } from "@/lib/cn";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  underline?: boolean;
  align?: "left" | "center";
  className?: string;
  titleAs?: "h1" | "h2" | "h3";
  id?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  underline = false,
  align = "left",
  className,
  titleAs: TitleTag = "h2",
  id
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "section-header",
        align === "center" && "section-header--center",
        underline && "section-header--underline",
        className
      )}
    >
      <div className="section-header__content">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <TitleTag id={id}>{title}</TitleTag>
        {description ? <p className="section-header__description">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="section-header__action">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

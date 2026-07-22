import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "text" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  outline: "btn--outline",
  ghost: "btn--ghost",
  text: "btn--text",
  destructive: "btn--destructive"
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn--sm",
  md: "btn--md",
  lg: "btn--lg",
  icon: "btn--icon"
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    "btn",
    variantClass[variant],
    sizeClass[size],
    fullWidth && "btn--full",
    loading && "btn--loading",
    className
  );

  const content = (
    <>
      {loading ? <Loader2 className="btn__spinner" size={18} aria-hidden="true" /> : null}
      {!loading && leftIcon ? <span className="btn__icon">{leftIcon}</span> : null}
      {children ? <span className="btn__label">{children}</span> : null}
      {!loading && rightIcon ? <span className="btn__icon">{rightIcon}</span> : null}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    if (disabled || loading) {
      return (
        <span className={cn(classes, "btn--disabled")} aria-disabled="true" {...linkRest}>
          {content}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  const buttonRest = rest as ButtonAsButton;
  return (
    <button type="button" className={classes} disabled={disabled || loading} {...buttonRest}>
      {content}
    </button>
  );
}

type VisuallyHiddenProps = {
  children: React.ReactNode;
  as?: "span" | "p" | "h1" | "h2" | "label";
};

export function VisuallyHidden({ children, as: Tag = "span" }: VisuallyHiddenProps) {
  return <Tag className="visually-hidden">{children}</Tag>;
}

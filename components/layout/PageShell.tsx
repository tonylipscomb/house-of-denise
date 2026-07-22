import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <Container as="section" className="page-shell">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} titleAs="h1" />
      {children}
    </Container>
  );
}

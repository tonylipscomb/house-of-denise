import { homepageFaqs } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function FaqPreviewSection() {
  return (
    <Section background="ivory" spacing="standard" className="home-faq">
      <Container className="home-faq__inner">
        <SectionHeader
          eyebrow="QUESTIONS"
          title="Before You Inquire"
          description="A few helpful details about travel, deposits, customization and event fit."
          titleAs="h2"
        />
        <div className="home-faq__list">
          {homepageFaqs.map((item) => (
            <details key={item.question} className="home-faq__item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <Button href="/faq" variant="outline">
          View Full FAQ
        </Button>
      </Container>
    </Section>
  );
}

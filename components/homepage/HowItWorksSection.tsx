import { bookingProcessSteps } from "@/data/home-content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function HowItWorksSection() {
  return (
    <Section background="cream" spacing="spacious" className="home-process">
      <Container>
        <SectionHeader
          eyebrow="HOW IT WORKS"
          title="A considered path from inquiry to experience."
          description="The booking process is intentionally reviewed by the House Of Denise team before any date is confirmed."
          align="center"
          titleAs="h2"
        />
        <ol className="home-process__timeline">
          {bookingProcessSteps.map((step, index) => (
            <li className="home-process__step" key={step.id}>
              <span className="home-process__number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

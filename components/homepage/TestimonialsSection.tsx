import { testimonials } from "@/data/catalog";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function TestimonialsSection() {
  const verifiedTestimonials = testimonials.filter(
    (testimonial) => !/placeholder/i.test(`${testimonial.quote} ${testimonial.name ?? ""} ${testimonial.detail ?? ""}`)
  );

  if (verifiedTestimonials.length === 0) return null;

  return (
    <Section spacing="standard">
      <Container>
        <SectionHeader eyebrow="TESTIMONIALS" title="Guest Reflections" align="center" />
        <Grid columns={3} gap="4" className="testimonial-grid">
          {verifiedTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

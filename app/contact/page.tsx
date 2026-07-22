import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form/FormField";
import { TextArea } from "@/components/ui/form/TextArea";
import { TextInput } from "@/components/ui/form/TextInput";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/data/brand";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Get in touch with House Of Denise.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <Section spacing="standard">
      <PageShell
        eyebrow="CONTACT"
        title="We'd love to hear from you."
        description="Questions about the shop, workshops, or private events? Send a note and we'll respond with care."
      />
      <Container narrow>
        <div className="contact-details" aria-label="House Of Denise contact details">
          {brand.email ? <a href={`mailto:${brand.email}`}>{brand.email}</a> : null}
          {brand.phone ? <a href={`tel:${brand.phone.replace(/\D/g, "")}`}>{brand.phone}</a> : null}
          {brand.hours ? <span>{brand.hours}</span> : null}
        </div>
        <form className="contact-form" aria-label="Contact form">
          <FormField id="contact-name" label="Name" required>
            <TextInput id="contact-name" name="name" autoComplete="name" required />
          </FormField>
          <FormField id="contact-email" label="Email" required hint="We'll only use this to respond to your message.">
            <TextInput id="contact-email" name="email" type="email" autoComplete="email" required />
          </FormField>
          <FormField id="contact-message" label="Message" required>
            <TextArea id="contact-message" name="message" rows={5} required />
          </FormField>
          <Button type="submit" variant="primary" fullWidth>
            Send message
          </Button>
        </form>
      </Container>
    </Section>
  );
}

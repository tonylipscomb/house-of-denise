import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageShell } from "@/components/layout/PageShell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "FAQ",
  description: "Frequently asked questions about House Of Denise.",
  path: "/faq"
});

const faqItems = [
  {
    question: "When will the shop be fully available?",
    answer: "The storefront foundation is in place. Product details, pricing, and checkout will launch once confirmed."
  },
  {
    question: "How do I book a workshop or experience?",
    answer:
      "Use the booking inquiry form to share your date, event type, guest count, and planning needs. House Of Denise reviews each inquiry before availability, proposal details, and any deposit steps are confirmed."
  },
  {
    question: "Do you offer shipping?",
    answer: "Shipping and fulfillment details will be published before checkout goes live."
  },
  {
    question: "Can I host a private event?",
    answer:
      "Yes. Private events, corporate experiences, workshops, and mobile fragrance bar inquiries can be submitted through the existing booking flow."
  },
  {
    question: "Does submitting an inquiry reserve my date?",
    answer:
      "No. Submitting an inquiry starts the review process. A date is not held until House Of Denise reviews the inquiry, approves the experience details, and any required deposit step is completed."
  }
];

export default function FaqPage() {
  return (
    <Section spacing="standard">
      <PageShell
        eyebrow="CUSTOMER CARE"
        title="Frequently asked questions"
        description="Helpful answers about shopping, inquiries, private events, and the House Of Denise planning process."
      />
      <Container narrow className="faq-list">
        {faqItems.map((item) => (
          <details key={item.question} className="faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </Container>
    </Section>
  );
}

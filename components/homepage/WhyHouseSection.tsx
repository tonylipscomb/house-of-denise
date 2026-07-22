import Image from "next/image";
import { whyHouseItems } from "@/data/home-content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function WhyHouseSection() {
  return (
    <Section spacing="spacious" className="why-house-section">
      <Container className="why-house">
        <div className="why-house__copy">
          <p className="eyebrow">WHY HOUSE OF DENISE</p>
          <h2>Soft luxury, thoughtful flow and fragrance guests remember.</h2>
          <p className="lead">
            Every detail is shaped to feel personal, polished and welcoming, from the first inquiry to the final guest
            takeaway.
          </p>
          <div className="why-house__items">
            {whyHouseItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} className="why-house__item">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <div className="why-house__media">
          <Image
            src="/images/house-of-denise/pillar-events.jpg"
            alt="Elegant private event table styled for a House Of Denise fragrance experience"
            fill
            sizes="(max-width: 900px) 100vw, 42vw"
            className="why-house__image"
          />
        </div>
      </Container>
    </Section>
  );
}

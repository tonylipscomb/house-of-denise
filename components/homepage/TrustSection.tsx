import { trustSignals } from "@/data/home-content";
import { Container } from "@/components/ui/Container";

export function TrustSection() {
  return (
    <section className="trust-section" aria-label="House Of Denise highlights">
      <Container className="trust-section__grid">
        {trustSignals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div className="trust-section__item" key={signal.id}>
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              <span>{signal.label}</span>
            </div>
          );
        })}
      </Container>
    </section>
  );
}

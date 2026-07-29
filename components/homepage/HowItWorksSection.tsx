import { bookingProcessSteps, processHeading } from "@/data/home-content";
import { Reveal } from "./Reveal";

export function HowItWorksSection() {
  return (
    <section className="lux-section lux-section--cream" aria-labelledby="how-it-works-title">
      <div className="lux-container">
        <Reveal className="lux-section-header lux-section-header--center">
          <p className="lux-eyebrow">{processHeading.eyebrow}</p>
          <h2 id="how-it-works-title">{processHeading.title}</h2>
        </Reveal>

        <ol className="lux-process">
          {bookingProcessSteps.map((step, index) => (
            <Reveal as="li" key={step.id} className="lux-process__step" delayMs={index * 70}>
              <span className="lux-process__number" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="lux-process__title">{step.title}</h3>
              <p className="lux-process__desc">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

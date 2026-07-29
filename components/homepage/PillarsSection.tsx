import { featuredExperiencesHeading, homePillars } from "@/data/home-content";
import { ExperienceCard } from "./ExperienceCard";
import { Reveal } from "./Reveal";

export function PillarsSection() {
  return (
    <section className="lux-section lux-section--cream" aria-labelledby="featured-experiences-title">
      <div className="lux-container">
        <Reveal className="lux-section-header lux-section-header--center">
          <p className="lux-eyebrow">{featuredExperiencesHeading.eyebrow}</p>
          <h2 id="featured-experiences-title">{featuredExperiencesHeading.title}</h2>
          <p className="lux-section-header__desc">{featuredExperiencesHeading.description}</p>
        </Reveal>

        <div className="lux-card-grid">
          {homePillars.map((pillar, index) => (
            <ExperienceCard key={pillar.id} feature={pillar} delayMs={index * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

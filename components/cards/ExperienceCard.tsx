import { Button } from "@/components/ui/Button";
import type { Experience } from "@/data/catalog";

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="card experience-card">
      <div className={`card__media artwork event-artwork ${experience.imageClass}`} />
      <div className="card__body experience-card__body">
        <h3 className="card__title">{experience.name}</h3>
        <p className="card__description">{experience.description}</p>
        {experience.scheduleLabel ? (
          <p className="experience-card__schedule">{experience.scheduleLabel}</p>
        ) : (
          <p className="experience-card__note">Schedule coming soon</p>
        )}
        <Button href={experience.href} variant="primary" fullWidth>
          Learn more
        </Button>
      </div>
    </article>
  );
}

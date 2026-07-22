import { ExperienceCard } from "./ExperienceCard";
import type { Experience } from "@/data/catalog";

export function WorkshopCard({ workshop }: { workshop: Experience }) {
  return <ExperienceCard experience={workshop} />;
}

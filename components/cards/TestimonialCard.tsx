import type { Testimonial } from "@/data/catalog";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <blockquote className="card testimonial-card">
      <div className="testimonial-card__stars" aria-label="Five star review">
        <span aria-hidden="true">*****</span>
      </div>
      <p className="testimonial-card__quote">&quot;{testimonial.quote}&quot;</p>
      {testimonial.name ? (
        <footer className="testimonial-card__footer">
          <cite>{testimonial.name}</cite>
          {testimonial.detail ? <span>{testimonial.detail}</span> : null}
        </footer>
      ) : null}
    </blockquote>
  );
}

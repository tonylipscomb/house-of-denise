import Link from "next/link";
import { Clock3, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { brand } from "@/data/brand";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Get in touch with House Of Denise about the shop, workshops, or private events.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <div className="lux-contact">
      <section className="lux-contact__intro" aria-labelledby="contact-title">
        <div className="lux-container lux-contact__intro-inner">
          <p className="lux-eyebrow">Contact</p>
          <h1 id="contact-title">We&apos;d love to hear from you.</h1>
          <p>
            Questions about the shop, workshops, or private events? Send a note and
            we&apos;ll respond with care.
          </p>
        </div>
      </section>

      <section className="lux-contact__body" aria-label="Contact details and form">
        <div className="lux-container lux-contact__layout">
          <aside className="lux-contact__aside">
            <h2>Reach House of Denise</h2>
            <p>
              We&apos;re glad you&apos;re here. Share a little about what you need, and
              we&apos;ll help guide the next step.
            </p>

            <ul className="lux-contact__details">
              {brand.email ? (
                <li>
                  <span className="lux-contact__icon" aria-hidden="true">
                    <Mail size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <strong>Email</strong>
                    <a href={`mailto:${brand.email}`}>{brand.email}</a>
                  </div>
                </li>
              ) : null}
              {brand.phone ? (
                <li>
                  <span className="lux-contact__icon" aria-hidden="true">
                    <Phone size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <strong>Phone</strong>
                    <a href={`tel:${brand.phone.replace(/\D/g, "")}`}>{brand.phone}</a>
                  </div>
                </li>
              ) : null}
              {brand.hours ? (
                <li>
                  <span className="lux-contact__icon" aria-hidden="true">
                    <Clock3 size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <strong>Availability</strong>
                    <span>{brand.hours}</span>
                  </div>
                </li>
              ) : null}
            </ul>

            <div className="lux-contact__aside-cta">
              <p>Ready to plan an experience?</p>
              <Button href="/booking" variant="gold">
                Book Experience
              </Button>
              <Link className="lux-contact__inline-link" href="/faq">
                Browse FAQs →
              </Link>
            </div>
          </aside>

          <div className="lux-contact__panel">
            <h2>Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

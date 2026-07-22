import Link from "next/link";
import { brand } from "@/data/brand";
import { footerLinkGroups, socialLinks } from "@/data/footer";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FormField } from "@/components/ui/form/FormField";
import { TextInput } from "@/components/ui/form/TextInput";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container className="footer-grid">
        <div className="footer-brand">
          <p className="eyebrow light">{brand.name.toUpperCase()}</p>
          <h2>Stay close to the craft.</h2>
          <p>{brand.statement}</p>
          <address className="footer-contact">
            {brand.email ? <a href={`mailto:${brand.email}`}>{brand.email}</a> : null}
            {brand.phone ? <a href={`tel:${brand.phone.replace(/\D/g, "")}`}>{brand.phone}</a> : null}
            {brand.hours ? <span>{brand.hours}</span> : null}
          </address>
        </div>

        <form className="newsletter" aria-label="Newsletter signup">
          <FormField id="footer-email" label="Join the Craft Circle" hint="Studio updates shared with intention.">
            <div className="newsletter__row">
              <TextInput id="footer-email" type="email" name="email" autoComplete="email" placeholder="Email address" />
              <Button type="submit" variant="secondary">
                Join
              </Button>
            </div>
          </FormField>
        </form>

        <div className="footer-links-grid">
          {footerLinkGroups.map((group) => (
            <div key={group.title} className="footer-links">
              <p className="footer-links__title">{group.title}</p>
              {group.links.map((link) => (
                <Link key={`${group.title}-${link.label}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </Container>

      {(socialLinks.instagram || socialLinks.facebook || socialLinks.pinterest) && (
        <Container className="footer-social">
          {socialLinks.instagram ? <a href={socialLinks.instagram}>Instagram</a> : null}
          {socialLinks.facebook ? <a href={socialLinks.facebook}>Facebook</a> : null}
          {socialLinks.pinterest ? <a href={socialLinks.pinterest}>Pinterest</a> : null}
        </Container>
      )}

      <Container className="footer-bottom">
        <span>Copyright {new Date().getFullYear()} {brand.name}</span>
        <span className="footer-bottom__links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
        </span>
      </Container>
    </footer>
  );
}

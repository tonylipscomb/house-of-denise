import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/brand";
import { footerLinkGroups, socialLinks } from "@/data/footer";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form/FormField";
import { TextInput } from "@/components/ui/form/TextInput";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lux-footer">
      <div className="lux-footer__inner">
        <div className="lux-footer__brand">
          <p className="lux-footer__logo">{brand.name}</p>
          <p className="lux-footer__tagline">FRAGRANCE · SELF-CARE · EXPERIENCES</p>
          <p className="lux-footer__statement">{brand.statement}</p>
          {(socialLinks.instagram || socialLinks.facebook || socialLinks.pinterest) && (
            <div className="lux-footer__social">
              {socialLinks.instagram ? (
                <a href={socialLinks.instagram} aria-label="Instagram">
                  Instagram
                </a>
              ) : null}
              {socialLinks.facebook ? (
                <a href={socialLinks.facebook} aria-label="Facebook">
                  Facebook
                </a>
              ) : null}
              {socialLinks.pinterest ? (
                <a href={socialLinks.pinterest} aria-label="Pinterest">
                  Pinterest
                </a>
              ) : null}
            </div>
          )}
        </div>

        <div className="lux-footer__links">
          {footerLinkGroups.map((group) => (
            <div key={group.title} className="lux-footer__column">
              <p className="lux-footer__column-title">{group.title}</p>
              {group.links.map((link) => (
                <Link key={`${group.title}-${link.label}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <form className="lux-footer__newsletter" aria-label="Newsletter signup">
          <p className="lux-footer__column-title">Stay Connected</p>
          <p className="lux-footer__newsletter-copy">
            Join our community for inspiration, event updates, and special offers.
          </p>
          <FormField id="footer-email" label="Email address" className="lux-footer__field">
            <div className="lux-footer__newsletter-row">
              <TextInput
                id="footer-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email address"
                required
              />
              <Button type="submit" variant="gold">
                Join
              </Button>
            </div>
          </FormField>
        </form>
      </div>

      <div className="lux-footer__crest" aria-hidden="true">
        <Image
          src="/images/house-of-denise/hd-crest-gold.png"
          alt=""
          width={120}
          height={68}
          className="lux-footer__crest-img"
        />
      </div>

      <div className="lux-footer__bottom">
        <div className="lux-footer__bottom-inner">
          <span>
            © {year} {brand.name}. All rights reserved.
          </span>
          <span className="lux-footer__credit">Site by Launchpoint Digital</span>
          <span className="lux-footer__legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

import { ArrowRight } from "lucide-react";
import { shopCategories, shopFaqs, shopFinalCta, shopHero, shopInfoItems } from "@/data/shop";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FormField } from "@/components/ui/form/FormField";
import { TextInput } from "@/components/ui/form/TextInput";
import { createPageMetadata } from "@/lib/metadata";

const metadataDescription =
  "The House Of Denise fragrance and self-care shop is being prepared with luxury products, gifts, and keepsakes for a thoughtful online launch.";

export const metadata = createPageMetadata({
  title: "Shop Fragrance and Self-Care",
  description: metadataDescription,
  path: "/shop",
  image: "/images/house-of-denise/pillar-shop.jpg"
});

function CollectionPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "House Of Denise Shop",
    description: metadataDescription,
    url: "https://houseofdenise.com/shop",
    isPartOf: {
      "@type": "WebSite",
      name: "House Of Denise",
      url: "https://houseofdenise.com/"
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function ShopPage() {
  const FinalCtaIcon = shopFinalCta.icon;

  return (
    <>
      <CollectionPageSchema />
      <Section background="cream" spacing="spacious" className="shop-hero">
        <Container className="shop-hero__inner">
          <div className="shop-hero__copy">
            <p className="eyebrow">{shopHero.eyebrow}</p>
            <h1>{shopHero.title}</h1>
            <p className="lead">{shopHero.description}</p>
            <div className="button-row">
              <Button href={shopHero.primaryCta.href} variant="primary" rightIcon={<ArrowRight size={17} aria-hidden="true" />}>
                {shopHero.primaryCta.label}
              </Button>
              <Button href={shopHero.secondaryCta.href} variant="outline">
                {shopHero.secondaryCta.label}
              </Button>
            </div>
          </div>
          <div className="shop-hero__panel">
            <p className="eyebrow">COMING SOON</p>
            <h2>Something Beautiful Is Coming</h2>
            <p>
              Product details, pricing, shipping, and checkout will appear here once the collection is approved for
              launch.
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="standard" className="shop-categories" aria-labelledby="shop-categories-title">
        <Container>
          <SectionHeader
            eyebrow="COLLECTION PREVIEW"
            title="Fragrance, self-care, and gifts in preparation."
            description="These are the supported collection areas based on the current House Of Denise direction. Product inventory will be shown only when confirmed."
            titleAs="h2"
            id="shop-categories-title"
          />
          <div className="shop-category-grid" role="list">
            {shopCategories.map((category) => {
              const Icon = category.icon;
              return (
                <article className="shop-category-card" key={category.id} role="listitem">
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <span>Coming soon</span>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section background="ivory" spacing="standard" className="shop-info" aria-labelledby="shop-info-title">
        <Container>
          <SectionHeader
            eyebrow="SHOPPING INFORMATION"
            title="Clear details before checkout launches."
            description="House Of Denise will publish product policies only after inventory, pricing, and fulfillment details are confirmed."
            titleAs="h2"
            id="shop-info-title"
          />
          <div className="shop-info-grid">
            {shopInfoItems.map((item) => {
              const Icon = item.icon;
              return (
                <article className="shop-info-card" key={item.id}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.href && item.linkLabel ? (
                    <Button href={item.href} variant="text">
                      {item.linkLabel}
                    </Button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section background="cream" spacing="standard" className="shop-newsletter" id="shop-newsletter">
        <Container narrow className="shop-newsletter__inner">
          <SectionHeader
            eyebrow="JOIN THE LIST"
            title="Collection updates, sent with care."
            description="Be first to hear when the House Of Denise fragrance and self-care collection is ready."
            align="center"
            titleAs="h2"
          />
          <form className="shop-newsletter__form" aria-label="Shop collection email signup">
            <FormField id="shop-email" label="Email address" hint="No checkout is connected to this form.">
              <div className="shop-newsletter__row">
                <TextInput id="shop-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" />
                <Button type="submit" variant="secondary">
                  Join the List
                </Button>
              </div>
            </FormField>
          </form>
        </Container>
      </Section>

      <Section spacing="standard" className="shop-faq" aria-labelledby="shop-faq-title">
        <Container narrow>
          <SectionHeader eyebrow="SHOP FAQ" title="Before the collection launches" align="center" titleAs="h2" id="shop-faq-title" />
          <div className="faq-list">
            {shopFaqs.map((faq) => (
              <details className="faq-item" key={faq.id}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="espresso" spacing="spacious" className="shop-final-cta">
        <Container className="shop-final-cta__inner">
          <FinalCtaIcon size={24} strokeWidth={1.75} aria-hidden="true" />
          <p className="eyebrow light">{shopFinalCta.eyebrow}</p>
          <h2>{shopFinalCta.title}</h2>
          <p>{shopFinalCta.description}</p>
          <div className="button-row">
            <Button href={shopFinalCta.primaryCta.href} variant="secondary">
              {shopFinalCta.primaryCta.label}
            </Button>
            <Button href={shopFinalCta.secondaryCta.href} variant="outline" className="shop-final-cta__outline">
              {shopFinalCta.secondaryCta.label}
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

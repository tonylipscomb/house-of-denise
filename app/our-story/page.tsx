import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/data/brand";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Our Story",
  description: "Meet Tasheika and discover the heart behind House Of Denise.",
  path: "/our-story"
});

export default function OurStoryPage() {
  return (
    <>
      <Section background="cream" spacing="spacious" className="page-hero">
        <PageShell
          eyebrow="MEET THE MAKER"
          title={`${brand.owner}, the heart behind ${brand.name}.`}
          description="House Of Denise was created around fragrance, self-care, creativity, and the kind of hospitality that helps people feel seen."
        />
      </Section>
      <Section spacing="standard">
        <Container className="story">
          <div className="story-visual" aria-hidden="true" />
          <div>
            <p className="eyebrow">THE STORY</p>
            <h2>Created with purpose. Shared with love.</h2>
            <p className="lead">
              {brand.name} brings handmade products and creative experiences together under one warm, welcoming roof.
              Tasheika&apos;s work is rooted in care, memory, and the belief that small sensory details can turn ordinary
              gatherings into meaningful experiences.
            </p>
            <blockquote>
              &ldquo;Every experience is designed to feel personal, beautiful, and welcoming from the first conversation.&rdquo;
            </blockquote>
          </div>
        </Container>
      </Section>
    </>
  );
}

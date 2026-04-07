# packages/marketing/src/components/marketing

Section components for the landing page, each responsible for one part of the public storytelling flow.

## Directories

- None.

## Files

- `MarketingFeatureGrid.tsx`: Feature card grid that explains the package's core benefits.
- `MarketingFooter.tsx`: Footer with brand summary and section navigation shortcuts.
- `MarketingHeader.tsx`: Sticky top navigation with section links and auth calls to action.
- `MarketingHero.tsx`: Hero section that introduces the template's launch-ready positioning.
- `MarketingPricing.tsx`: Pricing handoff section that routes visitors into dashboard billing flows.
- `MarketingSocialProof.tsx`: Stack credibility and positioning section for trust-building highlights.
- `MarketingStoryGrid.tsx`: Narrative section explaining how the marketing site and dashboard fit together.
- `MarketingTestimonials.tsx`: Testimonial section that reinforces product credibility.
- `SectionHeading.tsx`: Shared heading block used across marketing sections.

## Writing Rules

- Keep each section self-contained around one story beat, and extract repeated presentation patterns into `SectionHeading` or `../ui` instead of duplicating markup.
- Update this file when this directory gains, loses, renames, or materially repurposes an immediate child.

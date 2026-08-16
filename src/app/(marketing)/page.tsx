import { ClosingCta } from "@/components/marketing/closing-cta";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SurpriseMeTeaser } from "@/components/marketing/surprise-me-teaser";

// Fully static: no database and no TMDB calls. Poster paths are hardcoded and
// load straight from the TMDB image CDN through next/image. "/" is the
// most-hit public route, so it must never depend on a live lookup.
export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <SurpriseMeTeaser />
      <ClosingCta />
    </>
  );
}

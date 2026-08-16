import { Reveal } from "@/components/marketing/reveal";

const FEATURES: { title: string; description: string }[] = [
  {
    title: "Half-star ratings",
    description: "Rate anywhere from half a star to five, in half-star steps.",
  },
  {
    title: "Rewatches, recorded separately",
    description: "Every rewatch is its own dated entry — nothing overwrites the last.",
  },
  {
    title: "Films and TV, together",
    description: "One library for both. No separate apps, no context switching.",
  },
  {
    title: "A watchlist that decides for you",
    description: "Filter by runtime, then hit Surprise Me when you can't choose.",
  },
  {
    title: "Sortable, filterable library",
    description: "Slice by rating, watched date, genre, or decade in a click.",
  },
  {
    title: "Private by default",
    description: "Your log is yours alone. No public profiles, no follows, no feed.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything, and nothing more
          </h2>
          <p className="mt-4 text-muted-foreground">
            A watch log that does the few things that matter, well.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 3) * 80}>
            <div className="space-y-2 border-t border-border pt-5">
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

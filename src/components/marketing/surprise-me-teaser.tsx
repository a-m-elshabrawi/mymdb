import { Shuffle } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";

// Static, non-interactive stand-ins for the watchlist filter chips. The real
// FilterChip is a remove-link; here they're just visual context for the dice.
const CHIPS = ["Films", "Under 2h", "Sci-Fi", "2010s"];

export function SurpriseMeTeaser() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <Reveal>
        <div className="overflow-hidden rounded-xl border border-border bg-surface px-6 py-10 sm:px-12 sm:py-14">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:gap-12 lg:text-left">
            <div className="max-w-md space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Can&apos;t decide? Roll the dice.
              </h2>
              <p className="text-muted-foreground">
                Narrow your watchlist to tonight&apos;s mood — type, genre, decade, and how much
                time you&apos;ve got — then let Surprise Me pick one for you.
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col items-center gap-4 lg:items-end">
              <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
                {CHIPS.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <span className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
                <Shuffle className="size-4" />
                Surprise me
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { PosterWall } from "@/components/marketing/poster-wall";
import { Button } from "@/components/ui/button";

/**
 * Full-viewport hero. The poster wall sits behind three stacked legibility
 * layers: a flat dim, a top-and-bottom vertical gradient into --background, and
 * a radial scrim centred behind the headline. Together they hold effective
 * poster visibility to ~15–20% and guarantee the near-black behind the text —
 * so #ededf0 headline copy clears AA against even the brightest poster region,
 * not just the average.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <PosterWall />

      {/* Flat dim across the whole wall. */}
      <div aria-hidden="true" className="absolute inset-0 bg-background/60" />
      {/* Vertical fade: fully --background at top and bottom, clearest through
          the middle band. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--background) 0%, transparent 38%, transparent 60%, var(--background) 100%)",
        }}
      />
      {/* Radial scrim: near-solid --background directly behind the headline,
          fading out toward the edges where the wall is allowed to show. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(62% 55% at 50% 44%, var(--background) 0%, color-mix(in oklab, var(--background) 55%, transparent) 55%, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        <span className="mb-6 text-sm font-medium tracking-[0.25em] text-muted-foreground uppercase">
          MyMDB
        </span>
        <h1 className="text-[clamp(2.75rem,7vw,5rem)] leading-[1.03] font-semibold tracking-tight text-balance text-foreground">
          Every film you&apos;ve ever watched, in one place.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
          A private log for the films and shows you actually finish. Rate them, review them,
          remember them.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">Create account</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 z-10 flex justify-center text-muted-foreground"
      >
        <ChevronDown className="size-5 animate-bounce" />
      </div>
    </section>
  );
}

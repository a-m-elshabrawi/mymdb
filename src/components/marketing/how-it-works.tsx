import { PosterCard } from "@/components/poster-card";
import { PosterImage } from "@/components/poster-image";
import { StarRating } from "@/components/star-rating";
import { Reveal } from "@/components/marketing/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// A step: a short label + real UI fragment. Fragments reuse the app's own
// components with hardcoded props — showing the actual interface is what makes
// a landing page for a tool like this convincing, and it can't go stale the
// way a screenshot would.
function Step({
  eyebrow,
  title,
  description,
  reverse,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  reverse: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-8 lg:flex-row lg:gap-16",
        reverse && "lg:flex-row-reverse",
      )}
    >
      <div className="flex-1 space-y-3 text-center lg:text-left">
        <span className="text-sm font-medium tracking-wide text-primary">{eyebrow}</span>
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mx-auto max-w-sm text-muted-foreground lg:mx-0">{description}</p>
      </div>
      <div className="flex w-full flex-1 justify-center">{children}</div>
    </div>
  );
}

// "Find it" — a mock search-result grid built from the real PosterCard.
function FindItMock() {
  return (
    <div className="grid w-full max-w-md grid-cols-3 gap-4">
      <PosterCard
        tmdbId={438631}
        mediaType="movie"
        title="Dune"
        year={2021}
        posterPath="/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"
        sizes="120px"
      />
      <PosterCard
        tmdbId={496243}
        mediaType="movie"
        title="Parasite"
        year={2019}
        posterPath="/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
        sizes="120px"
      />
      <PosterCard
        tmdbId={329865}
        mediaType="movie"
        title="Arrival"
        year={2016}
        posterPath="/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"
        sizes="120px"
      />
    </div>
  );
}

// "Log it" — a static replica of the LogDialog: date, a 4-star rating (8/10),
// a short review, and the rewatch toggle. Reuses StarRating and PosterImage;
// the surrounding chrome is inert so nothing here needs a server action.
function LogItMock() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 shrink-0">
          <PosterImage posterPath="/7fn624j5lj3xTme2SgiLCeuedmO.jpg" title="Whiplash" sizes="40px" />
        </div>
        <p className="text-base font-medium text-foreground">Whiplash</p>
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">Watched on</span>
          <div className="flex h-9 items-center rounded-md border border-input bg-transparent px-3 text-sm text-foreground">
            14 March 2026
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">Rating</span>
          <StarRating value={8} readOnly size="lg" />
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Review <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <div className="rounded-md border border-input bg-transparent p-3 text-sm leading-relaxed text-foreground/90">
            Relentless and exhausting in the best way — that final drum solo is pure cinema.
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-foreground">
          <span
            aria-hidden="true"
            className="flex size-4 items-center justify-center rounded-[4px] border border-input"
          />
          This is a rewatch
        </div>

        <div className="flex justify-end gap-2">
          <span className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground">
            Cancel
          </span>
          <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Save
          </span>
        </div>
      </div>
    </div>
  );
}

// "Look back" — a mock diary row: day marker, poster thumb, title, stars, and a
// Rewatch badge, mirroring the real DiaryEntryRow layout.
function LookBackMock() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-4">
        <div className="w-8 shrink-0 pt-1 text-right text-2xl font-semibold tabular-nums text-muted-foreground">
          14
        </div>
        <div className="w-12 shrink-0">
          <PosterImage
            posterPath="/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"
            title="Blade Runner 2049"
            sizes="48px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-medium text-foreground">Blade Runner 2049</span>
            <span className="text-sm text-muted-foreground">2017</span>
            <Badge variant="secondary">Rewatch</Badge>
          </div>
          <div className="mt-1">
            <StarRating value={9} readOnly size="sm" />
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/90">
            Even better the second time. Villeneuve&apos;s patience with silence and scale is
            unmatched.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three steps, and the title is in your library for good.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 space-y-20">
        <Reveal>
          <Step
            eyebrow="01 — Find it"
            title="Search once, keep it forever"
            description="Look up any film or show. The first time you touch a title, it's cached to your account — so your lists stay fast and never depend on a live lookup."
            reverse={false}
          >
            <FindItMock />
          </Step>
        </Reveal>

        <Reveal>
          <Step
            eyebrow="02 — Log it"
            title="Rate it, date it, review it"
            description="Half-star ratings, the date you watched, and an optional review. Mark a rewatch and it's recorded as its own separate viewing."
            reverse
          >
            <LogItMock />
          </Step>
        </Reveal>

        <Reveal>
          <Step
            eyebrow="03 — Look back"
            title="Your whole history, in a diary"
            description="Every viewing lands in a chronological diary — with posters, stars, and the notes you left. Scroll back through everything you've watched."
            reverse={false}
          >
            <LookBackMock />
          </Step>
        </Reveal>
      </div>
    </section>
  );
}

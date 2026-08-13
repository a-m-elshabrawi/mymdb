import { Search } from "lucide-react";
import Link from "next/link";

const EXAMPLE_SEARCHES = ["Parasite", "Breaking Bad", "Dune"];

export function HomeWelcome() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome to MyMDB</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          A private log for what you watch — search for a film or show, log it with a rating and a
          date, and build your own library over time.
        </p>
      </div>

      <form method="GET" action="/search" className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          placeholder="Search for a film or show…"
          aria-label="Search"
          className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {EXAMPLE_SEARCHES.map((example) => (
          <Link
            key={example}
            href={`/search?q=${encodeURIComponent(example)}`}
            className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground transition-colors hover:border-accent/50"
          >
            {example}
          </Link>
        ))}
      </div>
    </div>
  );
}

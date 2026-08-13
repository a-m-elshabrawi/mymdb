import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MediaGrid } from "@/components/media-grid";
import { PosterCard } from "@/components/poster-card";
import { SearchInput } from "@/components/search-input";
import { searchMulti } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
};

const MAX_PAGE = 500;

type TypeFilter = "all" | "movie" | "tv";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

function parseType(value: string | undefined): TypeFilter {
  return value === "movie" || value === "tv" ? value : "all";
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, MAX_PAGE);
}

function buildQueryString(query: string, type: TypeFilter, page?: number): string {
  const params = new URLSearchParams({ q: query });
  if (type !== "all") {
    params.set("type", type);
  }
  if (page && page > 1) {
    params.set("page", String(page));
  }
  return params.toString();
}

function FilterTabs({ query, activeType }: { query: string; activeType: TypeFilter }) {
  const tabs: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "movie", label: "Films" },
    { value: "tv", label: "TV" },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-border">
      {tabs.map((tab) => {
        const active = activeType === tab.value;
        return (
          <Link
            key={tab.value}
            href={`/search?${buildQueryString(query, tab.value)}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function SearchPagination({
  query,
  type,
  page,
  totalPages,
}: {
  query: string;
  type: TypeFilter;
  page: number;
  totalPages: number;
}) {
  const maxPage = Math.min(totalPages, MAX_PAGE);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= maxPage;

  return (
    <nav
      aria-label="Search results pages"
      className="flex items-center justify-center gap-6 py-10"
    >
      {prevDisabled ? (
        <span className="text-sm text-muted-foreground/50">Previous</span>
      ) : (
        <Link
          href={`/search?${buildQueryString(query, type, page - 1)}`}
          className="text-sm text-foreground hover:text-accent-hover"
        >
          Previous
        </Link>
      )}
      <span className="text-sm tabular-nums text-muted-foreground">
        Page {page} of {maxPage}
      </span>
      {nextDisabled ? (
        <span className="text-sm text-muted-foreground/50">Next</span>
      ) : (
        <Link
          href={`/search?${buildQueryString(query, type, page + 1)}`}
          className="text-sm text-foreground hover:text-accent-hover"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeType = parseType(params.type);
  const page = parsePage(params.page);

  if (!query) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Search className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-base font-medium text-foreground">Search for a film or show</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try a title, like &ldquo;Blade Runner&rdquo; or &ldquo;The Wire&rdquo;.
        </p>
        <div className="mt-2">
          <SearchInput defaultValue="" />
        </div>
      </div>
    );
  }

  const { results, totalPages, totalResults } = await searchMulti(query, page);
  const filtered = activeType === "all" ? results : results.filter((r) => r.media_type === activeType);

  return (
    <div>
      <SearchInput defaultValue={query} />

      <div className="mt-6">
        <FilterTabs query={query} activeType={activeType} />
      </div>

      {totalResults > 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="tabular-nums text-foreground">{totalResults.toLocaleString()}</span>{" "}
          results for {query}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="text-base font-medium text-foreground">No results for &ldquo;{query}&rdquo;</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different spelling, or check for typos.
          </p>
        </div>
      ) : (
        <>
          <MediaGrid className="mt-6">
            {filtered.map((item) => (
              <PosterCard
                key={`${item.media_type}-${item.tmdb_id}`}
                tmdbId={item.tmdb_id}
                mediaType={item.media_type}
                title={item.title}
                year={item.year}
                posterPath={item.poster_path}
                showWatchlistToggle
              />
            ))}
          </MediaGrid>

          <SearchPagination query={query} type={activeType} page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}

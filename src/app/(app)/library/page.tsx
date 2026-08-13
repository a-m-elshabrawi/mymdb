import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LibraryFilterBar } from "@/components/library-filter-bar";
import { LibraryListTable } from "@/components/library-list-table";
import { MediaGrid } from "@/components/media-grid";
import { PaginationControls } from "@/components/pagination-controls";
import { PosterCard } from "@/components/poster-card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatDateOnly } from "@/lib/format";
import {
  getLibrary,
  getLibraryBaselineTotal,
  getLibraryFacets,
  hasActiveLibraryFilters,
  LIBRARY_PAGE_SIZE,
  parseLibraryFilters,
} from "@/lib/media/library";

export const metadata: Metadata = { title: "Library" };

interface LibraryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildPageHref(
  rawParams: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    if (value === undefined) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) {
      params.set(key, first);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `/library?${qs}` : "/library";
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const user = await requireUser();
  const rawParams = await searchParams;
  const filters = parseLibraryFilters(rawParams);
  const active = hasActiveLibraryFilters(filters);

  const [{ rows, total }, facets, baselineTotal] = await Promise.all([
    getLibrary(user.id, filters),
    getLibraryFacets(user.id),
    active ? getLibraryBaselineTotal(user.id) : Promise.resolve(null),
  ]);

  if (total === 0 && !active) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-base font-medium text-foreground">Your library is empty</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Search for a film or show and log it to start building your library.
        </p>
        <Button asChild>
          <Link href="/search">
            <Search className="size-4" />
            Search
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Library</h1>
        <p className="text-sm text-muted-foreground">
          {active && baselineTotal !== null ? (
            <>
              <span className="tabular-nums text-foreground">{total}</span> of{" "}
              <span className="tabular-nums">{baselineTotal}</span> titles
            </>
          ) : (
            <>
              <span className="tabular-nums text-foreground">{total}</span> titles
            </>
          )}
        </p>
      </div>

      <LibraryFilterBar filters={filters} facets={facets} />

      <div className="mt-6">
        {total === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-base font-medium text-foreground">No titles match these filters</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/library">Clear all</Link>
            </Button>
          </div>
        ) : filters.view === "list" ? (
          <LibraryListTable rows={rows} currentSort={filters.sort} rawParams={rawParams} />
        ) : (
          <MediaGrid>
            {rows.map((row) => (
              <PosterCard
                key={`${row.media_type}-${row.tmdb_id}`}
                tmdbId={row.tmdb_id}
                mediaType={row.media_type}
                title={row.title}
                year={row.year}
                posterPath={row.poster_path}
                rating={row.user_rating}
                footerDate={
                  filters.sort === "watched_desc" && row.last_watched_on
                    ? formatDateOnly(row.last_watched_on)
                    : null
                }
              />
            ))}
          </MediaGrid>
        )}
      </div>

      <PaginationControls
        page={filters.page}
        pageSize={LIBRARY_PAGE_SIZE}
        total={total}
        buildHref={(page) => buildPageHref(rawParams, page)}
      />
    </div>
  );
}

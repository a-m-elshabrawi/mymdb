import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MediaGrid } from "@/components/media-grid";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { WatchlistFilterBar } from "@/components/watchlist-filter-bar";
import { WatchlistPosterCard } from "@/components/watchlist-poster-card";
import { requireUser } from "@/lib/auth";
import {
  getWatchlist,
  getWatchlistFacets,
  hasActiveWatchlistFilters,
  parseWatchlistFilters,
  WATCHLIST_PAGE_SIZE,
} from "@/lib/media/watchlist";

export const metadata: Metadata = { title: "Watchlist" };

interface WatchlistPageProps {
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
  return qs ? `/watchlist?${qs}` : "/watchlist";
}

export default async function WatchlistPage({ searchParams }: WatchlistPageProps) {
  const user = await requireUser();
  const rawParams = await searchParams;
  const filters = parseWatchlistFilters(rawParams);
  const active = hasActiveWatchlistFilters(filters);

  const [{ rows, total }, facets] = await Promise.all([
    getWatchlist(user.id, filters),
    getWatchlistFacets(user.id),
  ]);

  if (total === 0 && !active) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-base font-medium text-foreground">Your watchlist is empty</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Search for a film or show to add it — or add anything straight from its detail page.
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground">What do you watch tonight?</p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="tabular-nums text-foreground">{total}</span> title{total === 1 ? "" : "s"}
        </p>
      </div>

      <WatchlistFilterBar filters={filters} facets={facets} total={total} />

      <div className="mt-6">
        {total === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-base font-medium text-foreground">No titles match these filters</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/watchlist">Clear all</Link>
            </Button>
          </div>
        ) : (
          <MediaGrid>
            {rows.map((row) => (
              <WatchlistPosterCard key={`${row.media_type}-${row.tmdb_id}`} row={row} />
            ))}
          </MediaGrid>
        )}
      </div>

      <PaginationControls
        page={filters.page}
        pageSize={WATCHLIST_PAGE_SIZE}
        total={total}
        buildHref={(page) => buildPageHref(rawParams, page)}
      />
    </div>
  );
}

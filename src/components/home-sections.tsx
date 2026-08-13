import { Shuffle } from "lucide-react";
import Link from "next/link";

import { HorizontalPosterRow, PosterRowItem } from "@/components/horizontal-poster-row";
import { PosterCard } from "@/components/poster-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { surpriseMe } from "@/lib/actions/watchlist";
import { formatDateOnly } from "@/lib/format";
import {
  getContinueWatching,
  getHomeStats,
  getRecentlyLogged,
  getWatchlistPreview,
} from "@/lib/media/home";

// ---------------------------------------------------------------------------
// Stat strip — a quiet status line, not a widget. Hidden entirely if the
// user hasn't watched anything yet (an all-zero row isn't "content").
// ---------------------------------------------------------------------------

export async function StatStripSection({ userId }: { userId: string }) {
  const stats = await getHomeStats(userId);
  if (stats.allTimeWatched === 0) {
    return null;
  }

  const currentYear = new Date().getUTCFullYear();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
      <span>
        <span className="tabular-nums text-foreground">{stats.loggedThisYear}</span> logged in{" "}
        {currentYear}
      </span>
      <span aria-hidden>·</span>
      <span>
        <span className="tabular-nums text-foreground">{stats.allTimeWatched}</span> watched
        all-time
      </span>
      {stats.averageRating !== null ? (
        <>
          <span aria-hidden>·</span>
          <span>
            <span className="tabular-nums text-foreground">
              {(stats.averageRating / 2).toFixed(1)}
            </span>{" "}
            average rating
          </span>
        </>
      ) : null}
    </div>
  );
}

export function StatStripSkeleton() {
  return <Skeleton className="h-5 w-72" />;
}

// ---------------------------------------------------------------------------
// Continue watching
// ---------------------------------------------------------------------------

export async function ContinueWatchingSection({ userId }: { userId: string }) {
  const items = await getContinueWatching(userId);
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Continue watching</h2>
      <HorizontalPosterRow>
        {items.map((item) => (
          <PosterRowItem key={`${item.media_type}-${item.tmdb_id}`}>
            <PosterCard
              tmdbId={item.tmdb_id}
              mediaType={item.media_type}
              title={item.title}
              year={item.year}
              posterPath={item.poster_path}
              sizes="144px"
            />
          </PosterRowItem>
        ))}
      </HorizontalPosterRow>
    </section>
  );
}

// ---------------------------------------------------------------------------
// From your watchlist
// ---------------------------------------------------------------------------

export async function WatchlistPreviewSection({ userId }: { userId: string }) {
  const items = await getWatchlistPreview(userId);
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">From your watchlist</h2>
        <Link href="/watchlist" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      <HorizontalPosterRow>
        {items.map((item) => (
          <PosterRowItem key={`${item.media_type}-${item.tmdb_id}`}>
            <PosterCard
              tmdbId={item.tmdb_id}
              mediaType={item.media_type}
              title={item.title}
              year={item.year}
              posterPath={item.poster_path}
              sizes="144px"
            />
          </PosterRowItem>
        ))}
      </HorizontalPosterRow>
      <form action={surpriseMe} className="mt-3">
        <Button type="submit" variant="outline" size="sm">
          <Shuffle className="size-4" />
          Surprise me
        </Button>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Recently logged
// ---------------------------------------------------------------------------

export async function RecentlyLoggedSection({ userId }: { userId: string }) {
  const entries = await getRecentlyLogged(userId);
  if (entries.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Recently logged</h2>
        <Link href="/diary" className="text-xs text-muted-foreground hover:text-foreground">
          View diary
        </Link>
      </div>
      <HorizontalPosterRow>
        {entries.map((entry) => (
          <PosterRowItem key={entry.id}>
            <PosterCard
              tmdbId={entry.tmdb_id}
              mediaType={entry.media_type}
              title={entry.title}
              year={entry.year}
              posterPath={entry.poster_path}
              rating={entry.entry_rating}
              footerDate={formatDateOnly(entry.watched_on)}
              sizes="144px"
            />
          </PosterRowItem>
        ))}
      </HorizontalPosterRow>
    </section>
  );
}

export function PosterRowSkeleton({ title }: { title: string }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-32 shrink-0 sm:w-36">
            <Skeleton className="aspect-2/3 w-full rounded-poster" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-1 h-3 w-10" />
          </div>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";

import { PosterImage } from "@/components/poster-image";
import { StarRating } from "@/components/star-rating";
import { WatchlistToggleButton } from "@/components/watchlist-toggle-button";

interface PosterCardProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  year: number | null;
  posterPath: string | null;
  sizes?: string;
  priority?: boolean;
  /** Provide to render a small readonly star row under the title (Library grid). */
  rating?: number | null;
  /** Pre-formatted date string shown beside the rating — e.g. when sorting by watched date. */
  footerDate?: string | null;
  /** Adds a hover/focus-revealed watchlist quick-add toggle in the top-right corner (search results). */
  showWatchlistToggle?: boolean;
}

const DEFAULT_SIZES =
  "(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw";

export function PosterCard({
  tmdbId,
  mediaType,
  title,
  year,
  posterPath,
  sizes = DEFAULT_SIZES,
  priority,
  rating,
  footerDate,
  showWatchlistToggle,
}: PosterCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/${mediaType}/${tmdbId}`}
        className="block rounded-poster outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <PosterImage
          posterPath={posterPath}
          title={title}
          sizes={sizes}
          priority={priority}
          imageClassName="transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="mt-2">
          <p className="truncate text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {title}
          </p>
          {year ? <p className="text-xs tabular-nums text-muted-foreground">{year}</p> : null}
          {rating !== undefined ? (
            <div className="mt-1 flex items-center justify-between gap-2">
              <StarRating value={rating} readOnly size="sm" />
              {footerDate ? (
                <span className="text-xs tabular-nums text-muted-foreground">{footerDate}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>

      {showWatchlistToggle ? (
        <WatchlistToggleButton tmdbId={tmdbId} mediaType={mediaType} />
      ) : null}
    </div>
  );
}

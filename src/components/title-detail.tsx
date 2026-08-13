import Image from "next/image";

import { PosterImage } from "@/components/poster-image";
import { TitleActions } from "@/components/title-actions";
import { TmdbRating } from "@/components/tmdb-rating";
import { Badge } from "@/components/ui/badge";
import { formatRuntime } from "@/lib/format";
import type { UserMediaRow, WatchEntryRow } from "@/lib/media/user-media";
import { tmdbImageUrl, type Media } from "@/lib/tmdb";

export function parseTmdbId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  return Number(raw);
}

interface TitleDetailProps {
  media: Media;
  userMedia: UserMediaRow | null;
  watchEntries: WatchEntryRow[];
}

export function TitleDetail({ media, userMedia, watchEntries }: TitleDetailProps) {
  const backdropUrl = tmdbImageUrl(media.backdrop_path, "w1280");
  const runtimeText = formatRuntime(media.runtime, media.media_type);
  const showOriginalTitle = media.original_title && media.original_title !== media.title;
  const isTv = media.media_type === "tv";

  return (
    <div>
      {/* Backdrop hero. Bleeds to the edges of the app's max-w-5xl content
          column (cancelling the layout's px-6/py-10), not the full
          viewport — keeping it inside the quiet-chrome system established
          for the header/nav. Falls back to a plain surface band when there
          is no backdrop, so the layout never collapses. */}
      <div className="relative -mx-6 -mt-10 aspect-21/9 min-h-[220px] w-[calc(100%+3rem)] overflow-hidden bg-surface sm:min-h-[320px]">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      </div>

      {/* Poster overlaps the hero's lower edge. */}
      <div className="relative z-10 -mt-16 flex gap-4 sm:-mt-24 sm:gap-6">
        <div className="w-28 shrink-0 sm:w-44">
          <PosterImage
            posterPath={media.poster_path}
            title={media.title}
            sizes="(min-width: 640px) 176px, 112px"
            priority
            className="shadow-lg shadow-black/40"
          />
        </div>

        <div className="min-w-0 flex-1 pt-14 sm:pt-24">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {media.title}
            </h1>
            {media.year ? (
              <span className="text-lg text-muted-foreground">{media.year}</span>
            ) : null}
          </div>
          {showOriginalTitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{media.original_title}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {runtimeText ? <span className="tabular-nums">{runtimeText}</span> : null}
        {isTv && media.number_of_seasons !== null ? (
          <>
            {runtimeText ? <span aria-hidden>·</span> : null}
            <span className="tabular-nums">
              {media.number_of_seasons} season{media.number_of_seasons === 1 ? "" : "s"} ·{" "}
              {media.number_of_episodes} episode{media.number_of_episodes === 1 ? "" : "s"}
            </span>
          </>
        ) : null}
        {media.status ? (
          <>
            <span aria-hidden>·</span>
            <span>{media.status}</span>
          </>
        ) : null}
      </div>

      {media.genres.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {media.genres.map((genre) => (
            <Badge key={genre} variant="secondary">
              {genre}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <TmdbRating rating={media.tmdb_rating} voteCount={media.tmdb_vote_count} />
      </div>

      {media.overview ? (
        <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-foreground/90">
          {media.overview}
        </p>
      ) : null}

      <div className="mt-8">
        <TitleActions
          tmdbId={media.tmdb_id}
          mediaType={media.media_type}
          title={media.title}
          posterPath={media.poster_path}
          userMedia={userMedia}
          watchEntries={watchEntries}
        />
      </div>
    </div>
  );
}

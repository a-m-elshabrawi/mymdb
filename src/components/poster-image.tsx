import Image from "next/image";

// Imports directly from lib/tmdb/images, not the lib/tmdb barrel: this
// component renders inside client components too (LogDialog, TitleActions),
// and the barrel (lib/tmdb/index.ts) transitively pulls in client.ts's
// `import "server-only"` guard via its other exports. images.ts has no such
// dependency — it's pure URL templating against TMDB's public, unauthenticated
// image CDN, no Bearer token involved — so it's safe in a client bundle.
import { tmdbImageUrl, type TmdbPosterSize } from "@/lib/tmdb/images";
import { cn } from "@/lib/utils";

interface PosterImageProps {
  posterPath: string | null;
  title: string;
  size?: TmdbPosterSize;
  sizes: string;
  priority?: boolean;
  /** Applied to the outer aspect-ratio/clipping wrapper. */
  className?: string;
  /** Applied to the <Image> element itself — e.g. a hover-scale transform. */
  imageClassName?: string;
}

function initials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "?";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function PosterImage({
  posterPath,
  title,
  size = "w342",
  sizes,
  priority,
  className,
  imageClassName,
}: PosterImageProps) {
  const src = tmdbImageUrl(posterPath, size);

  return (
    <div
      className={cn(
        "relative aspect-2/3 w-full overflow-hidden rounded-poster bg-surface-hover",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={`${title} poster`}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-lg font-medium text-muted-foreground">{initials(title)}</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { removeFromLibrary, setStatus } from "@/lib/actions/log";
import { cn } from "@/lib/utils";

interface WatchlistToggleButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
}

/**
 * A small client island rendered inside PosterCard (a Server Component) so
 * only this button ships interactivity, not the whole card. Local-only
 * optimism: search results don't carry the title's real watchlist state
 * (that would mean joining every result against user_media), so this just
 * tracks "did I just add/remove it this session" rather than reflecting
 * persisted truth on load — acceptable for a quick "search -> add -> decide
 * later" action.
 */
export function WatchlistToggleButton({ tmdbId, mediaType }: WatchlistToggleButtonProps) {
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const next = !added;
    startTransition(async () => {
      setAdded(next);
      const result = next
        ? await setStatus({ tmdbId, mediaType, status: "watchlist" })
        : await removeFromLibrary({ tmdbId, mediaType });
      if ("error" in result) {
        setAdded(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={added ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={added}
      className={cn(
        "absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 outline-none backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-background focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        added && "opacity-100",
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Bookmark className={cn("size-3.5", added && "fill-current")} />
      )}
    </button>
  );
}

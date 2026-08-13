"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { LogDialog } from "@/components/log-dialog";
import { PosterCard } from "@/components/poster-card";
import { Button } from "@/components/ui/button";
import { removeFromLibrary } from "@/lib/actions/log";
import type { LibraryRow } from "@/lib/media/library";

export function WatchlistPosterCard({ row }: { row: LibraryRow }) {
  const [logOpen, setLogOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      setRemoved(true);
      const result = await removeFromLibrary({ tmdbId: row.tmdb_id, mediaType: row.media_type });
      if ("error" in result) {
        setRemoved(false);
        toast.error(result.error);
      }
    });
  }

  if (removed) {
    return null;
  }

  return (
    <div className="group relative">
      <PosterCard
        tmdbId={row.tmdb_id}
        mediaType={row.media_type}
        title={row.title}
        year={row.year}
        posterPath={row.poster_path}
      />

      {/* pointer-events-none on the wrapper so it never blocks the poster
          link when not hovered; the button group re-enables pointer-events
          for itself. Opacity (not display) keeps both buttons in the tab
          order at all times, so focus-within — reached by keyboard alone —
          reveals them exactly when Tab would land on one. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-poster bg-background/85 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
        <div className="pointer-events-auto flex flex-col gap-2">
          <Button type="button" size="sm" onClick={() => setLogOpen(true)}>
            Log this
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleRemove} disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Remove
          </Button>
        </div>
      </div>

      <LogDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        tmdbId={row.tmdb_id}
        mediaType={row.media_type}
        title={row.title}
        posterPath={row.poster_path}
        entry={null}
        hasExistingEntries={false}
      />
    </div>
  );
}

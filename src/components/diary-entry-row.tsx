"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { LogDialog } from "@/components/log-dialog";
import { PosterImage } from "@/components/poster-image";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteEntry } from "@/lib/actions/log";
import type { DiaryEntryRow as DiaryEntryRowData } from "@/lib/media/library";
import type { WatchEntryRow } from "@/lib/media/user-media";
import { cn } from "@/lib/utils";

const REVIEW_EXPAND_THRESHOLD = 140;

function toWatchEntryRow(entry: DiaryEntryRowData): WatchEntryRow {
  return {
    id: entry.id,
    user_id: entry.user_id,
    tmdb_id: entry.tmdb_id,
    media_type: entry.media_type,
    watched_on: entry.watched_on,
    rating: entry.entry_rating,
    review: entry.review,
    is_rewatch: entry.is_rewatch,
    season_number: entry.season_number,
    episode_number: entry.episode_number,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  };
}

export function DiaryEntryRow({ entry }: { entry: DiaryEntryRowData }) {
  const [logOpen, setLogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const day = Number(entry.watched_on.slice(8, 10));
  const detailHref = `/${entry.media_type}/${entry.tmdb_id}`;

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEntry({ entryId: entry.id });
      if ("error" in result) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="group flex items-start gap-4 border-b border-border py-4 last:border-0">
      <div className="w-8 shrink-0 pt-1 text-right text-2xl font-semibold tabular-nums text-muted-foreground">
        {day}
      </div>

      <Link href={detailHref} className="w-12 shrink-0">
        <PosterImage posterPath={entry.poster_path} title={entry.title} sizes="48px" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Link href={detailHref} className="font-medium text-foreground hover:underline">
            {entry.title}
          </Link>
          {entry.year ? <span className="text-sm text-muted-foreground">{entry.year}</span> : null}
          {entry.is_rewatch ? <Badge variant="secondary">Rewatch</Badge> : null}
        </div>
        <div className="mt-1">
          <StarRating value={entry.entry_rating} readOnly size="sm" />
        </div>
        {entry.review ? (
          <div className="mt-1.5">
            <p
              className={cn(
                "text-sm leading-relaxed text-foreground/90",
                !expanded && "line-clamp-2",
              )}
            >
              {entry.review}
            </p>
            {entry.review.length > REVIEW_EXPAND_THRESHOLD ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Edit viewing"
          onClick={() => setLogOpen(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Delete viewing"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <LogDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        tmdbId={entry.tmdb_id}
        mediaType={entry.media_type}
        title={entry.title}
        posterPath={entry.poster_path}
        entry={toWatchEntryRow(entry)}
        hasExistingEntries
      />
    </div>
  );
}

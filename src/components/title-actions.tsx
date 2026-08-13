"use client";

import { Heart, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { LogDialog } from "@/components/log-dialog";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WatchlistButton } from "@/components/watchlist-button";
import { deleteEntry, removeFromLibrary, setRating, setStatus, toggleLiked } from "@/lib/actions/log";
import { formatDateOnly } from "@/lib/format";
import type { UserMediaRow, WatchEntryRow } from "@/lib/media/user-media";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type WatchStatus = Database["public"]["Enums"]["watch_status"];
type MediaType = Database["public"]["Enums"]["media_type"];

interface TitleActionsProps {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  userMedia: UserMediaRow | null;
  watchEntries: WatchEntryRow[];
}

const STATUS_OPTIONS: Record<MediaType, { value: WatchStatus; label: string }[]> = {
  movie: [
    { value: "watchlist", label: "Watchlist" },
    { value: "watched", label: "Watched" },
    { value: "dropped", label: "Dropped" },
  ],
  tv: [
    { value: "watchlist", label: "Watchlist" },
    { value: "watching", label: "Watching" },
    { value: "watched", label: "Watched" },
    { value: "dropped", label: "Dropped" },
  ],
};

export function TitleActions({
  tmdbId,
  mediaType,
  title,
  posterPath,
  userMedia,
  watchEntries,
}: TitleActionsProps) {
  const [logOpen, setLogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WatchEntryRow | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    userMedia?.liked ?? false,
    (_state: boolean, next: boolean) => next,
  );
  const [optimisticRating, setOptimisticRating] = useOptimistic(
    userMedia?.rating ?? null,
    (_state: number | null, next: number | null) => next,
  );

  const notInLibrary = userMedia === null;

  function handleToggleLiked() {
    const next = !optimisticLiked;
    startTransition(async () => {
      setOptimisticLiked(next);
      const result = await toggleLiked({ tmdbId, mediaType });
      if ("error" in result) {
        toast.error(result.error);
      }
    });
  }

  function handleRatingChange(value: number | null) {
    startTransition(async () => {
      setOptimisticRating(value);
      const result = await setRating({ tmdbId, mediaType, rating: value });
      if ("error" in result) {
        toast.error(result.error);
      }
    });
  }

  function handleStatusChange(value: string) {
    startTransition(async () => {
      const result = await setStatus({ tmdbId, mediaType, status: value as WatchStatus });
      if ("error" in result) {
        toast.error(result.error);
      }
    });
  }

  function handleDeleteEntry(entryId: string) {
    startTransition(async () => {
      const result = await deleteEntry({ entryId });
      if ("error" in result) {
        toast.error(result.error);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeFromLibrary({ tmdbId, mediaType });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setRemoveOpen(false);
    });
  }

  function openLogDialog(entry: WatchEntryRow | null) {
    setEditingEntry(entry);
    setLogOpen(true);
  }

  const likeButton = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={optimisticLiked ? "Unlike" : "Like"}
      aria-pressed={optimisticLiked}
      onClick={handleToggleLiked}
    >
      <Heart className={cn("size-4", optimisticLiked && "fill-destructive text-destructive")} />
    </Button>
  );

  return (
    <div>
      {notInLibrary ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => openLogDialog(null)}>Log this</Button>
          <WatchlistButton tmdbId={tmdbId} mediaType={mediaType} currentStatus={null} />
          {likeButton}
        </div>
      ) : (
        <div className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Your rating</p>
                <StarRating value={optimisticRating} onChange={handleRatingChange} size="lg" />
              </div>

              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Status</p>
                <Select
                  value={userMedia.status}
                  onValueChange={handleStatusChange}
                  disabled={isPending}
                >
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS[mediaType].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {likeButton}
              <Button onClick={() => openLogDialog(null)}>Log again</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="More actions">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onClick={() => setRemoveOpen(true)}>
                    Remove from library
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {watchEntries.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Your viewings</h2>
          <ul className="space-y-3">
            {watchEntries.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {formatDateOnly(entry.watched_on)}
                      </span>
                      {entry.is_rewatch ? <Badge variant="secondary">Rewatch</Badge> : null}
                    </div>
                    <div className="mt-1.5">
                      <StarRating value={entry.rating} readOnly size="sm" />
                    </div>
                    {entry.review ? (
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                        {entry.review}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit viewing"
                      onClick={() => openLogDialog(entry)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete viewing"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <LogDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        tmdbId={tmdbId}
        mediaType={mediaType}
        title={title}
        posterPath={posterPath}
        entry={editingEntry}
        hasExistingEntries={watchEntries.length > 0}
      />

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove from library?</DialogTitle>
            <DialogDescription>
              This deletes your rating, status, and all {watchEntries.length} viewing
              {watchEntries.length === 1 ? "" : "s"} for this title. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

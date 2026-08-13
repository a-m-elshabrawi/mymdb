"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { PosterImage } from "@/components/poster-image";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { logWatch, updateEntry } from "@/lib/actions/log";
import type { WatchEntryRow } from "@/lib/media/user-media";

const REVIEW_MAX = 5000;
const REVIEW_COUNTER_THRESHOLD = 4500;

function todayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface LogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  /** null = logging a new watch. Non-null = editing that entry. */
  entry: WatchEntryRow | null;
  /** Used for the create-mode rewatch default. */
  hasExistingEntries: boolean;
}

export function LogDialog({
  open,
  onOpenChange,
  tmdbId,
  mediaType,
  title,
  posterPath,
  entry,
  hasExistingEntries,
}: LogDialogProps) {
  const isEdit = entry !== null;

  const [watchedOn, setWatchedOn] = useState(todayLocalDateString());
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [isRewatch, setIsRewatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Radix keeps this component mounted while the dialog is closed, so state
  // doesn't reset on its own. Re-seed it during render — React's documented
  // "adjusting state when a prop changes" pattern — whenever `open`
  // transitions to true, rather than in an effect (which would cost an
  // extra render pass and is what triggered the react-hooks
  // set-state-in-effect lint error this replaced).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      if (entry) {
        setWatchedOn(entry.watched_on);
        setRating(entry.rating);
        setReview(entry.review ?? "");
        setIsRewatch(entry.is_rewatch);
      } else {
        setWatchedOn(todayLocalDateString());
        setRating(null);
        setReview("");
        setIsRewatch(hasExistingEntries);
      }
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const review_ = review.trim() === "" ? null : review;

      const result = isEdit
        ? await updateEntry({
            entryId: entry.id,
            watchedOn,
            rating,
            review: review_,
            isRewatch,
          })
        : await logWatch({
            tmdbId,
            mediaType,
            watchedOn,
            rating,
            review: review_,
            isRewatch,
          });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      toast.success(isRewatch ? `Rewatched ${title}` : `Logged ${title}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 shrink-0 overflow-hidden rounded-poster">
              <PosterImage posterPath={posterPath} title={title} sizes="40px" />
            </div>
            <DialogTitle className="text-left text-base">{title}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {isEdit ? "Edit this viewing." : "Log a viewing of this title."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="watched-on" className="text-sm font-medium text-foreground">
              Watched on
            </label>
            <Input
              id="watched-on"
              type="date"
              required
              max={todayLocalDateString()}
              min="1888-01-01"
              value={watchedOn}
              onChange={(event) => setWatchedOn(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-foreground">Rating</span>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium text-foreground">
              Review <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(event) => setReview(event.target.value.slice(0, REVIEW_MAX))}
              placeholder="What did you think?"
              maxLength={REVIEW_MAX}
            />
            {review.length > REVIEW_COUNTER_THRESHOLD ? (
              <p className="text-right text-xs tabular-nums text-muted-foreground">
                {review.length} / {REVIEW_MAX}
              </p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={isRewatch}
              onCheckedChange={(checked) => setIsRewatch(checked === true)}
            />
            This is a rewatch
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

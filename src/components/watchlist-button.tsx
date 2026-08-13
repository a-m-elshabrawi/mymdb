"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeFromLibrary, setStatus } from "@/lib/actions/log";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type WatchStatus = Database["public"]["Enums"]["watch_status"];

interface WatchlistButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  /** null means there's no user_media row yet. */
  currentStatus: WatchStatus | null;
  className?: string;
}

export function WatchlistButton({
  tmdbId,
  mediaType,
  currentStatus,
  className,
}: WatchlistButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onWatchlist = currentStatus === "watchlist";

  function applyWatchlist() {
    startTransition(async () => {
      const result = await setStatus({ tmdbId, mediaType, status: "watchlist" });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setConfirmOpen(false);
    });
  }

  function removeWatchlist() {
    // Reuses removeFromLibrary — safe here because this toggle-off path
    // only fires from a bare 'watchlist' row with nothing else attached
    // (this component is only ever shown pre-row in this stage's actual
    // wiring; the in-library panel takes over once a row exists). If a
    // future stage renders this against a 'watchlist' row that also
    // carries rating/liked/entries, this should become a narrower
    // "delete just the user_media row" action instead.
    startTransition(async () => {
      const result = await removeFromLibrary({ tmdbId, mediaType });
      if ("error" in result) {
        toast.error(result.error);
      }
    });
  }

  function handleClick() {
    if (currentStatus === "watched") {
      setConfirmOpen(true);
      return;
    }
    if (onWatchlist) {
      removeWatchlist();
      return;
    }
    startTransition(async () => {
      const result = await setStatus({ tmdbId, mediaType, status: "watchlist" });
      if ("error" in result) {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isPending}
        className={cn(className)}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Bookmark className={cn("size-4", onWatchlist && "fill-current")} />
        )}
        {onWatchlist ? "On Watchlist" : "Watchlist"}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Move back to watchlist?</DialogTitle>
            <DialogDescription>This will move it out of your watched list.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={applyWatchlist} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Move to watchlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

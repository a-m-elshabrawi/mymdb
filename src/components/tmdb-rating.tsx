import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface TmdbRatingProps {
  rating: number | null;
  voteCount: number | null;
  className?: string;
}

export function TmdbRating({ rating, voteCount, className }: TmdbRatingProps) {
  // A "0.0" rating on an obscure title reads as a bug, not as data — so
  // suppress the badge entirely when there are no votes to back it.
  if (rating === null || !voteCount) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Star className="size-4 fill-star text-star" aria-hidden />
      <span className="text-sm font-medium tabular-nums text-foreground">{rating.toFixed(1)}</span>
      <span className="text-sm tabular-nums text-muted-foreground">
        ({voteCount.toLocaleString()})
      </span>
    </div>
  );
}

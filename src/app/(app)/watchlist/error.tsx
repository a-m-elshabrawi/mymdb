"use client";

import { ErrorState } from "@/components/error-state";

export default function WatchlistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} title="Couldn't load your watchlist." />;
}

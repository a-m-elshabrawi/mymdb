"use client";

import { ErrorState } from "@/components/error-state";

export default function TvError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} title="Couldn't load this title." />;
}

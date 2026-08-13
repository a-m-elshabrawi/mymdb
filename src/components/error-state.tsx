"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function ErrorState({ error, reset, title }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // TmdbError's custom `.status` property doesn't survive Next.js's
  // server -> client error-boundary serialization — only `.message` and
  // `.digest` do. Match on the message text baked into lib/tmdb/client.ts
  // instead of `instanceof TmdbError`.
  const isRateLimited = error.message.includes("429");

  const heading = isRateLimited
    ? "Too many requests — try again shortly."
    : (title ?? "Something went wrong.");

  // Deliberately do NOT render error.message: it's raw exception text
  // (Postgres/PostgREST/TMDB internals) that means nothing to a user and
  // can leak implementation detail. The full error is logged to the
  // console above for debugging; users get a readable sentence and a retry.
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-base font-medium text-foreground">{heading}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isRateLimited
          ? "You've made a lot of requests in a short time. Give it a moment and try again."
          : "Something went wrong on our end. Try again, and if it keeps happening, come back in a bit."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

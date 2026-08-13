"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-base font-medium text-foreground">Something went wrong</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load this page. Try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

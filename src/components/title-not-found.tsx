import Link from "next/link";

import { Button } from "@/components/ui/button";

export function TitleNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-base font-medium text-foreground">We couldn&apos;t find that title.</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        It may not exist on TMDB, or the link is broken.
      </p>
      <Button asChild>
        <Link href="/search">Back to search</Link>
      </Button>
    </div>
  );
}

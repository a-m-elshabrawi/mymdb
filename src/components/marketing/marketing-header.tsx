import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Marketing chrome — deliberately not the app's SiteHeader (no search, no nav,
 * no account menu). Sits transparently over the hero at the top of the page.
 */
export function MarketingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          MyMDB
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";

// The root layout (src/app/layout.tsx) already renders <SiteFooter /> on
// every page, so this must NOT render its own — doing so is what caused the
// duplicate-footer bug. <main> is the single root element here.
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild className="mt-2">
        <Link href="/home">Back to home</Link>
      </Button>
    </main>
  );
}

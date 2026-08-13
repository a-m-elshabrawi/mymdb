import { Suspense } from "react";

import { HomeWelcome } from "@/components/home-welcome";
import {
  ContinueWatchingSection,
  PosterRowSkeleton,
  RecentlyLoggedSection,
  StatStripSection,
  StatStripSkeleton,
  WatchlistPreviewSection,
} from "@/components/home-sections";
import { requireUser } from "@/lib/auth";
import { hasAnyLibraryActivity } from "@/lib/media/home";

export default async function HomePage() {
  const user = await requireUser();
  const hasActivity = await hasAnyLibraryActivity(user.id);

  if (!hasActivity) {
    return <HomeWelcome />;
  }

  return (
    <div className="space-y-10">
      <Suspense fallback={<StatStripSkeleton />}>
        <StatStripSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<PosterRowSkeleton title="Continue watching" />}>
        <ContinueWatchingSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<PosterRowSkeleton title="From your watchlist" />}>
        <WatchlistPreviewSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<PosterRowSkeleton title="Recently logged" />}>
        <RecentlyLoggedSection userId={user.id} />
      </Suspense>
    </div>
  );
}

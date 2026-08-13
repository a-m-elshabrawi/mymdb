import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { parseTmdbId, TitleDetail } from "@/components/title-detail";
import { requireUser } from "@/lib/auth";
import { getOrFetchMedia } from "@/lib/media/cache";
import { getUserMedia, getWatchEntries } from "@/lib/media/user-media";

interface TvPageProps {
  params: Promise<{ tmdbId: string }>;
}

export async function generateMetadata({ params }: TvPageProps): Promise<Metadata> {
  const { tmdbId: raw } = await params;
  const tmdbId = parseTmdbId(raw);
  if (tmdbId === null) {
    return { title: "MyMDB" };
  }

  const media = await getOrFetchMedia(tmdbId, "tv");
  if (!media) {
    return { title: "MyMDB" };
  }

  // absolute bypasses the root layout's "%s · MyMDB" template so the suffix
  // isn't doubled — we want exactly "Title (Year) · MyMDB".
  return {
    title: { absolute: `${media.title}${media.year ? ` (${media.year})` : ""} · MyMDB` },
  };
}

export default async function TvPage({ params }: TvPageProps) {
  const { tmdbId: raw } = await params;
  const tmdbId = parseTmdbId(raw);
  if (tmdbId === null) {
    notFound();
  }

  const user = await requireUser();

  const [media, userMedia, watchEntries] = await Promise.all([
    getOrFetchMedia(tmdbId, "tv"),
    getUserMedia(user.id, tmdbId, "tv"),
    getWatchEntries(user.id, tmdbId, "tv"),
  ]);

  if (!media) {
    notFound();
  }

  return <TitleDetail media={media} userMedia={userMedia} watchEntries={watchEntries} />;
}

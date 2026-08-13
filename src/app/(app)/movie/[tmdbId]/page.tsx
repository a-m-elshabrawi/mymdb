import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { parseTmdbId, TitleDetail } from "@/components/title-detail";
import { requireUser } from "@/lib/auth";
import { getOrFetchMedia } from "@/lib/media/cache";
import { getUserMedia, getWatchEntries } from "@/lib/media/user-media";

interface MoviePageProps {
  params: Promise<{ tmdbId: string }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { tmdbId: raw } = await params;
  const tmdbId = parseTmdbId(raw);
  if (tmdbId === null) {
    return { title: "MyMDB" };
  }

  const media = await getOrFetchMedia(tmdbId, "movie");
  if (!media) {
    return { title: "MyMDB" };
  }

  // absolute bypasses the root layout's "%s · MyMDB" template so the suffix
  // isn't doubled — we want exactly "Title (Year) · MyMDB".
  return {
    title: { absolute: `${media.title}${media.year ? ` (${media.year})` : ""} · MyMDB` },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { tmdbId: raw } = await params;
  const tmdbId = parseTmdbId(raw);
  if (tmdbId === null) {
    notFound();
  }

  // requireUser() is cache()-wrapped, so this resolves from memory — the
  // (app) layout already paid for the Supabase Auth round-trip this
  // request. That lets all three data fetches below run in one Promise.all
  // instead of waterfalling.
  const user = await requireUser();

  const [media, userMedia, watchEntries] = await Promise.all([
    getOrFetchMedia(tmdbId, "movie"),
    getUserMedia(user.id, tmdbId, "movie"),
    getWatchEntries(user.id, tmdbId, "movie"),
  ]);

  if (!media) {
    notFound();
  }

  return <TitleDetail media={media} userMedia={userMedia} watchEntries={watchEntries} />;
}

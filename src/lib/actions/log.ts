"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { getOrFetchMedia } from "@/lib/media/cache";
import { getWatchEntries } from "@/lib/media/user-media";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type MediaType = Database["public"]["Enums"]["media_type"];

export type ActionResult = { error: string } | { success: true };

const MIN_DATE = "1888-01-01"; // floor, not a meaningful boundary otherwise — film predates this by a hair

function maxAllowedDate(): string {
  // The client sends the user's own local "today" (see log-dialog.tsx), but
  // this server-side ceiling can't know the caller's timezone. UTC+14 is
  // the furthest-ahead timezone that exists, so "server UTC today plus one
  // day" can never falsely reject a genuine "today" from anywhere on
  // Earth, while still catching real future dates.
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), "Enter a valid date.")
  .refine((v) => v >= MIN_DATE, "Date can't be before 1888.")
  .refine((v) => v <= maxAllowedDate(), "Date can't be in the future.");

const ratingSchema = z.number().int().min(1).max(10).nullable();

const reviewSchema = z
  .string()
  .max(5000, "Review must be 5000 characters or fewer.")
  .nullable()
  .transform((v) => (v === "" ? null : v));

function revalidateTitle(tmdbId: number, mediaType: MediaType) {
  revalidatePath(`/${mediaType}/${tmdbId}`);
}

// ---------------------------------------------------------------------------
// logWatch — insert a watch_entries row, upsert user_media to 'watched'.
// ---------------------------------------------------------------------------

const logWatchSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  watchedOn: dateSchema,
  rating: ratingSchema,
  review: reviewSchema,
  isRewatch: z.boolean(),
});

export type LogWatchInput = z.input<typeof logWatchSchema>;

export async function logWatch(input: LogWatchInput): Promise<ActionResult> {
  const parsed = logWatchSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { tmdbId, mediaType, watchedOn, rating, review, isRewatch } = parsed.data;

  const user = await requireUser();

  // FK guard: user_media and watch_entries both carry a composite FK to
  // media — insert before the media row exists and Postgres throws.
  const media = await getOrFetchMedia(tmdbId, mediaType);
  if (!media) {
    return { error: "Couldn't find that title." };
  }

  const supabase = await createClient();

  const { error: entryError } = await supabase.from("watch_entries").insert({
    user_id: user.id,
    tmdb_id: tmdbId,
    media_type: mediaType,
    watched_on: watchedOn,
    rating,
    review,
    is_rewatch: isRewatch,
  });

  if (entryError) {
    return { error: entryError.message };
  }

  // Logging a watch sets status to 'watched' unconditionally. rating is
  // only included in the payload when one was actually given — an
  // unrated watch shouldn't wipe out a previously set rating.
  const userMediaWrite: Database["public"]["Tables"]["user_media"]["Insert"] = {
    user_id: user.id,
    tmdb_id: tmdbId,
    media_type: mediaType,
    status: "watched",
  };
  if (rating !== null) {
    userMediaWrite.rating = rating;
  }

  const { error: userMediaError } = await supabase
    .from("user_media")
    .upsert(userMediaWrite, { onConflict: "user_id,tmdb_id,media_type" });

  if (userMediaError) {
    return { error: userMediaError.message };
  }

  revalidateTitle(tmdbId, mediaType);
  return { success: true };
}

// ---------------------------------------------------------------------------
// updateEntry — edit one entry. Rating syncs to user_media only when it
// changed AND this is the most recent entry (latest watched_on) for the
// title — editing an older, backdated entry never clobbers a newer rating.
// ---------------------------------------------------------------------------

const updateEntrySchema = z.object({
  entryId: z.string().uuid(),
  watchedOn: dateSchema,
  rating: ratingSchema,
  review: reviewSchema,
  isRewatch: z.boolean(),
});

export type UpdateEntryInput = z.input<typeof updateEntrySchema>;

export async function updateEntry(input: UpdateEntryInput): Promise<ActionResult> {
  const parsed = updateEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { entryId, watchedOn, rating, review, isRewatch } = parsed.data;

  const user = await requireUser();
  const supabase = await createClient();

  const { data: existingEntry, error: fetchError } = await supabase
    .from("watch_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }
  if (!existingEntry) {
    return { error: "That entry no longer exists." };
  }

  const tmdbId = existingEntry.tmdb_id;
  const mediaType = existingEntry.media_type;

  const media = await getOrFetchMedia(tmdbId, mediaType);
  if (!media) {
    return { error: "Couldn't find that title." };
  }

  const { error: updateError } = await supabase
    .from("watch_entries")
    .update({ watched_on: watchedOn, rating, review, is_rewatch: isRewatch })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const ratingChanged = rating !== existingEntry.rating;

  if (ratingChanged) {
    const entries = await getWatchEntries(user.id, tmdbId, mediaType);
    const mostRecent = entries[0];

    if (mostRecent && mostRecent.id === entryId) {
      const { error: syncError } = await supabase
        .from("user_media")
        .update({ rating })
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType);

      if (syncError) {
        return { error: syncError.message };
      }
    }
  }

  revalidateTitle(tmdbId, mediaType);
  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteEntry — deletes only that entry. Status is not reverted and
// user_media.rating is not recomputed — predictability beats cleverness.
// Use setStatus / setRating explicitly if those should change too.
// ---------------------------------------------------------------------------

const deleteEntrySchema = z.object({ entryId: z.string().uuid() });

export type DeleteEntryInput = z.input<typeof deleteEntrySchema>;

export async function deleteEntry(input: DeleteEntryInput): Promise<ActionResult> {
  const parsed = deleteEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data: entry, error: fetchError } = await supabase
    .from("watch_entries")
    .select("tmdb_id, media_type")
    .eq("id", parsed.data.entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }
  if (!entry) {
    return { error: "That entry no longer exists." };
  }

  const { error: deleteError } = await supabase
    .from("watch_entries")
    .delete()
    .eq("id", parsed.data.entryId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidateTitle(entry.tmdb_id, entry.media_type);
  return { success: true };
}

// ---------------------------------------------------------------------------
// setRating — direct rating from the detail page, no entry created.
// ---------------------------------------------------------------------------

const setRatingSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  rating: ratingSchema,
});

export type SetRatingInput = z.input<typeof setRatingSchema>;

export async function setRating(input: SetRatingInput): Promise<ActionResult> {
  const parsed = setRatingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { tmdbId, mediaType, rating } = parsed.data;

  const user = await requireUser();

  const media = await getOrFetchMedia(tmdbId, mediaType);
  if (!media) {
    return { error: "Couldn't find that title." };
  }

  const supabase = await createClient();

  // status is deliberately omitted from the payload: for a brand-new row
  // the column's own DB default ('watchlist') applies, and for an existing
  // row omitting it leaves whatever status (e.g. 'watched') untouched —
  // rating something you've already watched must not silently move it
  // back to the watchlist.
  const { error } = await supabase
    .from("user_media")
    .upsert(
      { user_id: user.id, tmdb_id: tmdbId, media_type: mediaType, rating },
      { onConflict: "user_id,tmdb_id,media_type" },
    );

  if (error) {
    return { error: error.message };
  }

  revalidateTitle(tmdbId, mediaType);
  return { success: true };
}

// ---------------------------------------------------------------------------
// setStatus
// ---------------------------------------------------------------------------

const setStatusSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  status: z.enum(["watchlist", "watching", "watched", "dropped"]),
});

export type SetStatusInput = z.input<typeof setStatusSchema>;

export async function setStatus(input: SetStatusInput): Promise<ActionResult> {
  const parsed = setStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { tmdbId, mediaType, status } = parsed.data;

  // Movies don't have a "watching" state — reject server-side too, not
  // just hide it in the UI.
  if (mediaType === "movie" && status === "watching") {
    return { error: "\"Watching\" isn't available for movies." };
  }

  const user = await requireUser();

  const media = await getOrFetchMedia(tmdbId, mediaType);
  if (!media) {
    return { error: "Couldn't find that title." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_media")
    .upsert(
      { user_id: user.id, tmdb_id: tmdbId, media_type: mediaType, status },
      { onConflict: "user_id,tmdb_id,media_type" },
    );

  if (error) {
    return { error: error.message };
  }

  revalidateTitle(tmdbId, mediaType);
  return { success: true };
}

// ---------------------------------------------------------------------------
// toggleLiked
// ---------------------------------------------------------------------------

const toggleLikedSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
});

export type ToggleLikedInput = z.input<typeof toggleLikedSchema>;

export async function toggleLiked(input: ToggleLikedInput): Promise<ActionResult> {
  const parsed = toggleLikedSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }
  const { tmdbId, mediaType } = parsed.data;

  const user = await requireUser();

  const media = await getOrFetchMedia(tmdbId, mediaType);
  if (!media) {
    return { error: "Couldn't find that title." };
  }

  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("user_media")
    .select("liked")
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();

  if (readError) {
    return { error: readError.message };
  }

  const nextLiked = !(existing?.liked ?? false);

  const { error: writeError } = await supabase
    .from("user_media")
    .upsert(
      { user_id: user.id, tmdb_id: tmdbId, media_type: mediaType, liked: nextLiked },
      { onConflict: "user_id,tmdb_id,media_type" },
    );

  if (writeError) {
    return { error: writeError.message };
  }

  revalidateTitle(tmdbId, mediaType);
  return { success: true };
}

// ---------------------------------------------------------------------------
// removeFromLibrary — deletes the user_media row and every entry for the
// title. Confirmation happens in the UI before this is ever called.
// ---------------------------------------------------------------------------

const removeFromLibrarySchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
});

export type RemoveFromLibraryInput = z.input<typeof removeFromLibrarySchema>;

export async function removeFromLibrary(input: RemoveFromLibraryInput): Promise<ActionResult> {
  const parsed = removeFromLibrarySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }
  const { tmdbId, mediaType } = parsed.data;

  const user = await requireUser();
  const supabase = await createClient();

  const { error: entriesError } = await supabase
    .from("watch_entries")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);

  if (entriesError) {
    return { error: entriesError.message };
  }

  const { error: userMediaError } = await supabase
    .from("user_media")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);

  if (userMediaError) {
    return { error: userMediaError.message };
  }

  revalidateTitle(tmdbId, mediaType);
  return { success: true };
}

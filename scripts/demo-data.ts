/**
 * The demo account's catalogue.
 *
 * This is the single source of truth for what `npm run seed:demo` writes.
 * Every TMDB id below was resolved from a live TMDB search and checked
 * against its title and year — do not hand-edit an id without re-checking it.
 *
 * Dates are expressed as `daysAgo` offsets rather than fixed calendar dates
 * so the demo never rots: re-running the seed always produces a log that
 * runs up to "today", which keeps the home dashboard's "logged this year"
 * stat and the diary's month grouping meaningful.
 *
 * Ratings are integers 1–10 (CLAUDE.md rule #6) — the UI halves them into
 * 0.5–5.0 stars at the presentation boundary. 10 = 5 stars, 9 = 4.5, and so on.
 */

export interface DemoWatch {
  /** Days before the seed run. Larger = further in the past. */
  daysAgo: number;
  /** Integer 1–10, or null for an unrated viewing. */
  rating: number | null;
  review?: string;
  isRewatch?: boolean;
}

export interface DemoTitle {
  tmdbId: number;
  mediaType: "movie" | "tv";
  /** Only for readability in this file and in seed output — never written to the DB. */
  label: string;
  status: "watchlist" | "watching" | "watched" | "dropped";
  liked?: boolean;
  /** When the user_media row was created. Drives watchlist "recently added" ordering. */
  addedDaysAgo: number;
  /**
   * Diary entries, newest last is not required — the seeder sorts them.
   * `user_media.rating` is derived from the most recent entry that carries
   * one, mirroring what updateEntry() in lib/actions/log.ts does, so the
   * seeded state is reachable through the real UI.
   */
  watches?: DemoWatch[];
  /** Only used when there are no watches — e.g. rated without logging a viewing. */
  rating?: number | null;
}

export const DEMO_TITLES: DemoTitle[] = [
  // ---------------------------------------------------------------------
  // Films — watched
  // ---------------------------------------------------------------------
  {
    tmdbId: 1233413,
    mediaType: "movie",
    label: "Sinners",
    status: "watched",
    liked: true,
    addedDaysAgo: 3,
    watches: [
      {
        daysAgo: 3,
        rating: 9,
        review:
          "Saw this in a packed theatre and the whole room went quiet for the juke joint sequence. Swings for something enormous and mostly lands it.",
      },
    ],
  },
  {
    tmdbId: 693134,
    mediaType: "movie",
    label: "Dune: Part Two",
    status: "watched",
    liked: true,
    addedDaysAgo: 300,
    watches: [
      { daysAgo: 300, rating: 8, review: "Bigger and meaner than the first one. The arena scene is extraordinary." },
      { daysAgo: 9, rating: 9, isRewatch: true, review: "Second time through, at home. Holds up — and the ending reads much colder once you know where it's going." },
    ],
  },
  {
    tmdbId: 496243,
    mediaType: "movie",
    label: "Parasite",
    status: "watched",
    liked: true,
    addedDaysAgo: 320,
    watches: [
      { daysAgo: 320, rating: 10, review: "The tonal handbrake turn halfway through is still the most confident thing I've seen in a modern film." },
      { daysAgo: 12, rating: 10, isRewatch: true, review: "Rewatch. Knowing the turn coming doesn't defuse it at all — you just spend the first hour noticing how carefully it's built." },
    ],
  },
  {
    tmdbId: 915935,
    mediaType: "movie",
    label: "Anatomy of a Fall",
    status: "watched",
    addedDaysAgo: 16,
    watches: [
      { daysAgo: 16, rating: 9, review: "Two and a half hours of people arguing about what a marriage was, and not a wasted minute. Sandra Hüller is unbelievable." },
    ],
  },
  {
    tmdbId: 666277,
    mediaType: "movie",
    label: "Past Lives",
    status: "watched",
    liked: true,
    addedDaysAgo: 24,
    watches: [
      { daysAgo: 24, rating: 9, review: "Quietly devastating. The last ten minutes are almost entirely silence and it earns every second of it." },
    ],
  },
  {
    tmdbId: 467244,
    mediaType: "movie",
    label: "The Zone of Interest",
    status: "watched",
    addedDaysAgo: 31,
    watches: [
      { daysAgo: 31, rating: 8, review: "The sound design is the film. Difficult in a way I think is the point, rather than in a way I enjoyed." },
    ],
  },
  {
    tmdbId: 965150,
    mediaType: "movie",
    label: "Aftersun",
    status: "watched",
    liked: true,
    addedDaysAgo: 38,
    watches: [
      { daysAgo: 38, rating: 9, review: "Barely a plot and it wrecked me anyway. Everything is in what the camera declines to explain." },
    ],
  },
  {
    tmdbId: 792307,
    mediaType: "movie",
    label: "Poor Things",
    status: "watched",
    addedDaysAgo: 45,
    watches: [{ daysAgo: 45, rating: 7, review: "Gorgeous to look at, and I admired it more than I liked it. The production design is doing a lot of heavy lifting." }],
  },
  { tmdbId: 872585, mediaType: "movie", label: "Oppenheimer", status: "watched", addedDaysAgo: 52, watches: [{ daysAgo: 52, rating: 8 }] },
  { tmdbId: 762504, mediaType: "movie", label: "Nope", status: "watched", addedDaysAgo: 59, watches: [{ daysAgo: 59, rating: 7 }] },
  { tmdbId: 419430, mediaType: "movie", label: "Get Out", status: "watched", addedDaysAgo: 66, watches: [{ daysAgo: 66, rating: 8 }] },
  {
    tmdbId: 503919,
    mediaType: "movie",
    label: "The Lighthouse",
    status: "watched",
    addedDaysAgo: 73,
    watches: [{ daysAgo: 73, rating: 7, review: "Two men, one rock, and a slow slide into nonsense. Shot beautifully; I'm still not sure I'd sit through it again." }],
  },
  { tmdbId: 146233, mediaType: "movie", label: "Prisoners", status: "watched", addedDaysAgo: 80, watches: [{ daysAgo: 80, rating: 8 }] },
  {
    tmdbId: 64690,
    mediaType: "movie",
    label: "Drive",
    status: "watched",
    addedDaysAgo: 88,
    watches: [{ daysAgo: 88, rating: 8, review: "Style as substance, and it works because the violence is never cool — it's abrupt and ugly every time." }],
  },
  { tmdbId: 313369, mediaType: "movie", label: "La La Land", status: "watched", addedDaysAgo: 95, watches: [{ daysAgo: 95, rating: 7 }] },
  {
    tmdbId: 376867,
    mediaType: "movie",
    label: "Moonlight",
    status: "watched",
    liked: true,
    addedDaysAgo: 103,
    watches: [{ daysAgo: 103, rating: 9, review: "Three acts, three actors, one person. The diner scene is perfect." }],
  },
  {
    tmdbId: 38,
    mediaType: "movie",
    label: "Eternal Sunshine of the Spotless Mind",
    status: "watched",
    liked: true,
    addedDaysAgo: 110,
    watches: [{ daysAgo: 110, rating: 10, review: "Gets sadder every time I watch it and I keep going back. The Montauk beach house collapsing is my favourite image in any film." }],
  },
  { tmdbId: 153, mediaType: "movie", label: "Lost in Translation", status: "watched", addedDaysAgo: 118, watches: [{ daysAgo: 118, rating: 8 }] },
  { tmdbId: 76, mediaType: "movie", label: "Before Sunrise", status: "watched", liked: true, addedDaysAgo: 126, watches: [{ daysAgo: 126, rating: 9 }] },
  { tmdbId: 807, mediaType: "movie", label: "Se7en", status: "watched", addedDaysAgo: 134, watches: [{ daysAgo: 134, rating: 8 }] },
  {
    tmdbId: 949,
    mediaType: "movie",
    label: "Heat",
    status: "watched",
    addedDaysAgo: 142,
    watches: [{ daysAgo: 142, rating: 8, review: "The shootout is the obvious set piece but the film is really about two men who have nothing else going on. Overlong and I don't care." }],
  },
  {
    tmdbId: 9693,
    mediaType: "movie",
    label: "Children of Men",
    status: "watched",
    addedDaysAgo: 150,
    watches: [{ daysAgo: 150, rating: 9, review: "Has aged into something much less like science fiction. The car ambush still makes me hold my breath." }],
  },
  { tmdbId: 37799, mediaType: "movie", label: "The Social Network", status: "watched", addedDaysAgo: 158, watches: [{ daysAgo: 158, rating: 8 }] },
  { tmdbId: 6977, mediaType: "movie", label: "No Country for Old Men", status: "watched", addedDaysAgo: 167, watches: [{ daysAgo: 167, rating: 9 }] },
  {
    tmdbId: 7345,
    mediaType: "movie",
    label: "There Will Be Blood",
    status: "watched",
    liked: true,
    addedDaysAgo: 176,
    watches: [{ daysAgo: 176, rating: 10, review: "Day-Lewis is obviously the headline but it's the score that makes the first twenty wordless minutes work." }],
  },
  {
    tmdbId: 843,
    mediaType: "movie",
    label: "In the Mood for Love",
    status: "watched",
    liked: true,
    addedDaysAgo: 185,
    watches: [{ daysAgo: 185, rating: 10, review: "A film almost entirely made of restraint. Every frame looks like it was composed to be hung on a wall." }],
  },
  { tmdbId: 11104, mediaType: "movie", label: "Chungking Express", status: "watched", addedDaysAgo: 194, watches: [{ daysAgo: 194, rating: 8 }] },
  {
    tmdbId: 129,
    mediaType: "movie",
    label: "Spirited Away",
    status: "watched",
    liked: true,
    addedDaysAgo: 430,
    watches: [
      { daysAgo: 430, rating: 9 },
      { daysAgo: 203, rating: 9, isRewatch: true, review: "Put this on meaning to have it in the background and ended up watching all of it, again." },
    ],
  },
  {
    tmdbId: 531428,
    mediaType: "movie",
    label: "Portrait of a Lady on Fire",
    status: "watched",
    liked: true,
    addedDaysAgo: 212,
    watches: [{ daysAgo: 212, rating: 10, review: "The final shot is a single unbroken take of a face and it's the best ending of the last decade." }],
  },
  { tmdbId: 120467, mediaType: "movie", label: "The Grand Budapest Hotel", status: "watched", addedDaysAgo: 221, watches: [{ daysAgo: 221, rating: 8 }] },
  {
    tmdbId: 244786,
    mediaType: "movie",
    label: "Whiplash",
    status: "watched",
    addedDaysAgo: 231,
    watches: [{ daysAgo: 231, rating: 9, review: "Edited like a thriller. I don't think it endorses Fletcher, but it's happy to let you think it might, which is the interesting part." }],
  },
  { tmdbId: 329865, mediaType: "movie", label: "Arrival", status: "watched", addedDaysAgo: 246, watches: [{ daysAgo: 246, rating: 9 }] },
  {
    tmdbId: 335984,
    mediaType: "movie",
    label: "Blade Runner 2049",
    status: "watched",
    liked: true,
    addedDaysAgo: 262,
    watches: [{ daysAgo: 262, rating: 9, review: "Slow in the way the original was slow, and far better looking. Deakins finally getting his Oscar for this was correct." }],
  },
  {
    tmdbId: 76341,
    mediaType: "movie",
    label: "Mad Max: Fury Road",
    status: "watched",
    liked: true,
    addedDaysAgo: 470,
    watches: [
      { daysAgo: 470, rating: 9, review: "Two hours of one chase and somehow never monotonous." },
      { daysAgo: 278, rating: 9, isRewatch: true },
    ],
  },
  {
    tmdbId: 545611,
    mediaType: "movie",
    label: "Everything Everywhere All at Once",
    status: "watched",
    addedDaysAgo: 295,
    watches: [{ daysAgo: 295, rating: 8, review: "Exhausting in both the good and the bad sense. The googly eye gets me every time though." }],
  },
  {
    tmdbId: 97370,
    mediaType: "movie",
    label: "Under the Skin",
    status: "watched",
    addedDaysAgo: 340,
    watches: [{ daysAgo: 340, rating: 6, review: "Admired the craft, never connected with it. The beach sequence is genuinely upsetting; the rest kept me at arm's length." }],
  },
  { tmdbId: 290098, mediaType: "movie", label: "The Handmaiden", status: "watched", addedDaysAgo: 360, watches: [{ daysAgo: 360, rating: 9 }] },

  // ---------------------------------------------------------------------
  // TV — watching / watched / dropped
  // ---------------------------------------------------------------------
  {
    tmdbId: 95396,
    mediaType: "tv",
    label: "Severance",
    status: "watching",
    liked: true,
    addedDaysAgo: 60,
    watches: [{ daysAgo: 6, rating: 10, review: "Two episodes into the new season and it has not lost a step. The office corridors are doing more work than most shows' entire scripts." }],
  },
  { tmdbId: 136315, mediaType: "tv", label: "The Bear", status: "watching", addedDaysAgo: 88, watches: [{ daysAgo: 20, rating: 8 }] },
  {
    tmdbId: 60059,
    mediaType: "tv",
    label: "Better Call Saul",
    status: "watching",
    addedDaysAgo: 120,
    watches: [{ daysAgo: 34, rating: 9, review: "Somewhere around season four this stopped being a prequel and started being the better show." }],
  },
  {
    tmdbId: 126308,
    mediaType: "tv",
    label: "Shōgun",
    status: "watched",
    addedDaysAgo: 90,
    watches: [{ daysAgo: 70, rating: 9, review: "Patient, expensive, and confident enough to let long scenes just be conversations in a language most of its audience doesn't speak." }],
  },
  {
    tmdbId: 83867,
    mediaType: "tv",
    label: "Andor",
    status: "watched",
    liked: true,
    addedDaysAgo: 130,
    watches: [{ daysAgo: 105, rating: 9, review: "A prison-break arc and a workplace drama wearing a franchise as a coat. Best thing with this logo on it." }],
  },
  { tmdbId: 76331, mediaType: "tv", label: "Succession", status: "watched", addedDaysAgo: 160, watches: [{ daysAgo: 140, rating: 9 }] },
  {
    tmdbId: 67070,
    mediaType: "tv",
    label: "Fleabag",
    status: "watched",
    liked: true,
    addedDaysAgo: 200,
    watches: [{ daysAgo: 175, rating: 10, review: "Six half-hours a season and it does more than most shows manage in sixty. The second season is close to flawless." }],
  },
  {
    tmdbId: 54344,
    mediaType: "tv",
    label: "The Leftovers",
    status: "watched",
    liked: true,
    addedDaysAgo: 240,
    watches: [{ daysAgo: 215, rating: 10, review: "Season one is a slog and seasons two and three are among the best television ever made. Worth the toll." }],
  },
  { tmdbId: 87108, mediaType: "tv", label: "Chernobyl", status: "watched", addedDaysAgo: 280, watches: [{ daysAgo: 255, rating: 9 }] },
  { tmdbId: 1396, mediaType: "tv", label: "Breaking Bad", status: "watched", addedDaysAgo: 420, watches: [{ daysAgo: 380, rating: 9 }] },
  {
    tmdbId: 1920,
    mediaType: "tv",
    label: "Twin Peaks",
    status: "dropped",
    addedDaysAgo: 330,
    watches: [{ daysAgo: 300, rating: 6, review: "Got most of the way through the second season and lost the thread. Might come back to it; might not." }],
  },
  { tmdbId: 70523, mediaType: "tv", label: "Dark", status: "dropped", addedDaysAgo: 260, rating: null },

  // ---------------------------------------------------------------------
  // Watchlist
  // ---------------------------------------------------------------------
  { tmdbId: 933260, mediaType: "movie", label: "The Substance", status: "watchlist", addedDaysAgo: 4 },
  { tmdbId: 976893, mediaType: "movie", label: "Perfect Days", status: "watchlist", addedDaysAgo: 8 },
  { tmdbId: 466420, mediaType: "movie", label: "Killers of the Flower Moon", status: "watchlist", addedDaysAgo: 15 },
  { tmdbId: 817758, mediaType: "movie", label: "TÁR", status: "watchlist", addedDaysAgo: 22 },
  { tmdbId: 110382, mediaType: "tv", label: "Pachinko", status: "watchlist", addedDaysAgo: 26 },
  { tmdbId: 491584, mediaType: "movie", label: "Burning", status: "watchlist", addedDaysAgo: 30 },
  { tmdbId: 1398, mediaType: "movie", label: "Stalker", status: "watchlist", addedDaysAgo: 41 },
  { tmdbId: 25538, mediaType: "movie", label: "Yi Yi", status: "watchlist", addedDaysAgo: 55 },
  { tmdbId: 204284, mediaType: "tv", label: "The Rehearsal", status: "watchlist", addedDaysAgo: 60 },
  { tmdbId: 204, mediaType: "movie", label: "The Wages of Fear", status: "watchlist", addedDaysAgo: 68 },
  { tmdbId: 346, mediaType: "movie", label: "Seven Samurai", status: "watchlist", addedDaysAgo: 82 },
  { tmdbId: 25237, mediaType: "movie", label: "Come and See", status: "watchlist", addedDaysAgo: 96 },
  { tmdbId: 655, mediaType: "movie", label: "Paris, Texas", status: "watchlist", addedDaysAgo: 110 },

  // Deliberately shorter than the rest of the watchlist. The watchlist page
  // filters on runtime with "Under 90m" / "Under 2h" / "Under 2h 30m"
  // buckets, and an arthouse-only list is all 2h+ — every bucket but the
  // last would come back empty and the filter would look broken.
  { tmdbId: 337703, mediaType: "movie", label: "The Red Turtle", status: "watchlist", addedDaysAgo: 11 },
  { tmdbId: 210479, mediaType: "movie", label: "Locke", status: "watchlist", addedDaysAgo: 19 },
  { tmdbId: 121986, mediaType: "movie", label: "Frances Ha", status: "watchlist", addedDaysAgo: 35 },
  { tmdbId: 429200, mediaType: "movie", label: "Good Time", status: "watchlist", addedDaysAgo: 48 },
  { tmdbId: 132344, mediaType: "movie", label: "Before Midnight", status: "watchlist", addedDaysAgo: 74 },
];

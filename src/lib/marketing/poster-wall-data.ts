/**
 * Hardcoded TMDB poster paths for the marketing landing-page poster wall.
 *
 * Why hardcoded: "/" is the most-hit public route and must be fully static —
 * it should never depend on a TMDB call, a rate limit, or whatever happens to
 * be trending. These bare paths (matching the format stored in the `media`
 * table) are rendered through the existing `tmdbImageUrl` helper, so they load
 * straight from the TMDB image CDN, which `next.config` remotePatterns already
 * allows and the global footer attribution already covers.
 *
 * The wall is purely decorative (aria-hidden), so these are not linked to real
 * detail pages and carry no titles in the app — the comments are just so the
 * palette spread stays legible to a human editing this list. The set is
 * deliberately varied in colour: a wall of six teal-and-orange thrillers reads
 * as a texture, not a wall of films. Order is interleaved so that the
 * round-robin column distribution keeps adjacent columns visually distinct.
 *
 * Every path here was verified to resolve on the CDN when this list was built.
 */
export const POSTER_WALL_PATHS: readonly string[] = [
  "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg", // The Grand Budapest Hotel — pink
  "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", // The Matrix — green/black
  "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", // Oppenheimer — amber/black
  "/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg", // Frozen — icy blue
  "/602vevIURmpDfzbnv5Ubi6wIkQm.jpg", // Drive — magenta neon
  "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // The Godfather — near-black
  "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg", // Everything Everywhere All at Once — multicolour
  "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", // Blade Runner 2049 — orange
  "/4911T5FbJ9eD2Faz5Z8cT3SUhU3.jpg", // Moonlight — blue/purple
  "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", // Barbie — hot pink
  "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", // Interstellar — pale ice
  "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", // Breaking Bad — yellow/green
  "/q719jXXEzOoYaps6babgKnONONX.jpg", // Your Name — blue sky
  "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", // Stranger Things — red
  "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", // Spirited Away — soft green
  "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", // Dune — sand/beige
  "/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg", // Her — warm red/pink
  "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", // Into the Spider-Verse — pink/blue
  "/7fn624j5lj3xTme2SgiLCeuedmO.jpg", // Whiplash — yellow/dark
  "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", // Inception — steel blue
  "/npHNjldbeTHdKKw28bJKs7lzqzj.jpg", // Ratatouille — warm red
  "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // The Dark Knight — blue/black
  "/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg", // Coco — orange/purple
  "/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg", // Arrival — grey/blue
  "/hA2ple9q4qnwxp3hKVNhroipsir.jpg", // Mad Max: Fury Road — orange/blue
  "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg", // La La Land — purple night
  "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", // Pulp Fiction — red/yellow
  "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", // Toy Story — blue sky
  "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", // Fight Club — pink
  "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Parasite — grey/green
  "/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg", // Better Call Saul — white/yellow
  "/74xTEgt7R36Fpooo50r9T25onhq.jpg", // The Batman — red/dark
  "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", // Forrest Gump — blue sky
  "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", // Joker — teal/red
  "/1M876KPjulVwppEpldhdc8V4o68.jpg", // The Crown — gold/dark
  "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", // Schindler's List — B&W + red
  "/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", // Peaky Blinders — grey/ember
  "/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg", // The Queen's Gambit — green/cream
  "/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg", // The Social Network — cool blue
  "/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg", // The Mandalorian — beige/dark
  "/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", // Dark — deep blue
  "/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg", // No Country for Old Men — warm beige
];

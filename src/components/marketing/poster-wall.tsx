import Image from "next/image";

import { tmdbImageUrl } from "@/lib/tmdb/images";
import { POSTER_WALL_PATHS } from "@/lib/marketing/poster-wall-data";
import { cn } from "@/lib/utils";

// 7 columns at xl; fewer are revealed as the viewport narrows (see COLUMN_SLOT
// visibility classes). Posters are distributed round-robin so every column
// stays palette-varied even when only three are shown.
const COLUMN_COUNT = 7;

// Per-column marquee tuning. Durations vary 45s–90s and directions alternate,
// so adjacent columns drift opposite ways at different speeds — that parallax
// is what reads as depth rather than a looping video.
const COLUMNS: { durationSeconds: number; direction: "up" | "down" }[] = [
  { durationSeconds: 61, direction: "up" },
  { durationSeconds: 78, direction: "down" },
  { durationSeconds: 47, direction: "up" },
  { durationSeconds: 85, direction: "down" },
  { durationSeconds: 68, direction: "up" },
  { durationSeconds: 53, direction: "down" },
  { durationSeconds: 90, direction: "up" },
];

// Each column past the third only appears once there's room for it.
const COLUMN_VISIBILITY = [
  "",
  "",
  "",
  "hidden md:block",
  "hidden lg:block",
  "hidden xl:block",
  "hidden xl:block",
];

function columnPaths(columnIndex: number): string[] {
  const paths: string[] = [];
  for (let i = columnIndex; i < POSTER_WALL_PATHS.length; i += COLUMN_COUNT) {
    paths.push(POSTER_WALL_PATHS[i]);
  }
  return paths;
}

function PosterTile({ path, priority }: { path: string; priority: boolean }) {
  const src = tmdbImageUrl(path, "w185");
  if (!src) {
    return null;
  }
  return (
    // A bottom margin (not a flex gap) on every tile — including the last —
    // makes the duplicated block exactly half the total height, so the -50%
    // translate lands seamlessly with no sub-pixel snap at the seam.
    <div className="mb-3 overflow-hidden rounded-poster bg-surface-hover">
      <Image
        src={src}
        alt=""
        width={185}
        height={278}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="h-auto w-full"
      />
    </div>
  );
}

function PosterColumn({ index }: { index: number }) {
  const paths = columnPaths(index);
  const { durationSeconds, direction } = COLUMNS[index];

  return (
    <div className={cn("w-28 shrink-0 sm:w-32 md:w-36", COLUMN_VISIBILITY[index])}>
      <div
        className="poster-wall-column flex flex-col"
        style={{
          animationName: direction === "up" ? "poster-marquee-up" : "poster-marquee-down",
          animationDuration: `${durationSeconds}s`,
        }}
      >
        {/* First copy. Only the top tile of each column is the "first visible
            row", so it gets priority; every other tile lazy-loads. */}
        {paths.map((path, tileIndex) => (
          <PosterTile key={`a-${path}`} path={path} priority={tileIndex === 0} />
        ))}
        {/* Second copy, rendered back-to-back to make the loop seamless. */}
        {paths.map((path) => (
          <PosterTile key={`b-${path}`} path={path} priority={false} />
        ))}
      </div>
    </div>
  );
}

/**
 * Decorative animated poster wall behind the landing hero. It is background,
 * not content: `aria-hidden` and `pointer-events-none` keep it out of the tab
 * order and the accessibility tree entirely, and every poster's alt is "".
 *
 * The whole grid sits on a tilted, over-scaled plane (rotate + scale) so its
 * edges stay off-screen. Legibility overlays (gradient + radial scrim) are
 * layered by the hero on top of this — this component only draws the wall.
 */
export function PosterWall() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 flex gap-3"
        style={{ transform: "translate(-50%, -50%) rotate(-8deg) scale(1.4)" }}
      >
        {Array.from({ length: COLUMN_COUNT }).map((_, index) => (
          <PosterColumn key={index} index={index} />
        ))}
      </div>
    </div>
  );
}

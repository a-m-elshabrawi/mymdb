"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** 1-10 (half-star steps), or null for unrated. */
  value: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
  size?: "sm" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<"sm" | "lg", string> = {
  sm: "size-4",
  lg: "size-8",
};

const GAP_CLASSES: Record<"sm" | "lg", string> = {
  sm: "gap-0.5",
  lg: "gap-1",
};

function fillForStar(displayHalf: number, starIndex: number): 0 | 0.5 | 1 {
  const starValue = starIndex + 1;
  if (displayHalf >= starValue) return 1;
  if (displayHalf >= starValue - 0.5) return 0.5;
  return 0;
}

function StarGlyph({ fill, sizeClass }: { fill: 0 | 0.5 | 1; sizeClass: string }) {
  return (
    <span className={cn("relative inline-block", sizeClass)}>
      <Star className="absolute inset-0 size-full fill-transparent text-border" strokeWidth={1.5} />
      {fill > 0 ? (
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: fill === 1 ? "100%" : "50%" }}
        >
          <Star className="size-full fill-star text-star" strokeWidth={1.5} />
        </span>
      ) : null}
    </span>
  );
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "sm",
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayRaw = hoverValue ?? value ?? 0;
  const displayHalf = displayRaw / 2;
  const starSizeClass = SIZE_CLASSES[size];

  if (readOnly) {
    return (
      <div
        role="img"
        aria-label={value ? `${(value / 2).toFixed(1)} out of 5 stars` : "Not rated"}
        className={cn("inline-flex items-center", GAP_CLASSES[size], className)}
      >
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <StarGlyph
            key={starIndex}
            fill={fillForStar(displayHalf, starIndex)}
            sizeClass={starSizeClass}
          />
        ))}
      </div>
    );
  }

  function commit(next: number | null) {
    onChange?.(next);
  }

  function handleStarClick(starIndex: number, half: "left" | "right") {
    const clicked = starIndex * 2 + (half === "left" ? 1 : 2);
    commit(value === clicked ? null : clicked);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const current = value ?? 0;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = Math.min(10, current + 1);
      commit(next === 0 ? null : next);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = Math.max(0, current - 1);
      commit(next === 0 ? null : next);
    } else if (event.key === "Home") {
      event.preventDefault();
      commit(null);
    } else if (event.key === "End") {
      event.preventDefault();
      commit(10);
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      commit(null);
    }
  }

  const valueText = value ? `${(value / 2).toFixed(1)} out of 5` : "Not rated";

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={value ?? 0}
      aria-valuetext={valueText}
      aria-label="Your rating"
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHoverValue(null)}
      className={cn(
        "inline-flex w-fit items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        GAP_CLASSES[size],
        className,
      )}
    >
      {Array.from({ length: 5 }).map((_, starIndex) => (
        <div key={starIndex} className={cn("relative", starSizeClass)}>
          <StarGlyph fill={fillForStar(displayHalf, starIndex)} sizeClass={starSizeClass} />
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
            onMouseEnter={() => setHoverValue(starIndex * 2 + 1)}
            onClick={() => handleStarClick(starIndex, "left")}
          />
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            onMouseEnter={() => setHoverValue(starIndex * 2 + 2)}
            onClick={() => handleStarClick(starIndex, "right")}
          />
        </div>
      ))}
    </div>
  );
}

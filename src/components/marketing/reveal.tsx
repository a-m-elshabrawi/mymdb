"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Milliseconds of transition-delay, for staggering sibling reveals. */
  delay?: number;
  className?: string;
}

/**
 * Fades + lifts its children into view the first time they intersect the
 * viewport. Deliberately renders visible by default and only *adds* the hidden
 * state on mount — so with JS disabled, or in the flash before hydration, the
 * page is fully readable rather than blank. Reveals once and never replays
 * (unobserve after the first hit), and no-ops entirely under reduced motion.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Hide now (post-mount), then reveal on first intersection.
    setHidden(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHidden(false);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: hidden ? "0ms" : `${delay}ms` }}
      className={cn(
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        hidden ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

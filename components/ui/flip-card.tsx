"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FlipCardProps = {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  gradientClass?: string;
  height?: string;
};

export function FlipCard({
  front,
  back,
  className,
  gradientClass = "flip-gradient-violet",
  height = "h-[168px]",
}: FlipCardProps) {
  const [flipped, setFlipped] = React.useState(false);

  return (
    <div
      className={cn("flip-card", height, className)}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label="Tap to flip card for more details"
    >
      <div
        className={cn(
          "flip-card-inner",
          flipped && "flip-card-flipped"
        )}
      >
        <div className={cn("flip-card-face flip-card-front", gradientClass)}>
          {front}
        </div>
        <div className={cn("flip-card-face flip-card-back", gradientClass)}>
          {back}
        </div>
      </div>
    </div>
  );
}
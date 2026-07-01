import { BrandMark } from "./brand-mark";
import { BrandWordmark } from "./brand-wordmark";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  markSize?: number;
  wordmarkSize?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export function BrandLockup({
  markSize = 44,
  wordmarkSize = "md",
  showTagline = true,
  className,
}: BrandLockupProps) {
  return (
    <div className={cn("inline-flex items-center gap-3.5", className)}>
      <BrandMark size={markSize} priority />
      <BrandWordmark showTagline={showTagline} size={wordmarkSize} />
    </div>
  );
}
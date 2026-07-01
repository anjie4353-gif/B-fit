import { APP_NAME, APP_TAGLINE_UPPER, BRAND_NAVY, BRAND_TAGLINE_GRAY, BRAND_TEAL } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { title: "text-lg", tagline: "text-[8px]" },
  md: { title: "text-2xl", tagline: "text-[9px]" },
  lg: { title: "text-[2.35rem]", tagline: "text-[10px]" },
};

/** Premium vector-style wordmark — not a pasted image; matches official brand colors. */
export function BrandWordmark({
  showTagline = true,
  size = "md",
  className,
}: BrandWordmarkProps) {
  const s = sizeMap[size];
  const [prefix, suffix] = APP_NAME.split("-");

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <span
        className={cn("font-display font-extrabold leading-none tracking-tight", s.title)}
        aria-label={APP_NAME}
      >
        <span style={{ color: BRAND_NAVY }}>{prefix}-</span>
        <span style={{ color: BRAND_TEAL }}>{suffix}</span>
      </span>
      {showTagline && (
        <span
          className={cn(
            "mt-1 font-sans font-semibold uppercase tracking-[0.2em]",
            s.tagline
          )}
          style={{ color: BRAND_TAGLINE_GRAY }}
        >
          {APP_TAGLINE_UPPER}
        </span>
      )}
    </div>
  );
}
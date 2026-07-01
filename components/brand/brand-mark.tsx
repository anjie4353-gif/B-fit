import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** Official B-Fit logo mark — transparent, blends with app background. */
export function BrandMark({ size = 44, className, priority }: BrandMarkProps) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      width={size}
      height={Math.round(size * 1.11)}
      priority={priority}
      className={cn("brand-mark-img h-auto w-auto object-contain select-none", className)}
      style={{ width: size, height: "auto", background: "transparent" }}
      aria-hidden
    />
  );
}
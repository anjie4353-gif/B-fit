---
name: bfit-brand
description: >
  B-Fit official brand assets and logo integration. Use when updating logo, wordmark,
  app icon, splash, or brand colors. Never paste white-background images — use transparent
  PNG mark + CSS wordmark. Colors: navy #002B5B, teal #00B4D8, app bg #f5f3ff.
---

# B-Fit Brand

## Official assets

| Asset | Path |
|-------|------|
| Logo mark (transparent) | `public/brand/logo-mark.png` |
| Wordmark (CSS, preferred) | `components/brand/brand-wordmark.tsx` |
| Lockup (mark + name) | `components/brand/brand-lockup.tsx` |

Source files: user provides `image copy.png` (mark) and `image copy 2.png` (name reference).

## Rules

1. **No white boxes** — remove white with ImageMagick `-fuzz 14% -transparent white -trim`
2. **Wordmark = CSS text**, not pasted PNG (premium, scales cleanly)
3. **App background blend** — PWA icons use `#f5f3ff` (same as `--background`)
4. **Colors** — `lib/brand.ts`: `BRAND_NAVY`, `BRAND_TEAL`, tagline gray

## Regenerate PWA icons

```bash
npm run brand:assets
```

## Usage in UI

```tsx
import { BrandLockup } from "@/components/brand/brand-lockup";
<BrandLockup markSize={48} wordmarkSize="sm" />
```
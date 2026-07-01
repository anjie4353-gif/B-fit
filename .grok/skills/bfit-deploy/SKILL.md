---
name: bfit-deploy
description: >
  Deploy B-Fit / HerHealth to GitHub and Vercel. Use when pushing code, production
  deploy, PWA install link, APK build, or Vercel env setup. Ensures app works on
  live HTTPS with install/download flow intact.
---

# B-Fit Deploy (GitHub + Vercel)

## Repos & accounts

- **GitHub:** https://github.com/anjie4353-gif/B-fit
- **Vercel:** `npx vercel --prod` (logged-in account deploys)

## Pre-push checklist

```bash
npm run test:unit   # must pass
npm run build       # 34 routes, exit 0
```

Never commit: `.env*.local`, `data/`, `test-results/`, `.vercel/`

## Push to GitHub

```bash
git remote add origin https://github.com/anjie4353-gif/B-fit.git
git push -u origin master
```

## Vercel production deploy

```bash
npx vercel link --yes
npx vercel env add NEXT_PUBLIC_APP_URL production   # set to final HTTPS URL
npx vercel env add BFIT_DB_DRIVER production        # sqlite
npx vercel env add CRON_SECRET production
npx vercel env add GROQ_API_KEY production          # AI coach
npx vercel --prod --yes
```

After first deploy, **update** `NEXT_PUBLIC_APP_URL` to the actual Vercel URL and redeploy.

## PWA install (production)

Users open live HTTPS link → install works via:

1. **PWA:** `/welcome` InstallPrompt or `/install` → "Install App"
2. **Manual:** Chrome ⋮ → Install app / Add to Home screen
3. **APK:** `/install` → Download (requires `npm run android:build` + APK in `public/downloads/`)

Requirements for install prompt:
- HTTPS (Vercel provides)
- `manifest.webmanifest` + `/sw.js` registered via `PwaProvider`
- Icons in `public/icons/`

## Post-deploy verify

- `/` → language → onboarding → home
- `/install` shows install button (not localhost warning)
- `/manifest.webmanifest` returns JSON
- `/api/db/health` returns OK
- Water goal is agent-set (read-only in profile)

## Non-disruptive

Deploy must not change app behavior — only publish existing code with correct env vars.
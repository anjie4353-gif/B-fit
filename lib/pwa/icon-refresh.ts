import { getInstallPlatform, getPublicAppUrl } from "@/lib/pwa/install";
import { PWA_ICON_URLS } from "@/lib/pwa/icon-urls";

/** Prefetch latest manifest + icons so Android WebAPK can pick up new artwork. */
export async function warmIconAssets(): Promise<void> {
  if (typeof window === "undefined") return;
  const urls = [
    PWA_ICON_URLS.manifest,
    PWA_ICON_URLS.icon192,
    PWA_ICON_URLS.icon512,
    PWA_ICON_URLS.maskable192,
    PWA_ICON_URLS.appleTouch,
  ];
  await Promise.all(
    urls.map((url) =>
      fetch(url, { cache: "no-store", credentials: "same-origin" }).catch(
        () => undefined
      )
    )
  );
}

export function getIconRefreshUrl(): string {
  return `${getPublicAppUrl()}/install#icon-refresh`;
}

/** Standalone PWA cannot re-add icon — open install guide in system browser. */
export function openIconRefreshInBrowser(): void {
  const url = getIconRefreshUrl();
  const platform = getInstallPlatform();
  if (platform === "ios") {
    window.location.href = url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
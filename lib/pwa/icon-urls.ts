import { APP_VERSION } from "./version";

/** Cache-bust icon/manifest URLs so Android WebAPK picks up new home-screen icon. */
export function versionedAsset(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${encodeURIComponent(APP_VERSION)}`;
}

export const PWA_ICON_URLS = {
  icon192: versionedAsset("/icons/icon-192.png"),
  icon512: versionedAsset("/icons/icon-512.png"),
  maskable192: versionedAsset("/icons/maskable-icon-192.png"),
  maskable512: versionedAsset("/icons/maskable-icon-512.png"),
  appleTouch: versionedAsset("/icons/apple-touch-icon.png"),
  favicon: versionedAsset("/favicon.ico"),
  manifest: versionedAsset("/manifest.webmanifest"),
} as const;
export type InstallPlatform = "android" | "ios" | "desktop" | "unknown";

export function getInstallPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/windows|macintosh|linux/.test(ua)) return "desktop";
  return "unknown";
}

export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function getPublicAppUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.startsWith("http") && !origin.includes("localhost")) {
      return origin;
    }
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://your-app.vercel.app"
  );
}

export const APK_DOWNLOAD_PATH = "/downloads/b-fit.apk";
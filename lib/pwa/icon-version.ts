import { APP_VERSION } from "./version";

const STORAGE_KEY = "bfit-icon-version";
const DISMISS_KEY = "bfit-icon-refresh-dismissed";

export function getStoredIconVersion(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function markIconVersionSynced(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, APP_VERSION);
  sessionStorage.removeItem(DISMISS_KEY);
}

export function needsIconRefresh(): boolean {
  if (typeof window === "undefined") return false;
  const dismissed = sessionStorage.getItem(DISMISS_KEY);
  if (dismissed === APP_VERSION) return false;
  return getStoredIconVersion() !== APP_VERSION;
}

export function dismissIconRefreshPrompt(): void {
  sessionStorage.setItem(DISMISS_KEY, APP_VERSION);
}
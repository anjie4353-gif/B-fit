import { ICON_PACK_VERSION } from "./icon-pack";

const STORAGE_KEY = "bfit-icon-pack-version";
const LEGACY_KEY = "bfit-icon-version";
const SNOOZE_KEY = "bfit-icon-refresh-snooze-until";
const SNOOZE_MS = 6 * 60 * 60 * 1000;

export function getStoredIconPackVersion(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function markIconVersionSynced(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, ICON_PACK_VERSION);
  localStorage.removeItem(LEGACY_KEY);
  localStorage.removeItem(SNOOZE_KEY);
}

function isSnoozed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(SNOOZE_KEY);
  if (!raw) return false;
  const until = Number(raw);
  if (!Number.isFinite(until) || Date.now() >= until) {
    localStorage.removeItem(SNOOZE_KEY);
    return false;
  }
  return true;
}

export function needsIconRefresh(): boolean {
  if (typeof window === "undefined") return false;
  if (isSnoozed()) return false;

  const stored = getStoredIconPackVersion();
  if (stored === ICON_PACK_VERSION) return false;

  // Users who confirmed old app-version tracking still need navy icon pack v2
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && !stored) return true;

  return stored !== ICON_PACK_VERSION;
}

export function dismissIconRefreshPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
}
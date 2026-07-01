import { differenceInDays, format, parseISO } from "date-fns";

export function formatJoinedDate(dateIso: string | undefined | null): string {
  if (!dateIso) return "—";
  try {
    return format(parseISO(dateIso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function formatAccountAge(dateIso: string | undefined | null): string {
  const days = dateIso
    ? Math.max(0, differenceInDays(new Date(), parseISO(dateIso)))
    : 0;
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  const rem = days % 30;
  if (months < 12) {
    return rem > 0 ? `${months} mo ${rem}d` : `${months} mo`;
  }
  const years = Math.floor(months / 12);
  const mo = months % 12;
  return mo > 0 ? `${years}y ${mo}mo` : `${years}y`;
}

export function displayName(
  fullName?: string | null,
  nickname?: string | null,
  fallback = "there"
): string {
  const nick = nickname?.trim();
  if (nick) return nick;
  const full = fullName?.trim();
  if (full) return full.split(/\s+/)[0] ?? full;
  return fallback;
}
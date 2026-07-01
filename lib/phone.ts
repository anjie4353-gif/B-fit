/** Normalize to digits only for storage and lookup keys. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/** Match webhook `from` with profile whatsappNumber (+91… vs 91…). */
export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.endsWith(nb) || nb.endsWith(na);
}

export function formatE164(phone: string): string {
  const digits = normalizePhone(phone);
  return digits ? `+${digits}` : phone;
}
import type { MessageType, UserProfile, WhatsAppMessage } from "@/types";

export async function sendWhatsAppNotification(
  phone: string,
  type: MessageType,
  profile?: Partial<UserProfile>
): Promise<WhatsAppMessage> {
  const response = await fetch("/api/whatsapp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      type,
      gender: profile?.gender,
      profile,
    }),
  });

  const data = await response.json();
  const content = data.content ?? "";

  return {
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: new Date().toISOString(),
    direction: "outgoing",
    deliveryStatus: data.success
      ? "sent"
      : data.simulated
        ? "simulated"
        : "failed",
    deliveryError: data.success ? undefined : (data.error ?? data.message),
  };
}
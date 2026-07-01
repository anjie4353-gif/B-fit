import { getWelcomeMessage } from "@/lib/whatsapp-scheduler";
import type { UserProfile, WhatsAppMessage } from "@/types";

export async function sendWelcomeWhatsApp(
  profile: UserProfile
): Promise<WhatsAppMessage> {
  const content = getWelcomeMessage(profile.gender);

  const response = await fetch("/api/whatsapp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: profile.whatsappNumber,
      type: "welcome",
      gender: profile.gender,
    }),
  });

  const data = await response.json();

  return {
    id: crypto.randomUUID(),
    type: "welcome",
    content: data.content ?? content,
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
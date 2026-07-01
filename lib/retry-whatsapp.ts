import { sendWelcomeWhatsApp } from "@/lib/send-welcome";
import type { UserProfile, WhatsAppMessage } from "@/types";

export async function retryWelcomeWhatsApp(
  profile: UserProfile
): Promise<WhatsAppMessage> {
  return sendWelcomeWhatsApp(profile);
}
import { handleCoachMessage } from "@/lib/chat-handler";
import { getUserStore } from "@/lib/store";
import { sendWhatsAppMessage } from "@/whatsapp/client";
import type { WhatsAppMessage } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-app.vercel.app";

interface MetaInboundMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

interface MetaWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
        messages?: MetaInboundMessage[];
        statuses?: unknown[];
      };
    }>;
  }>;
}

export function extractInboundMessages(
  body: MetaWebhookPayload
): MetaInboundMessage[] {
  const messages: MetaInboundMessage[] = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      for (const msg of change.value?.messages ?? []) {
        messages.push(msg);
      }
    }
  }
  return messages;
}

export async function processInboundWhatsAppMessage(
  from: string,
  text: string,
  waMessageId?: string
): Promise<{ processed: boolean; reply?: string; error?: string }> {
  const store = getUserStore();
  const session = await store.findUserByPhone(from);

  if (!session?.profile?.consentGiven) {
    const reply = `Hi! I'm your B-Fit wellness coach. Complete your profile first so I can personalize your plan: ${APP_URL}/onboarding`;
    const sent = await sendWhatsAppMessage({ to: from, message: reply });
    const outgoing: WhatsAppMessage = {
      id: crypto.randomUUID(),
      type: "user_reply",
      content: reply,
      timestamp: new Date().toISOString(),
      direction: "outgoing",
      deliveryStatus: sent.success ? "sent" : "failed",
      deliveryError: sent.error,
    };
    await store.addWhatsAppMessage(from, outgoing);
    return { processed: true, reply, error: sent.error };
  }

  await store.addWhatsAppMessage(from, {
    id: waMessageId ?? crypto.randomUUID(),
    type: "user_reply",
    content: text,
    timestamp: new Date().toISOString(),
    direction: "incoming",
    deliveryStatus: "delivered",
  });

  const emergencyPaused = await store.isEmergencyPaused(from);
  const history = await store.getChatHistory(from, 10);

  const result = await handleCoachMessage(
    text,
    session.profile,
    history,
    emergencyPaused
  );

  if (result.emergency) {
    await store.setEmergencyPaused(from, true);
  }
  if (result.safetyConfirmed) {
    await store.setEmergencyPaused(from, false);
  }

  const sent = await sendWhatsAppMessage({
    to: from,
    message: result.response,
  });

  const outgoing: WhatsAppMessage = {
    id: crypto.randomUUID(),
    type: "user_reply",
    content: result.response,
    timestamp: new Date().toISOString(),
    direction: "outgoing",
    deliveryStatus: sent.success ? "sent" : "failed",
    deliveryError: sent.error,
  };

  await store.addWhatsAppMessage(from, outgoing);
  await store.addChatTurn(from, text, result.response);

  return {
    processed: true,
    reply: result.response,
    error: sent.error,
  };
}
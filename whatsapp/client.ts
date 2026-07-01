import { createHmac, timingSafeEqual } from "crypto";

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";

interface SendMessageParams {
  to: string;
  message: string;
}

export async function sendWhatsAppMessage({
  to,
  message,
}: SendMessageParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !accessToken) {
    return {
      success: false,
      error:
        "WhatsApp credentials not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN.",
    };
  }

  const cleanNumber = to.replace(/[^0-9]/g, "");

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanNumber,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message ?? "Failed to send message",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export function validateWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!appSecret || !signature?.startsWith("sha256=")) {
    return !appSecret;
  }

  const expected = createHmac("sha256", appSecret)
    .update(payload, "utf8")
    .digest("hex");

  const received = signature.slice("sha256=".length);

  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(received, "hex")
    );
  } catch {
    return false;
  }
}
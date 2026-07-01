import { NextRequest, NextResponse } from "next/server";
import { getUserStore } from "@/lib/store";
import { sendWhatsAppMessage } from "@/whatsapp/client";
import { getMessageContent } from "@/whatsapp/messages";
import { getWelcomeMessage } from "@/lib/whatsapp-scheduler";
import { checkRateLimit } from "@/lib/rate-limit";
import type { MessageType, WhatsAppMessage } from "@/types";

async function persistOutgoing(
  phone: string,
  type: MessageType | "user_reply" | undefined,
  content: string,
  deliveryStatus: WhatsAppMessage["deliveryStatus"],
  deliveryError?: string
) {
  const store = getUserStore();
  const session = await store.findUserByPhone(phone);
  if (!session) return;

  await store.addWhatsAppMessage(phone, {
    id: crypto.randomUUID(),
    type: type ?? "user_reply",
    content,
    timestamp: new Date().toISOString(),
    direction: "outgoing",
    deliveryStatus,
    deliveryError,
  });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";

  if (!checkRateLimit(`wa-${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { phone, type, message, gender, profile } = body as {
      phone: string;
      type?: MessageType;
      message?: string;
      gender?: string;
      profile?: import("@/types").UserProfile;
    };

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    let content = message;
    if (!content && type === "welcome") {
      content = getWelcomeMessage(gender);
    } else if (!content && type) {
      content = getMessageContent(type, profile ?? { gender: gender as "male" | "female" });
    }

    if (!content) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    const configured = Boolean(phoneNumberId && accessToken);

    const result = await sendWhatsAppMessage({ to: phone, message: content });

    if (!result.success) {
      const setupHint = configured
        ? "WhatsApp API rejected the send. Check that your number is added as a test recipient in Meta Developer Console."
        : "Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to .env.local, then restart the dev server.";

      await persistOutgoing(phone, type, content, "simulated", result.error);

      return NextResponse.json({
        success: false,
        simulated: true,
        configured,
        content,
        error: result.error,
        message: setupHint,
      });
    }

    await persistOutgoing(phone, type, content, "sent");

    return NextResponse.json({
      success: true,
      simulated: false,
      content,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
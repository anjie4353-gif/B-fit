import { NextRequest, NextResponse } from "next/server";
import { getDueWhatsAppMessages } from "@/lib/whatsapp-scheduler";
import { getUserStore } from "@/lib/store";
import { sendWhatsAppMessage } from "@/whatsapp/client";
import { getMessageContent } from "@/whatsapp/messages";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  if (!phoneNumberId || !accessToken) {
    return NextResponse.json({
      error: "WhatsApp API not configured",
      sent: 0,
    });
  }

  const store = getUserStore();
  const phones = await store.listUserPhones();
  const results: Array<{ phone: string; type: string; ok: boolean; error?: string }> =
    [];

  for (const phone of phones) {
    const session = await store.getUserByPhone(phone);
    if (!session?.profile?.consentGiven || !session.profile.whatsappNumber) {
      continue;
    }

    const sentAlerts = await store.getSentAlerts(phone);
    const due = getDueWhatsAppMessages(session.profile, sentAlerts);

    for (const { type, key } of due) {
      const content = getMessageContent(type, session.profile);
      const result = await sendWhatsAppMessage({
        to: session.profile.whatsappNumber,
        message: content,
      });

      if (result.success) {
        await store.markAlertSent(phone, key);
        await store.addWhatsAppMessage(phone, {
          id: crypto.randomUUID(),
          type,
          content,
          timestamp: new Date().toISOString(),
          direction: "outgoing",
          deliveryStatus: "sent",
        });
      }

      results.push({
        phone,
        type,
        ok: result.success,
        error: result.error,
      });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    hour: new Date().getHours(),
    users: phones.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
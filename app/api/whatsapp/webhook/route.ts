import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "@/whatsapp/client";
import {
  extractInboundMessages,
  processInboundWhatsAppMessage,
} from "@/lib/whatsapp/inbound";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "bfit_verify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  if (
    process.env.WHATSAPP_APP_SECRET &&
    !validateWebhookSignature(rawBody, signature)
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
    const inbound = extractInboundMessages(body);

    if (inbound.length === 0) {
      return NextResponse.json({ status: "ok" });
    }

    const results = [];
    for (const msg of inbound) {
      if (msg.type !== "text" || !msg.text?.body) {
        await processInboundWhatsAppMessage(
          msg.from,
          "I can read text messages for now. Please type your wellness question.",
          msg.id
        );
        continue;
      }

      const result = await processInboundWhatsAppMessage(
        msg.from,
        msg.text.body,
        msg.id
      );
      results.push({ from: msg.from, ...result });
    }

    return NextResponse.json({ status: "processed", results });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
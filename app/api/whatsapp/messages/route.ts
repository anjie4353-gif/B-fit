import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { getUserStore } from "@/lib/store";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "phone query required" }, { status: 400 });
  }

  try {
    const store = getUserStore();
    const messages = await store.getWhatsAppMessages(phone);
    const session = await store.findUserByPhone(phone);

    return NextResponse.json({
      phone: normalizePhone(phone),
      registered: Boolean(session?.profile?.consentGiven),
      messages,
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

export async function GET() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  return NextResponse.json({
    configured: Boolean(phoneNumberId && accessToken),
    hasPhoneNumberId: Boolean(phoneNumberId),
    hasAccessToken: Boolean(accessToken),
  });
}
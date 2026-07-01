import { NextRequest, NextResponse } from "next/server";
import { handleCoachMessage } from "@/lib/chat-handler";
import { checkRateLimit } from "@/lib/rate-limit";
import type { UserProfile } from "@/types";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      message,
      profile,
      history,
      emergencyPaused,
    }: {
      message: string;
      profile?: Partial<UserProfile>;
      history?: { role: string; content: string }[];
      emergencyPaused?: boolean;
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const result = await handleCoachMessage(
      message,
      profile,
      history?.map((m, i) => ({
        id: String(i),
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date().toISOString(),
      })),
      emergencyPaused
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        response:
          "I'm having trouble right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
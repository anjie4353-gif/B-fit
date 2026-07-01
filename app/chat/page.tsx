"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useUserStore } from "@/hooks/useUserStore";
import { APP_NAME, MEN_COACH_NAME, WOMEN_COACH_NAME } from "@/lib/brand";

export default function ChatPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (!profile?.consentGiven) router.replace("/onboarding");
  }, [profile, router]);

  return (
    <div>
      <header className="glass-strong border-b border-accent-200 px-4 py-4">
        <h1 className="font-display text-lg font-semibold text-accent-900">
          {APP_NAME} Coach
        </h1>
        <p className="text-xs text-accent-500">
          {profile?.gender === "male" ? MEN_COACH_NAME : WOMEN_COACH_NAME} · Groq
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/hooks/useUserStore";
import { EMERGENCY_RESPONSE } from "@/lib/safety";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const femalePrompts = [
  "Daily wellness plan",
  "Indian diet for me",
  "Period & cycle tips",
  "PCOS lifestyle advice",
];

const malePrompts = [
  "Daily plan for today",
  "Indian diet plan for me",
  "Fitness & step goals",
  "Sleep & stress tips",
];

export function ChatInterface() {
  const { profile, chatMessages, addChatMessage, emergencyPaused, setEmergencyPaused } =
    useUserStore();
  const quickPrompts =
    profile?.gender === "male" ? malePrompts : femalePrompts;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          profile,
          history: chatMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          emergencyPaused,
        }),
      });

      const data = await res.json();

      if (data.emergency) {
        setEmergencyPaused(true);
      } else if (data.safetyConfirmed) {
        setEmergencyPaused(false);
      }

      addChatMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        isEmergency: data.emergency,
      });
    } catch {
      addChatMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col">
      {emergencyPaused && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-2xl border border-red-200/60 bg-red-50/70 p-3 text-sm text-red-700 backdrop-blur-md">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Coaching paused. Reply &quot;I&apos;m safe&quot; to continue.</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="glass-strong mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Bot className="h-8 w-8 text-accent-500" />
            </div>
            <h2 className="font-display text-lg font-semibold text-accent-900">
              {APP_NAME} Coach
            </h2>
            <p className="mt-2 max-w-xs text-sm text-accent-500">
              Ask about nutrition, periods, PCOD, or daily wellness. I&apos;m here to support you.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="glass-pill rounded-full px-4 py-2 text-xs font-medium text-accent-600 transition-all hover:bg-white/80 active:scale-[0.97]"
                >
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                msg.role === "user"
                  ? "bg-accent-600 text-white"
                  : msg.isEmergency
                    ? "bg-red-100 text-red-600"
                    : "bg-accent-100 text-accent-600"
              )}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "glass-btn-primary rounded-br-md text-white"
                  : msg.isEmergency
                    ? "rounded-bl-md border border-red-200/60 bg-red-50/80 text-red-800 backdrop-blur-md"
                    : "glass rounded-bl-md text-accent-800"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100">
              <Bot className="h-4 w-4 text-accent-600" />
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent-300 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent-300 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent-300 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="glass-nav border-t border-accent-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask B-Fit coach..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useRef, useEffect, useState } from "react";
import { Check, CheckCheck, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppSetupBanner } from "@/components/whatsapp/whatsapp-setup-banner";
import { useUserStore } from "@/hooks/useUserStore";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { retryWelcomeWhatsApp } from "@/lib/retry-whatsapp";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

function DeliveryIcon({ status }: { status: string }) {
  if (status === "sent" || status === "delivered") {
    return <CheckCheck className="h-3 w-3 text-accent-500" />;
  }
  if (status === "simulated") {
    return <Check className="h-3 w-3 text-accent-400" />;
  }
  return <Check className="h-3 w-3 text-accent-300" />;
}

export function WhatsAppInbox() {
  const { profile, whatsappMessages, updateWhatsAppMessage, mergeWhatsAppMessages } =
    useUserStore();
  const { configured } = useWhatsAppStatus();
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasSimulated = whatsappMessages.some(
    (m) => m.deliveryStatus === "simulated"
  );

  const resendToPhone = async () => {
    if (!profile?.whatsappNumber || !profile.consentGiven || !profile.gender) return;
    setSending(true);
    try {
      const msg = await retryWelcomeWhatsApp(profile as UserProfile);
      const welcome = whatsappMessages.find((m) => m.type === "welcome");
      if (welcome) {
        updateWhatsAppMessage(welcome.id, {
          deliveryStatus: msg.deliveryStatus,
          timestamp: msg.timestamp,
          deliveryError: msg.deliveryError,
        });
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [whatsappMessages]);

  useEffect(() => {
    if (!profile?.whatsappNumber) return;

    const syncFromServer = async () => {
      try {
        const res = await fetch(
          `/api/whatsapp/messages?phone=${encodeURIComponent(profile.whatsappNumber!)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          mergeWhatsAppMessages(data.messages);
        }
      } catch {
        /* offline — keep local inbox */
      }
    };

    syncFromServer();
    const interval = setInterval(syncFromServer, 5000);
    return () => clearInterval(interval);
  }, [profile?.whatsappNumber, mergeWhatsAppMessages]);

  if (!profile?.whatsappNumber) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center px-6 text-center text-accent-500">
        Complete onboarding to connect WhatsApp.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col bg-accent-100/80">
      <WhatsAppSetupBanner phone={profile.whatsappNumber} />
      {hasSimulated && (
        <div className="mx-3 mt-2 space-y-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-full bg-white/90"
            onClick={resendToPhone}
            disabled={sending || !configured}
          >
            <Send className="h-4 w-4" />
            {sending
              ? "Sending to phone..."
              : configured
                ? "Send to phone now"
                : "Configure API keys to send to phone"}
          </Button>
          {!configured && (
            <p className="text-center text-[10px] text-accent-600">
              Add WhatsApp keys to .env.local and restart the server first.
            </p>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {whatsappMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Phone className="mb-3 h-10 w-10 text-accent-500" />
            <p className="text-sm text-accent-600">
              Your WhatsApp messages will appear here.
            </p>
            <p className="mt-1 text-xs text-accent-500">
              Welcome message sends right after onboarding.
            </p>
          </div>
        )}

        {whatsappMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.direction === "incoming" ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 shadow-sm",
                msg.direction === "incoming"
                  ? "rounded-tl-none glass-strong"
                  : "rounded-tr-none bg-accent-200/90"
              )}
            >
              <p className="whitespace-pre-wrap text-sm text-accent-800 leading-relaxed">
                {msg.content}
              </p>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="text-[10px] text-accent-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.direction === "outgoing" && (
                  <DeliveryIcon status={msg.deliveryStatus} />
                )}
              </div>
              {msg.deliveryStatus === "simulated" && (
                <p className="mt-1 text-[9px] text-accent-600">
                  In-app preview only
                  {msg.deliveryError ? ` — ${msg.deliveryError}` : ""}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { getDueWhatsAppMessages } from "@/lib/whatsapp-scheduler";
import { sendWhatsAppNotification } from "@/lib/send-whatsapp";

export function WhatsAppScheduler() {
  const profile = useUserStore((s) => s.profile);
  const sentAlerts = useUserStore((s) => s.sentAlerts);
  const addWhatsAppMessage = useUserStore((s) => s.addWhatsAppMessage);
  const markAlertSent = useUserStore((s) => s.markAlertSent);
  const processing = useRef(false);

  useEffect(() => {
    if (!profile?.whatsappNumber || !profile.consentGiven) return;

    const checkAndSend = async () => {
      if (processing.current) return;
      processing.current = true;

      try {
        const due = getDueWhatsAppMessages(profile, sentAlerts);

        for (const { type, key } of due) {
          const msg = await sendWhatsAppNotification(
            profile.whatsappNumber!,
            type,
            profile
          );
          addWhatsAppMessage(msg);
          markAlertSent(key);
        }
      } finally {
        processing.current = false;
      }
    };

    checkAndSend();
    const interval = setInterval(checkAndSend, 60_000);
    return () => clearInterval(interval);
  }, [profile, sentAlerts, addWhatsAppMessage, markAlertSent]);

  return null;
}
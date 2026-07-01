"use client";

import { useEffect, useState } from "react";

interface WhatsAppStatus {
  configured: boolean;
  hasPhoneNumberId: boolean;
  hasAccessToken: boolean;
  loading: boolean;
}

export function useWhatsAppStatus(): WhatsAppStatus {
  const [status, setStatus] = useState<WhatsAppStatus>({
    configured: false,
    hasPhoneNumberId: false,
    hasAccessToken: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/whatsapp/status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setStatus({
            configured: Boolean(data.configured),
            hasPhoneNumberId: Boolean(data.hasPhoneNumberId),
            hasAccessToken: Boolean(data.hasAccessToken),
            loading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
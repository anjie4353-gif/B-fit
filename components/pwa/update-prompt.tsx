"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n/i18n-provider";
import {
  applyAppUpdate,
  checkForAppUpdate,
  notifyUpdateAvailable,
} from "@/lib/pwa/update";
import { APP_VERSION } from "@/lib/pwa/version";

const DISMISS_KEY = "bfit-update-dismissed";

export function UpdatePrompt() {
  const { t } = useTranslation();
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedVersion = sessionStorage.getItem(DISMISS_KEY);
    if (dismissedVersion === APP_VERSION) setDismissed(true);

    checkForAppUpdate(() => {
      setAvailable(true);
      notifyUpdateAvailable(
        t("pwa.updateTitle"),
        t("pwa.updateBody")
      ).catch(() => undefined);
    });
  }, [t]);

  if (!available || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-4">
      <div className="glass-strong flex items-start gap-3 rounded-2xl border border-brand-sky/30 p-4 shadow-elev-2">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-brand-sky" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-accent-900">
            {t("pwa.updateTitle")}
          </p>
          <p className="text-xs text-accent-600">{t("pwa.updateBody")}</p>
          <Button size="sm" className="w-full" onClick={() => applyAppUpdate()}>
            <RefreshCw className="h-4 w-4" />
            {t("pwa.updateButton")}
          </Button>
        </div>
        <button
          type="button"
          className="text-accent-400"
          aria-label={t("common.cancel")}
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, APP_VERSION);
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
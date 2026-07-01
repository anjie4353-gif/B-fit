"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n/i18n-provider";
import {
  applyAppUpdate,
  initPwaServiceWorker,
  notifyUpdateAvailable,
} from "@/lib/pwa/update";
import { APP_VERSION } from "@/lib/pwa/version";

const DISMISS_KEY = "bfit-update-dismissed";

export function UpdatePrompt() {
  const { t } = useTranslation();
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const dismissedVersion = sessionStorage.getItem(DISMISS_KEY);
    if (dismissedVersion === APP_VERSION) setDismissed(true);

    initPwaServiceWorker(() => {
      setAvailable(true);
      notifyUpdateAvailable(t("pwa.updateTitle"), t("pwa.updateBody")).catch(
        () => undefined
      );
    });
  }, [t]);

  const handleUpdate = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await applyAppUpdate();
    } catch {
      window.location.reload();
    }
  };

  if (!available || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-4">
      <div className="glass-strong flex items-start gap-3 rounded-2xl border border-brand-sky/30 p-4 shadow-elev-2">
        <RefreshCw
          className={`mt-0.5 h-5 w-5 shrink-0 text-brand-sky ${updating ? "animate-spin" : ""}`}
        />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-accent-900">
            {t("pwa.updateTitle")}
          </p>
          <p className="text-xs text-accent-600">{t("pwa.updateBody")}</p>
          <Button
            size="sm"
            className="w-full"
            disabled={updating}
            onClick={handleUpdate}
          >
            <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} />
            {updating ? t("pwa.updating") : t("pwa.updateButton")}
          </Button>
        </div>
        <button
          type="button"
          className="text-accent-400"
          aria-label={t("common.cancel")}
          disabled={updating}
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
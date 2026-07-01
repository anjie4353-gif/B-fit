"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { isStandaloneApp, getInstallPlatform } from "@/lib/pwa/install";
import { warmIconAssets, openIconRefreshInBrowser } from "@/lib/pwa/icon-refresh";
import { PWA_ICON_URLS } from "@/lib/pwa/icon-urls";
import {
  dismissIconRefreshPrompt,
  needsIconRefresh,
} from "@/lib/pwa/icon-version";

export function IconRefreshPrompt() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const platform = getInstallPlatform();

  const check = useCallback(() => {
    setShow(isStandaloneApp() && needsIconRefresh());
  }, []);

  useEffect(() => {
    check();
    if (isStandaloneApp() && needsIconRefresh()) {
      void warmIconAssets();
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[60] mx-4">
      <div className="glass-strong rounded-2xl border border-amber-400/60 bg-amber-50/90 p-4 shadow-elev-3">
        <div className="flex items-start gap-3">
          <Image
            src={PWA_ICON_URLS.icon192}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl ring-2 ring-[#002B5B]/20"
            unoptimized
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-amber-800" />
              <p className="text-sm font-semibold text-accent-900">
                {t("pwa.iconRefreshTitle")}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-accent-700">
              {platform === "ios"
                ? t("pwa.iconRefreshIos")
                : t("pwa.iconRefreshAndroid")}
            </p>
            <Button
              size="sm"
              className="w-full"
              onClick={() => openIconRefreshInBrowser()}
            >
              <ExternalLink className="h-4 w-4" />
              {platform === "ios"
                ? t("pwa.iconRefreshOpenSafari")
                : t("pwa.iconRefreshOpenChrome")}
            </Button>
            <Button asChild size="sm" variant="secondary" className="w-full">
              <Link href="/install#icon-refresh">{t("pwa.iconRefreshButton")}</Link>
            </Button>
          </div>
          <button
            type="button"
            className="text-accent-400"
            aria-label={t("common.cancel")}
            onClick={() => {
              dismissIconRefreshPrompt();
              setShow(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
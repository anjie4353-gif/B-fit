"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { isStandaloneApp, getInstallPlatform } from "@/lib/pwa/install";
import { PWA_ICON_URLS } from "@/lib/pwa/icon-urls";
import {
  dismissIconRefreshPrompt,
  needsIconRefresh,
} from "@/lib/pwa/icon-version";

export function IconRefreshPrompt() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const platform = getInstallPlatform();

  useEffect(() => {
    if (isStandaloneApp() && needsIconRefresh()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 mx-4">
      <div className="glass-strong rounded-2xl border border-amber-300/50 p-4 shadow-elev-2">
        <div className="flex items-start gap-3">
          <Image
            src={PWA_ICON_URLS.icon192}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl"
            unoptimized
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-amber-700" />
              <p className="text-sm font-semibold text-accent-900">
                {t("pwa.iconRefreshTitle")}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-accent-600">
              {platform === "ios"
                ? t("pwa.iconRefreshIos")
                : t("pwa.iconRefreshAndroid")}
            </p>
            <Button asChild size="sm" className="w-full">
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
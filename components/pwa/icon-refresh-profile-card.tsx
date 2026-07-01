"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { getInstallPlatform, isStandaloneApp } from "@/lib/pwa/install";
import { openIconRefreshInBrowser, warmIconAssets } from "@/lib/pwa/icon-refresh";
import { PWA_ICON_URLS } from "@/lib/pwa/icon-urls";
import { needsIconRefresh } from "@/lib/pwa/icon-version";

export function IconRefreshProfileCard() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const platform = getInstallPlatform();

  useEffect(() => {
    const visible = isStandaloneApp() && needsIconRefresh();
    setShow(visible);
    if (visible) void warmIconAssets();
  }, []);

  if (!show) return null;

  return (
    <Card className="border-amber-400/50 bg-amber-50/80 shadow-elev-2">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Image
            src={PWA_ICON_URLS.icon192}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-2xl"
            unoptimized
          />
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-amber-800" />
              <p className="text-sm font-semibold text-accent-900">
                {t("pwa.iconRefreshTitle")}
              </p>
            </div>
            <p className="mt-1 text-xs text-accent-600">
              {t("pwa.iconRefreshProfileHint")}
            </p>
          </div>
        </div>
        <Button size="sm" className="w-full" onClick={() => openIconRefreshInBrowser()}>
          <ExternalLink className="h-4 w-4" />
          {platform === "ios"
            ? t("pwa.iconRefreshOpenSafari")
            : t("pwa.iconRefreshOpenChrome")}
        </Button>
        <Button asChild size="sm" variant="secondary" className="w-full">
          <Link href="/install#icon-refresh">{t("pwa.iconRefreshButton")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { useTranslation } from "@/components/i18n/i18n-provider";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Globe,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  APK_DOWNLOAD_PATH,
  getInstallPlatform,
  getPublicAppUrl,
  isStandaloneApp,
} from "@/lib/pwa/install";
import { openIconRefreshInBrowser } from "@/lib/pwa/icon-refresh";
import { PWA_ICON_URLS } from "@/lib/pwa/icon-urls";
import {
  markIconVersionSynced,
  needsIconRefresh,
} from "@/lib/pwa/icon-version";
import { requestNotificationPermission } from "@/lib/pwa/notifications";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);
  const [apkReady, setApkReady] = useState(false);
  const [checkingApk, setCheckingApk] = useState(true);
  const [showIconRefresh, setShowIconRefresh] = useState(false);
  const [iconRefreshDone, setIconRefreshDone] = useState(false);
  const platform = getInstallPlatform();
  const appUrl = getPublicAppUrl();
  const onLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  useEffect(() => {
    setInstalled(isStandaloneApp());

    const refreshNeeded = needsIconRefresh();
    const hashMatch =
      typeof window !== "undefined" && window.location.hash === "#icon-refresh";
    setShowIconRefresh(refreshNeeded || hashMatch);

    if (hashMatch) {
      window.setTimeout(() => {
        document.getElementById("icon-refresh")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    fetch(APK_DOWNLOAD_PATH, { method: "HEAD" })
      .then((res) => setApkReady(res.ok))
      .catch(() => setApkReady(false))
      .finally(() => setCheckingApk(false));
  }, []);

  const installPwa = async () => {
    await requestNotificationPermission();
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        markIconVersionSynced();
      }
      setDeferred(null);
    }
  };

  const confirmIconRefresh = () => {
    markIconVersionSynced();
    setIconRefreshDone(true);
    setShowIconRefresh(false);
  };

  return (
    <div className="space-y-5 px-4 py-6">
      <Link
        href="/welcome"
        className="inline-flex items-center gap-1 text-sm text-accent-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <header className="space-y-3">
        <BrandLockup markSize={44} wordmarkSize="sm" />
        <h1 className="text-display font-display">Install B-Fit</h1>
        <p className="mt-2 text-caption">
          App install cheyadaniki — Android &amp; iPhone steps
        </p>
      </header>

      {installed ? (
        <Card className="border-success-500/30 bg-success-50/40">
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-semibold text-accent-900">
                App already installed
              </p>
              <p className="mt-1 text-xs text-accent-600">
                Home screen nunchi B-Fit open cheyandi.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {iconRefreshDone ? (
        <Card className="border-success-500/30 bg-success-50/40">
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success-600" />
            <p className="text-sm font-semibold text-accent-900">
              {t("pwa.iconRefreshDone")}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {showIconRefresh && !iconRefreshDone ? (
        <Card id="icon-refresh" className="border-amber-300/50 bg-amber-50/30">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-accent-800">
              <ImageIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">
                {t("pwa.iconRefreshPageTitle")}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-accent-600">
              {t("pwa.iconRefreshPageSubtitle")}
            </p>
            <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
              <Image
                src={PWA_ICON_URLS.icon192}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl shadow-sm"
                unoptimized
              />
              <p className="text-xs text-accent-600">{t("pwa.iconRefreshPreview")}</p>
            </div>
            {platform === "ios" ? (
              <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-accent-700">
                <li>Home screen lo purana B-Fit icon delete cheyandi</li>
                <li>Safari lo live link open cheyandi (Chrome kadu)</li>
                <li>Share → &quot;Add to Home Screen&quot;</li>
              </ol>
            ) : (
              <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-accent-700">
                <li>Home screen lo purana B-Fit shortcut remove cheyandi</li>
                <li>Chrome lo live link open cheyandi</li>
                <li>Menu (⋮) → &quot;Install app&quot; or &quot;Add to Home screen&quot;</li>
              </ol>
            )}
            {installed ? (
              <Button className="w-full" onClick={() => openIconRefreshInBrowser()}>
                <Globe className="h-4 w-4" />
                {platform === "ios"
                  ? t("pwa.iconRefreshOpenSafari")
                  : t("pwa.iconRefreshOpenChrome")}
              </Button>
            ) : null}
            <Button className="w-full" variant="secondary" onClick={confirmIconRefresh}>
              <CheckCircle2 className="h-4 w-4" />
              {t("pwa.iconRefreshDone")}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {onLocalhost && (
        <Card className="border-accent-300 bg-accent-50/80">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-accent-600" />
            <div className="text-sm text-accent-700">
              <p className="font-medium text-accent-900">
                localhost lo APK download radu
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                Phone lo install cheyadaniki app ni Vercel / live HTTPS link meeda
                deploy cheyali. Deploy ayyaka ee page lo install button vastundi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-accent-700">
            <Smartphone className="h-5 w-5" />
            <span className="text-sm font-semibold">Option 1 — PWA Install</span>
          </div>
          <p className="text-xs text-accent-600 leading-relaxed">
            Browser lo open chesi &quot;Install App&quot; press cheyandi. APK file
            kakunda home screen ki add avutundi — same app experience.
          </p>
          <Button className="w-full" onClick={installPwa}>
            <Download className="h-4 w-4" />
            {deferred
              ? "Install App"
              : onLocalhost
                ? "Enable Alerts (deploy for full install)"
                : "Enable Alerts / Retry Install"}
          </Button>
          {!deferred && !onLocalhost && (
            <p className="text-center text-[10px] text-accent-500">
              Prompt raakapothe kindha manual steps follow cheyandi
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-accent-700">
            <Download className="h-5 w-5" />
            <span className="text-sm font-semibold">Option 2 — APK Download</span>
          </div>

          {checkingApk ? (
            <p className="text-xs text-accent-500">Checking APK…</p>
          ) : apkReady ? (
            <Button asChild className="w-full" size="lg">
              <a href={APK_DOWNLOAD_PATH} download="b-fit.apk">
                <Download className="h-5 w-5" />
                Download B-Fit APK
              </a>
            </Button>
          ) : (
            <div className="glass-subtle rounded-xl p-3 text-xs text-accent-700 leading-relaxed">
              <p className="font-medium text-accent-900">APK file inka ready ledu</p>
              <p className="mt-1">
                Developer machine lo Android Studio install chesi{" "}
                <code className="rounded bg-white/80 px-1">npm run android:build</code>{" "}
                run cheyali. Taruvata APK ee page lo download avutundi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5 text-xs text-accent-700 leading-relaxed">
          <p className="text-sm font-semibold text-accent-900">
            Android — manual steps
          </p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>Chrome browser lo live link open cheyandi</li>
            <li>Top-right menu (⋮) → &quot;Install app&quot; or &quot;Add to Home screen&quot;</li>
            <li>Home screen lo B-Fit icon kanipistundi</li>
          </ol>

          {platform === "android" && (
            <p className="text-accent-500">
              APK sideload: Settings → Security → Unknown sources allow chesi APK
              install cheyandi.
            </p>
          )}

          <p className="text-sm font-semibold text-accent-900 pt-2">
            iPhone — manual steps
          </p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>Safari lo link open cheyandi (Chrome kadu)</li>
            <li>Share button → &quot;Add to Home Screen&quot;</li>
          </ol>
        </CardContent>
      </Card>

      <Button asChild variant="secondary" className="w-full">
        <a href={appUrl} target="_blank" rel="noopener noreferrer">
          Open live app link
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInstallPlatform, isStandaloneApp } from "@/lib/pwa/install";
import { requestNotificationPermission } from "@/lib/pwa/notifications";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  const platform = getInstallPlatform();

  useEffect(() => {
    if (isStandaloneApp()) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed || dismissed) return null;

  const install = async () => {
    await requestNotificationPermission();
    if (deferred) {
      await deferred.prompt();
      setDeferred(null);
    }
  };

  return (
    <div
      className={`glass-strong rounded-[22px] p-4 shadow-elev-2 ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-accent-900">
            Install B-Fit on your phone
          </p>
          <p className="mt-1 text-xs text-accent-600 leading-relaxed">
            Add to Home Screen for app-like alerts — water, meals, sleep — with
            Done tracking and smart retries.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-accent-400"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <Button size="sm" className="w-full" onClick={install}>
          <Download className="h-4 w-4" />
          {deferred ? "Install App" : "Enable Alerts"}
        </Button>
        <Button asChild size="sm" variant="secondary" className="w-full">
          <Link href="/install">APK / Install Help</Link>
        </Button>
        {!deferred && (
          <p className="text-center text-[10px] text-accent-500">
            {platform === "ios"
              ? "iPhone: Safari → Share → Add to Home Screen"
              : platform === "android"
                ? "Android: Chrome menu → Install app · APK ki /install open cheyandi"
                : "Phone lo open cheste install prompt vastundi"}
          </p>
        )}
      </div>
    </div>
  );
}
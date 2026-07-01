"use client";

import { useEffect } from "react";
import { isStandaloneApp } from "@/lib/pwa/install";
import { warmIconAssets } from "@/lib/pwa/icon-refresh";
import { needsIconRefresh } from "@/lib/pwa/icon-version";
import { registerServiceWorker } from "@/lib/pwa/notifications";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
    if (isStandaloneApp() && needsIconRefresh()) {
      void warmIconAssets();
    }
  }, []);

  return <>{children}</>;
}
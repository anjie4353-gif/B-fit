"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa/notifications";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <>{children}</>;
}
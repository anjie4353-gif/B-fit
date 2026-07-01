"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { ensureSqliteReady } from "@/lib/storage/sqlite-persist";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 1500);

    const unsub = useUserStore.persist.onFinishHydration(() => {
      setReady(true);
    });

    void ensureSqliteReady().then(() => {
      useUserStore.persist.rehydrate();
      if (useUserStore.persist.hasHydrated()) {
        setReady(true);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="glass-strong rounded-3xl px-8 py-6 text-center">
          <p className="font-display text-lg font-semibold text-accent-900">
            B-Fit
          </p>
          <p className="mt-2 text-sm text-accent-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/useUserStore";

const PUBLIC_PATHS = ["/", "/language", "/install", "/onboarding"];

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const language = useUserStore((s) => s.language);
  const hydrated = useUserStore.persist.hasHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!language && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/language");
    }
  }, [language, pathname, router, hydrated]);

  return <>{children}</>;
}
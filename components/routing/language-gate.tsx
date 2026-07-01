"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/useUserStore";

const PUBLIC_PATHS = ["/", "/language", "/install", "/onboarding"];

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const language = useUserStore((s) => s.language);
  const profile = useUserStore((s) => s.profile);
  const hydrated = useUserStore.persist.hasHydrated();

  useEffect(() => {
    if (!hydrated) return;

    if (profile?.consentGiven) {
      if (pathname === "/onboarding") {
        router.replace("/home");
        return;
      }
      if (pathname === "/language") {
        router.replace("/profile");
        return;
      }
    }

    const effectiveLanguage = language ?? profile?.language ?? null;
    if (!effectiveLanguage && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/language");
    }
  }, [language, profile, pathname, router, hydrated]);

  return <>{children}</>;
}
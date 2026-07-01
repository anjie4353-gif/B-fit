"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useUserStore } from "@/hooks/useUserStore";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import type { AppLanguage } from "@/types";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { cn } from "@/lib/utils";

export default function LanguagePage() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const ensureInstallDate = useUserStore((s) => s.ensureInstallDate);
  const profile = useUserStore((s) => s.profile);

  const select = (code: AppLanguage) => {
    ensureInstallDate();
    setLanguage(code);
    if (profile?.consentGiven) {
      router.replace("/home");
    } else {
      router.replace("/onboarding");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col px-5 py-10 premium-section">
      <div className="premium-card mb-6 self-start px-4 py-3">
        <BrandLockup markSize={40} wordmarkSize="sm" />
      </div>

      <h1 className="font-display text-3xl font-extrabold text-gradient-premium">
        {t("language.title")}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-accent-500">
        {t("language.subtitle")}
      </p>

      <div className="mt-8 grid gap-3">
        {SUPPORTED_LANGUAGES.map(({ code, nativeName, englishName }) => {
          const selected = language === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => select(code)}
              className={cn(
                "premium-card flex items-center justify-between p-4 text-left transition-all active:scale-[0.98]",
                selected && "ring-2 ring-brand-violet/40 shadow-elev-3"
              )}
            >
              <div>
                <p className="font-display text-lg font-bold text-accent-900">
                  {nativeName}
                </p>
                <p className="text-xs text-accent-500">{englishName}</p>
              </div>
              {selected && (
                <div className="flip-icon-ring h-9 w-9">
                  <Check className="h-4 w-4 text-brand-violet" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
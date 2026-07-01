"use client";

import { useTranslation } from "@/components/i18n/i18n-provider";

export function ProgressLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="premium-card px-8 py-6 text-sm text-accent-500">
        {t("progress.loading")}
      </div>
    </div>
  );
}
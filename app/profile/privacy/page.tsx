"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { useTranslation } from "@/components/i18n/i18n-provider";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 px-4 py-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-accent-500"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <div className="premium-card space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-teal" />
          <h1 className="text-title font-display">{t("profile.privacyTitle")}</h1>
        </div>
        <p className="text-sm leading-relaxed text-accent-600">
          {t("profile.privacyBody")}
        </p>
      </div>
    </div>
  );
}
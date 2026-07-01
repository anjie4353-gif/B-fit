"use client";

import Link from "next/link";
import { ArrowLeft, Droplets } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useUserStore } from "@/hooks/useUserStore";
import { useTranslation } from "@/components/i18n/i18n-provider";

export default function ReminderHistoryPage() {
  const { t } = useTranslation();
  const history = useUserStore((s) => s.waterReminderHistory);

  return (
    <div className="space-y-4 px-4 py-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-accent-500"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <h1 className="text-display font-display">{t("profile.historyTitle")}</h1>

      {history.length === 0 ? (
        <div className="premium-card p-6 text-center text-sm text-accent-500">
          {t("profile.historyEmpty")}
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="premium-card flex items-start gap-3 p-4">
              <div className="flip-icon-ring h-9 w-9 shrink-0">
                <Droplets className="h-4 w-4 text-brand-sky" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium capitalize text-accent-900">
                  {entry.action}
                  {entry.glasses ? ` · ${entry.glasses} glass` : ""}
                </p>
                <p className="text-xs text-accent-500">
                  {format(parseISO(entry.recordedAt), "MMM d, yyyy · h:mm a")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
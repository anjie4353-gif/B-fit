"use client";

import { Bookmark, Trash2 } from "lucide-react";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";

export function SavedViews() {
  const { t } = useTranslation();
  const savedViews = useProgressDashboardStore((s) => s.savedViews);
  const saveView = useProgressDashboardStore((s) => s.saveView);
  const loadView = useProgressDashboardStore((s) => s.loadView);
  const deleteView = useProgressDashboardStore((s) => s.deleteView);

  const handleSave = () => {
    const name = prompt(t("progress.savedViews.namePrompt"));
    if (name?.trim()) saveView(name.trim());
  };

  return (
    <div className="premium-card space-y-2 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-accent-900">
          {t("progress.savedViews.title")}
        </h3>
        <button
          type="button"
          onClick={handleSave}
          className="text-xs font-semibold text-brand-violet"
        >
          {t("progress.savedViews.saveCurrent")}
        </button>
      </div>
      {savedViews.length === 0 ? (
        <p className="text-xs text-accent-500">{t("progress.savedViews.empty")}</p>
      ) : (
        <ul className="space-y-1">
          {savedViews.map((v) => (
            <li key={v.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadView(v.id)}
                className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent-50"
              >
                <Bookmark className="h-3.5 w-3.5 text-brand-amber" />
                {v.name}
              </button>
              <button
                type="button"
                onClick={() => deleteView(v.id)}
                aria-label={t("progress.savedViews.delete")}
                className="p-1 text-accent-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
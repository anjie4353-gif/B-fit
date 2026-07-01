"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  ChevronLeft,
  LayoutDashboard,
  LineChart,
  Settings,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/useUserStore";
import { displayName } from "@/lib/profile/account-age";
import { useTranslation } from "@/components/i18n/i18n-provider";
import type { DashboardSection } from "../../types";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";

const nav: { id: DashboardSection; icon: typeof LayoutDashboard }[] = [
  { id: "overview", icon: LayoutDashboard },
  { id: "daily", icon: LineChart },
  { id: "weekly", icon: BarChart3 },
  { id: "reports", icon: CalendarRange },
  { id: "settings", icon: Settings },
];

export function DashboardSidebar() {
  const { t } = useTranslation();
  const section = useProgressDashboardStore((s) => s.section);
  const setSection = useProgressDashboardStore((s) => s.setSection);
  const collapsed = useProgressDashboardStore((s) => s.sidebarCollapsed);
  const mobileOpen = useProgressDashboardStore((s) => s.sidebarMobileOpen);
  const toggleSidebar = useProgressDashboardStore((s) => s.toggleSidebar);
  const setMobileOpen = useProgressDashboardStore((s) => s.setSidebarMobileOpen);
  const profile = useUserStore((s) => s.profile);
  const name = displayName(profile?.fullName, profile?.nickname);

  const content = (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-accent-200/60 bg-white/90 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[56px]" : "w-[200px]"
      )}
      aria-label={t("progress.sidebar.navLabel")}
    >
      <div className="flex items-center justify-between p-3">
        {!collapsed && (
          <span className="font-display text-sm font-bold text-accent-900">
            {t("progress.title")}
          </span>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flip-icon-ring hidden h-8 w-8 md:flex"
          aria-label={
            collapsed ? t("progress.sidebar.expand") : t("progress.sidebar.collapse")
          }
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="flip-icon-ring h-8 w-8 md:hidden"
          aria-label={t("progress.sidebar.closeMenu")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {nav.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setSection(id);
              setMobileOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              section === id
                ? "bg-gradient-to-r from-violet-100 to-white text-accent-900 shadow-elev-1"
                : "text-accent-500 hover:bg-accent-50"
            )}
            aria-current={section === id ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t(`progress.sections.${id}`)}</span>}
          </button>
        ))}
      </nav>

      <div className="border-t border-accent-200/60 p-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-xl p-2 hover:bg-accent-50"
        >
          <div className="flip-icon-ring h-8 w-8 shrink-0">
            <User className="h-4 w-4 text-brand-violet" />
          </div>
          {!collapsed && (
            <span className="truncate text-xs font-medium text-accent-700">{name}</span>
          )}
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden shrink-0 md:block">{content}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label={t("progress.sidebar.closeOverlay")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full shadow-elev-4">{content}</div>
        </div>
      )}
    </>
  );
}
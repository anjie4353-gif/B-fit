"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  CalendarHeart,
  Sparkles,
  Bell,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/useUserStore";
import { ReminderEngine } from "@/components/plan/reminder-engine";
import { ReminderAlert } from "@/components/plan/reminder-alert";
import { MeshBackground } from "@/components/layout/mesh-background";
import { useTranslation } from "@/components/i18n/i18n-provider";

const baseNavItems = [
  { href: "/home", labelKey: "nav.home", icon: Home },
  { href: "/plan", labelKey: "nav.plan", icon: Bell },
  { href: "/chat", labelKey: "nav.coach", icon: MessageCircle },
  {
    href: "/tracker",
    labelKey: "nav.cycle",
    icon: CalendarHeart,
    femaleOnly: true,
  },
  { href: "/wellness", labelKey: "nav.wellness", icon: Sparkles },
  { href: "/progress-dashboard", labelKey: "nav.progress", icon: BarChart3 },
];

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const isFemale = profile?.gender === "female";

  const hideNav =
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname === "/welcome" ||
    pathname === "/language";

  const navItems = baseNavItems.filter(
    (item) => !item.femaleOnly || isFemale
  );

  return (
    <MeshBackground>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <ReminderEngine />
        <ReminderAlert />
        <main className={cn("flex-1", !hideNav && "pb-24")}>{children}</main>

        {!hideNav && (
          <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
            <div className="premium-dock flex items-center justify-around">
              {navItems.map(({ href, labelKey, icon: Icon }) => {
                const active = pathname === href;
                const label = t(labelKey);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative flex min-h-[52px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition-all duration-200",
                      active
                        ? "premium-dock-item-active text-accent-700"
                        : "text-accent-400 hover:text-accent-500"
                    )}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active && "text-accent-600"
                      )}
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                    <span
                      className={cn(
                        "text-[11px]",
                        active ? "font-semibold text-accent-900" : "font-medium"
                      )}
                    >
                      {label}
                    </span>
                    {active && (
                      <span className="absolute -bottom-0.5 h-0.5 w-6 rounded-full bg-gradient-to-r from-brand-violet to-brand-coral" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </MeshBackground>
  );
}
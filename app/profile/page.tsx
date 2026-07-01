"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Globe,
  Droplets,
  History,
  Settings,
  Shield,
  LogOut,
  Camera,
  Lock,
  Calendar,
  Clock,
} from "lucide-react";
import { useUserStore } from "@/hooks/useUserStore";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WaterReminderPanel } from "@/components/hydration/water-reminder-panel";
import {
  canChangeLanguage,
  canEditProfile,
  daysUntilEditUnlock,
  getEditLockMessage,
} from "@/lib/profile/edit-lock";
import {
  displayName,
  formatAccountAge,
  formatJoinedDate,
} from "@/lib/profile/account-age";
import type { AppLanguage } from "@/types";
import { syncWaterNotificationSchedule } from "@/lib/hydration/water-reminders";

export default function ProfilePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const firstInstallDate = useUserStore((s) => s.firstInstallDate);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const clearSession = useUserStore((s) => s.clearSession);
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile?.consentGiven) router.replace("/onboarding");
  }, [profile, router]);

  if (!profile) return null;

  const registeredAt =
    profile.registeredAt ?? profile.onboardedAt ?? firstInstallDate;
  const editable = canEditProfile(registeredAt);
  const languageEditable = canChangeLanguage(profile.consentGiven);
  const daysLeft = daysUntilEditUnlock(registeredAt);
  const settings = profile.waterReminderSettings;
  const name = displayName(profile.fullName, profile.nickname);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ profilePhoto: reader.result as string });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleLanguageChange = async (lang: AppLanguage) => {
    setLanguage(lang);
    if (settings) {
      await syncWaterNotificationSchedule(
        settings,
        profile.nickname ?? profile.fullName,
        lang
      );
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    if (confirm(t("profile.logoutConfirm"))) {
      clearSession();
      router.replace("/");
    }
  };

  return (
    <div className="space-y-5 px-4 py-6 premium-section">
      <header>
        <h1 className="text-display font-display text-gradient-premium">
          {t("profile.title")}
        </h1>
        <p className="mt-1 text-sm text-accent-500">
          {t("home.hello")} {name}
        </p>
      </header>

      <div className="premium-card overflow-hidden p-5 shadow-elev-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => editable && fileRef.current?.click()}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-violet to-brand-coral shadow-elev-2"
            disabled={!editable}
          >
            {profile.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profilePhoto}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-9 w-9 text-white" />
              </div>
            )}
            {editable && (
              <span className="absolute bottom-1 right-1 rounded-full bg-white/90 p-1 shadow">
                <Camera className="h-3 w-3 text-accent-700" />
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xl font-bold text-accent-900">
              {profile.fullName ?? profile.name ?? "—"}
            </p>
            {profile.nickname && (
              <p className="text-sm text-accent-500">@{profile.nickname}</p>
            )}
            <p className="mt-1 text-xs text-accent-400">
              {editable ? t("profile.changePhoto") : t("profile.editLocked")}
            </p>
          </div>
        </div>
      </div>

      {!editable && (
        <div className="premium-card flex items-start gap-3 border-amber-200/60 bg-amber-50/80 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
          <div>
            <p className="text-sm font-medium text-accent-800">
              {getEditLockMessage(language)}
            </p>
            <p className="mt-1 text-xs text-accent-500">
              {daysLeft} {t("profile.daysRemaining")}
            </p>
          </div>
        </div>
      )}

      <div className="premium-card space-y-4 p-5">
        <ProfileRow
          icon={User}
          label={t("profile.fullName")}
          value={
            editable ? (
              <Input
                value={profile.fullName ?? ""}
                disabled={!editable}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                className="h-10"
              />
            ) : (
              profile.fullName ?? "—"
            )
          }
        />
        <ProfileRow
          icon={User}
          label={t("profile.nickname")}
          value={
            editable ? (
              <Input
                value={profile.nickname ?? ""}
                disabled={!editable}
                onChange={(e) => updateProfile({ nickname: e.target.value })}
                className="h-10"
              />
            ) : (
              profile.nickname ?? t("profile.notSet")
            )
          }
        />
        <ProfileRow
          icon={Globe}
          label={t("profile.language")}
          value={
            languageEditable ? (
              <select
                className="glass-input h-10 w-full rounded-xl px-3 text-sm"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName}
                  </option>
                ))}
              </select>
            ) : (
              SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName ?? "—"
            )
          }
        />
        <ProfileRow
          icon={Droplets}
          label={t("profile.waterGoal")}
          value={`${settings?.dailyGlasses ?? 8} ${t("profile.glasses")}`}
        />
        <ProfileRow
          icon={Calendar}
          label={t("profile.joined")}
          value={formatJoinedDate(registeredAt)}
        />
        <ProfileRow
          icon={Clock}
          label={t("profile.accountAge")}
          value={formatAccountAge(registeredAt)}
        />
      </div>

      <WaterReminderPanel />

      <div className="space-y-2">
        <ActionLink href="/profile/reminder-history" icon={History} label={t("profile.reminderHistory")} />
        <ActionLink href="/profile/privacy" icon={Shield} label={t("profile.privacyPolicy")} />
        <ActionLink href="/plan" icon={Settings} label={t("profile.appSettings")} />
      </div>

      {saved && (
        <p className="text-center text-xs font-medium text-brand-teal">
          {t("profile.settingsSaved")}
        </p>
      )}

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        {t("profile.logout")}
      </Button>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm text-accent-800">{value}</div>
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="premium-card flex items-center gap-3 p-4 transition-all active:scale-[0.98]"
    >
      <div className="flip-icon-ring h-10 w-10">
        <Icon className="h-4 w-4 text-brand-violet" />
      </div>
      <span className="font-medium text-accent-800">{label}</span>
    </Link>
  );
}
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { bootstrapNotificationsOnOnboarding } from "@/components/notifications/notification-bootstrap";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { displayName } from "@/lib/profile/account-age";
import { useUserStore } from "@/hooks/useUserStore";

export default function WelcomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, wellnessPlan, planReady } = useUserStore();
  const name = displayName(profile?.fullName, profile?.nickname);

  useEffect(() => {
    if (!profile?.consentGiven) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  if (!profile) return null;

  return (
    <div className="flex min-h-dvh flex-col px-5 py-8">
      <div className="mb-6 text-center">
        <div className="glass-btn-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </div>
        <h1 className="font-display text-2xl font-bold text-accent-900">
          {name !== "there" ? `${t("home.hello")} ${name}! ` : ""}
          {t("welcome.planReady")}
        </h1>
        <p className="mt-2 text-sm text-accent-500">
          {planReady
            ? "Real-time reminders are scheduled for today"
            : "Open Plan to refresh if needed"}
        </p>
      </div>

      <InstallPrompt className="mb-4" />

      <Card className="flex-1">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-accent-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI coach summary</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-accent-700 leading-relaxed max-h-48 overflow-y-auto">
            {wellnessPlan?.summary ??
              "Your personalized wellness plan will appear on the Plan tab."}
          </p>
          <div className="glass-subtle rounded-xl p-3 text-xs text-accent-600">
            <Bell className="mb-1 inline h-3.5 w-3.5" /> Enable notifications when
            prompted so water &amp; meal alerts reach you even when the app is in
            the background.
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={() => bootstrapNotificationsOnOnboarding()}
        >
          <Bell className="h-5 w-5" />
          {t("welcome.enableAlerts")}
        </Button>
        <Button asChild size="lg" className="w-full" variant="secondary">
          <Link href="/plan">
            View Today&apos;s Plan
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/install">Install App / Download APK</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/home">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
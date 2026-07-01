"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  Droplets,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlipCard } from "@/components/ui/flip-card";
import { APP_TAGLINE } from "@/lib/brand";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { useTranslation } from "@/components/i18n/i18n-provider";

const features = [
  {
    icon: CalendarHeart,
    title: "Period Tracking",
    desc: "Smart cycle predictions & gentle reminders",
    back: "Log your cycle, get phase-aware tips, and never be caught off guard.",
    gradient: "flip-gradient-rose",
    iconColor: "text-brand-rose",
  },
  {
    icon: Heart,
    title: "PCOD Support",
    desc: "Lifestyle tips tailored for PCOS wellness",
    back: "Nutrition, movement & mindfulness plans designed for hormonal balance.",
    gradient: "flip-gradient-coral",
    iconColor: "text-brand-coral",
  },
  {
    icon: MessageCircle,
    title: "AI Coach",
    desc: "24/7 compassionate wellness guidance",
    back: "Ask anything — diet, workouts, mood, or cycle questions. Always private.",
    gradient: "flip-gradient-violet",
    iconColor: "text-brand-violet",
  },
  {
    icon: Droplets,
    title: "Daily Wellness",
    desc: "Water, sleep, movement & mood tracking",
    back: "Track glasses, steps, sleep & mood in one beautiful daily snapshot.",
    gradient: "flip-gradient-teal",
    iconColor: "text-brand-teal",
  },
];

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-dvh flex-col premium-section">
      <header className="px-5 pt-12 pb-6">
        <div className="premium-card inline-flex px-4 py-3 shadow-elev-3">
          <BrandLockup markSize={48} wordmarkSize="sm" />
        </div>
      </header>

      <section className="flex-1 px-5">
        <div className="premium-badge mb-4">
          <Sparkles className="h-3 w-3 text-brand-gold" />
          AI-Powered Wellness
        </div>

        <h1 className="font-display leading-[1.05] tracking-tight">
          <BrandWordmark size="lg" showTagline={false} />
          <span className="mt-3 block text-[2rem] font-extrabold text-accent-900">
            {t("landing.forEveryBody")}
          </span>
        </h1>

        <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-accent-500">
          {APP_TAGLINE} — period tracking, PCOD support, fitness coaching, and
          smart PWA reminders in one app.
        </p>

        <p className="mt-5 flex items-center gap-1.5 text-label text-accent-400">
          <RotateCcw className="h-3 w-3" />
          {t("landing.tapCards")}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3.5">
          {features.map(({ icon: Icon, title, desc, back, gradient, iconColor }) => (
            <FlipCard
              key={title}
              gradientClass={gradient}
              height="h-[178px]"
              front={
                <div className="relative z-[3] flex h-full flex-col justify-between p-4">
                  <div className="flip-icon-ring h-11 w-11">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-accent-900">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-accent-600/90">
                      {desc}
                    </p>
                  </div>
                  <span className="flip-hint">Flip for more</span>
                </div>
              }
              back={
                <div className="relative z-[3] flex h-full flex-col justify-between p-4">
                  <div className="flip-icon-ring h-11 w-11">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-accent-800">
                    {back}
                  </p>
                  <span className="flip-hint">Tap to flip back</span>
                </div>
              }
            />
          ))}
        </div>

        <div className="premium-card mt-6 flex items-start gap-3 p-4 shadow-elev-2">
          <div className="flip-icon-ring h-9 w-9 shrink-0">
            <Shield className="h-4 w-4 text-brand-teal" />
          </div>
          <p className="text-xs font-medium leading-relaxed text-accent-600">
            {t("landing.privacyNote")}
          </p>
        </div>
      </section>

      <footer className="sticky bottom-0 px-5 pb-8 pt-6">
        <div className="premium-card p-5 shadow-elev-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/language">
              {t("landing.getStarted")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-3.5 text-center text-xs font-medium text-accent-400">
            <Link href="/install" className="underline decoration-accent-300 hover:text-accent-600">
              {t("landing.installApk")}
            </Link>
            {" · "}{t("common.free")} · {t("common.private")}
          </p>
        </div>
      </footer>
    </div>
  );
}
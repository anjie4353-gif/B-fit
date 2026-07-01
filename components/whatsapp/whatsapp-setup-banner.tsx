"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, KeyRound, RefreshCw } from "lucide-react";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { cn } from "@/lib/utils";

const SETUP_STEPS = [
  "Open developers.facebook.com → My Apps → Create App (Business type) → Add WhatsApp product.",
  "WhatsApp → API Setup: copy Phone Number ID and generate a permanent System User access token.",
  "Under API Setup → \"To\", click Manage phone number list and add your WhatsApp number (+91…) as a test recipient. Confirm the OTP on your phone.",
  "Paste keys into herhealth-ai/.env.local (see below), save the file, then restart npm run dev.",
  "Return here and tap \"Send to phone now\" on the WhatsApp tab.",
];

export function WhatsAppSetupBanner({
  className,
  phone,
}: {
  className?: string;
  phone?: string;
}) {
  const { configured, hasPhoneNumberId, hasAccessToken, loading } =
    useWhatsAppStatus();
  const [open, setOpen] = useState(!configured);

  if (loading || configured) return null;

  return (
    <div
      className={cn(
        "mx-3 mt-3 rounded-xl border border-accent-200 bg-accent-50 p-3 shadow-elev-1",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 text-left"
      >
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-accent-900">
            In-app preview only — WhatsApp API not configured
          </p>
          <p className="mt-1 text-xs text-accent-600">
            Messages appear in this app only until Meta Cloud API keys are set in{" "}
            <code className="rounded bg-white/80 px-1">.env.local</code>.
            {phone ? (
              <>
                {" "}
                Target: <span className="font-medium">{phone}</span>
              </>
            ) : null}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-accent-600" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-accent-600" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-accent-200 pt-3">
          <div className="flex items-start gap-2 rounded-lg border border-accent-300/80 bg-accent-50/90 p-2.5 text-xs text-accent-800">
            <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              After editing <code>.env.local</code>, you must restart the dev server
              for keys to load. Status check:{" "}
              <a
                href="/api/whatsapp/status"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                /api/whatsapp/status
              </a>{" "}
              should show <code>{'"configured":true'}</code>.
            </p>
          </div>

          <ol className="list-decimal space-y-1.5 pl-4 text-xs text-accent-700">
            {SETUP_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="rounded-lg bg-white/90 p-3 font-mono text-[11px] text-accent-800 shadow-elev-1">
            <p className={hasPhoneNumberId ? "text-success-600" : "text-accent-600"}>
              WHATSAPP_PHONE_NUMBER_ID=
              {hasPhoneNumberId ? "✓ set" : "← empty (required)"}
            </p>
            <p className={hasAccessToken ? "text-success-600" : "text-accent-600"}>
              WHATSAPP_ACCESS_TOKEN=
              {hasAccessToken ? "✓ set" : "← empty (required)"}
            </p>
            <p>WHATSAPP_VERIFY_TOKEN=bfit_verify</p>
          </div>

          <div className="rounded-lg border border-accent-200 bg-white/80 p-3 text-xs text-accent-700">
            <p className="font-medium text-accent-900">Real-time replies (deploy)</p>
            <p className="mt-1">
              In Meta → WhatsApp → Configuration, set Webhook URL to:
            </p>
            <code className="mt-1 block break-all rounded bg-accent-50 p-2 text-[10px]">
              {typeof window !== "undefined"
                ? `${window.location.origin}/api/whatsapp/webhook`
                : "https://YOUR_DOMAIN/api/whatsapp/webhook"}
            </code>
            <p className="mt-2">
              Verify token: <code>bfit_verify</code> (or your WHATSAPP_VERIFY_TOKEN).
              Subscribe to <strong>messages</strong>. Each user&apos;s phone from onboarding
              is matched automatically — no fixed number.
            </p>
          </div>

          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 underline"
          >
            Meta WhatsApp Cloud API docs
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
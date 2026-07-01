import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { MobileShell } from "@/components/layout/mobile-shell";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { LanguageGate } from "@/components/routing/language-gate";
import { NotificationBootstrap } from "@/components/notifications/notification-bootstrap";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { StoreHydration } from "@/components/providers/store-hydration";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "B-Fit — Indian Health & Wellness",
  description:
    "B-Fit: AI wellness PWA for Indian men and women — real-time plans, smart reminders, period tracking, and PCOD support.",
  manifest: "/manifest.webmanifest",
  applicationName: "B-Fit",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "B-Fit",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f5f3ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full antialiased">
        <PwaProvider>
          <StoreHydration>
            <I18nProvider>
              <LanguageGate>
                <NotificationBootstrap />
                <MobileShell>{children}</MobileShell>
              </LanguageGate>
            </I18nProvider>
          </StoreHydration>
        </PwaProvider>
      </body>
    </html>
  );
}
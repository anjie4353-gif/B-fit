import type { CapacitorConfig } from "@capacitor/cli";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://your-app.vercel.app";

const config: CapacitorConfig = {
  appId: "com.bfit.wellness",
  appName: "B-Fit",
  webDir: "capacitor-www",
  server: {
    url: appUrl,
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
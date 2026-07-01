import type { MetadataRoute } from "next";
import { PWA_ICON_URLS } from "@/lib/pwa/icon-urls";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "B-Fit — Wellness Coach",
    short_name: "B-Fit",
    description:
      "AI wellness coach with real-time reminders for Indian men and women",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#002B5B",
    theme_color: "#002B5B",
    categories: ["health", "lifestyle", "fitness"],
    prefer_related_applications: false,
    icons: [
      {
        src: PWA_ICON_URLS.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICON_URLS.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICON_URLS.maskable192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PWA_ICON_URLS.maskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PWA_ICON_URLS.appleTouch,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
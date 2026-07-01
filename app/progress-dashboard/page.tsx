"use client";

import dynamic from "next/dynamic";
import { ProgressLoading } from "@/modules/progress-dashboard/components/states/ProgressLoading";

const ProgressDashboardPage = dynamic(
  () =>
    import("@/modules/progress-dashboard/pages/ProgressDashboardPage"),
  {
    ssr: false,
    loading: () => <ProgressLoading />,
  }
);

export default function ProgressDashboardRoute() {
  return <ProgressDashboardPage />;
}
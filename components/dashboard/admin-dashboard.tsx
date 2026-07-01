"use client";

import {
  Users,
  Activity,
  Heart,
  MessageSquare,
  CalendarClock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/hooks/useUserStore";
import { calculatePeriodPrediction, getPeriodReminderType } from "@/lib/period";

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-accent-500">{label}</p>
          <p className="text-xl font-bold text-accent-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { profile, chatMessages, dailyLogs } = useUserStore();

  const hasPcod = profile?.pcod?.hasPcod ?? false;
  const prediction = profile?.lastPeriodDate
    ? calculatePeriodPrediction(
        profile.lastPeriodDate,
        profile.cycleLength ?? "irregular"
      )
    : null;
  const periodAlert = prediction
    ? getPeriodReminderType(prediction.daysUntilPeriod)
    : null;

  const today = new Date().toISOString().split("T")[0];
  const loggedToday = dailyLogs.some((l) => l.date === today);

  return (
    <div className="space-y-4 px-4 py-4">
      <div>
        <h1 className="text-display font-display">
          Dashboard
        </h1>
        <p className="text-caption">
          Session analytics (device-local, no server storage)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Users}
          label="Session"
          value={profile ? 1 : 0}
          color="bg-accent-100 text-accent-600"
        />
        <MetricCard
          icon={Activity}
          label="Active Today"
          value={loggedToday ? 1 : 0}
          color="bg-accent-100 text-accent-700"
        />
        <MetricCard
          icon={Heart}
          label="PCOD Profile"
          value={hasPcod ? "Yes" : "No"}
          color="bg-accent-100 text-accent-600"
        />
        <MetricCard
          icon={MessageSquare}
          label="Messages"
          value={chatMessages.length}
          color="bg-accent-200 text-accent-700"
        />
        <MetricCard
          icon={CalendarClock}
          label="Period Alert"
          value={periodAlert ? "Active" : "None"}
          color="bg-accent-100 text-accent-800"
        />
        <MetricCard
          icon={AlertCircle}
          label="Failed Delivery"
          value={0}
          color="bg-accent-100 text-accent-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-accent-500">Daily logs</span>
              <span className="font-medium text-accent-900">
                {dailyLogs.length}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-accent-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all"
                style={{
                  width: `${Math.min(dailyLogs.length * 20, 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span className="text-accent-500">Chat interactions</span>
              <span className="font-medium text-accent-900">
                {chatMessages.filter((m) => m.role === "user").length}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-accent-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-600 transition-all"
                style={{
                  width: `${Math.min(chatMessages.length * 10, 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span className="text-accent-500">Onboarding complete</span>
              <span className="font-medium text-accent-900">
                {profile?.consentGiven ? "Yes" : "No"}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-accent-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all"
                style={{
                  width: profile?.consentGiven ? "100%" : "0%",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scheduled Automations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {(profile?.gender === "male"
              ? [
                  { time: "6:00 AM", msg: "Wake up + water + sunlight" },
                  { time: "7:00 AM", msg: "Protein breakfast" },
                  { time: "9:00 AM", msg: "Hydration" },
                  { time: "11:00 AM", msg: "Movement break" },
                  { time: "1:00 PM", msg: "Balanced lunch" },
                  { time: "4:00 PM", msg: "Healthy snack" },
                  { time: "6:00 PM", msg: "Steps / exercise" },
                  { time: "8:00 PM", msg: "Light dinner" },
                  { time: "10:00 PM", msg: "Sleep prep" },
                  { time: "10:30 PM", msg: "Sleep reminder" },
                ]
              : [
                  { time: "6:00 AM", msg: "Wake + hydration + sunlight" },
                  { time: "7:30 AM", msg: "Protein breakfast" },
                  { time: "10:00 AM", msg: "Water reminder" },
                  { time: "1:00 PM", msg: "Balanced lunch" },
                  { time: "4:00 PM", msg: "Healthy snack" },
                  { time: "6:00 PM", msg: "Walk / exercise 30-45 min" },
                  { time: "8:00 PM", msg: "Light dinner" },
                  { time: "10:00 PM", msg: "Sleep preparation" },
                  { time: "10:30 PM", msg: "Sleep 7-9 hrs" },
                ]
            ).map((item) => (
              <div
                key={item.time}
                className="flex items-center justify-between rounded-xl bg-accent-50 px-3 py-2"
              >
                <span className="font-medium text-accent-700">{item.time}</span>
                <span className="text-accent-500">{item.msg}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}